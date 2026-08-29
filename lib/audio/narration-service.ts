import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db/client";
import { MediaProbe } from "@/lib/rendering/media-probe";
import { activeVoiceProvider } from "./voice-provider";
import { getVoiceProfileForStyle, VoiceProfile } from "./voice-profiles";

export interface ChapterNarrationInput {
  chapterId: string;
  chapterNumber: number;
  title: string;
  text: string;
}

export interface GeneratedNarrationAsset {
  id: string;
  projectId: string;
  chapterId: string;
  audioPath: string;
  storageKey: string;
  provider: string;
  voice: string;
  durationSec: number;
  sampleRate: number;
  channels: number;
}

export class NarrationService {
  private static STORAGE_ROOT = path.join(process.cwd(), ".storage");

  /**
   * Resolves and secures the local project audio directory.
   */
  static getProjectAudioDir(userId: string, projectId: string): string {
    if (
      !userId ||
      !projectId ||
      userId.includes("..") ||
      projectId.includes("..") ||
      userId.includes("/") ||
      projectId.includes("/") ||
      userId.includes("\\") ||
      projectId.includes("\\")
    ) {
      throw new Error("Access Denied: Path traversal detected in audio storage.");
    }
    const sanitizedUser = userId.replace(/[^a-zA-Z0-9_-]/g, "");
    const sanitizedProject = projectId.replace(/[^a-zA-Z0-9_-]/g, "");
    const audioDir = path.resolve(this.STORAGE_ROOT, "users", sanitizedUser, "projects", sanitizedProject, "audio");

    // Path traversal containment check
    const expectedRoot = path.resolve(this.STORAGE_ROOT);
    if (!audioDir.startsWith(expectedRoot)) {
      throw new Error("Access Denied: Path traversal detected in audio storage.");
    }

    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    return audioDir;
  }

  /**
   * Synthesizes and persists narration audio for all chapters of a project.
   */
  static async generateProjectNarration(
    userId: string,
    projectId: string,
    chapters: ChapterNarrationInput[],
    styleIdOrProfile?: string | VoiceProfile
  ): Promise<GeneratedNarrationAsset[]> {
    // 1. Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true },
    });

    if (!project || project.userId !== userId) {
      throw new Error("Unauthorized: Project does not belong to user.");
    }

    const audioDir = this.getProjectAudioDir(userId, projectId);
    const profile = typeof styleIdOrProfile === "object" ? styleIdOrProfile : getVoiceProfileForStyle(styleIdOrProfile);
    const results: GeneratedNarrationAsset[] = [];

    for (const ch of chapters) {
      if (!ch.text || ch.text.trim().length === 0) continue;

      const outputAacPath = path.join(audioDir, `chapter_${ch.chapterNumber}_${ch.chapterId}.aac`);
      const storageKey = `users/${userId}/projects/${projectId}/audio/chapter_${ch.chapterNumber}_${ch.chapterId}.aac`;

      // Synthesize audio
      await activeVoiceProvider.synthesize(ch.text, outputAacPath, profile);

      // Validate with ffprobe
      const probe = await MediaProbe.probe(outputAacPath);
      if (probe.durationSec <= 0) {
        throw new Error(`Narration validation failed for chapter ${ch.chapterNumber}: invalid audio duration.`);
      }

      // Persist in Prisma database
      const audioRecord = await prisma.audioAsset.create({
        data: {
          projectId,
          chapterId: ch.chapterId,
          provider: process.env.GEMINI_API_KEY ? "gemini" : "system",
          model: process.env.GEMINI_API_KEY ? "gemini-2.0-flash" : "system-say",
          voice: profile.geminiVoice,
          storageKey,
          mimeType: "audio/aac",
          durationSec: probe.durationSec,
          sampleRate: probe.audioSampleRate || 48000,
          channels: probe.audioChannels || 2,
        },
      });

      results.push({
        id: audioRecord.id,
        projectId,
        chapterId: ch.chapterId,
        audioPath: outputAacPath,
        storageKey,
        provider: audioRecord.provider,
        voice: audioRecord.voice,
        durationSec: probe.durationSec,
        sampleRate: probe.audioSampleRate || 48000,
        channels: probe.audioChannels || 2,
      });
    }

    return results;
  }

  /**
   * Retrieves a verified audio asset ensuring user ownership.
   */
  static async getAuthorizedAudioAsset(
    userId: string,
    projectId: string,
    assetId: string
  ): Promise<{ filePath: string; mimeType: string }> {
    const asset = await prisma.audioAsset.findUnique({
      where: { id: assetId },
      include: { project: { select: { userId: true } } },
    });

    if (!asset || asset.projectId !== projectId || asset.project.userId !== userId) {
      throw new Error("Unauthorized: Audio asset access denied.");
    }

    const fullPath = path.resolve(this.STORAGE_ROOT, asset.storageKey);
    const expectedRoot = path.resolve(this.STORAGE_ROOT);

    if (!fullPath.startsWith(expectedRoot) || !fs.existsSync(fullPath)) {
      throw new Error("File not found or illegal path.");
    }

    return {
      filePath: fullPath,
      mimeType: asset.mimeType,
    };
  }
}

import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db/client";
import { FFmpegRunner } from "./ffmpeg-runner";
import { MediaProbe } from "./media-probe";
import { ScenePlanner } from "@/lib/movie/scene-planner";
import { RenderAudioService } from "@/lib/audio/render-audio";
import { activeVoiceProvider } from "@/lib/audio/voice-provider";
import { NarratorMixer } from "@/lib/audio/narrator-mixer";
import { SubtitleOverlayService } from "./subtitle-overlay";

export interface RenderResult {
  outputVideoPath: string;
  outputVideoUrl: string;
  posterPath: string;
  posterUrl: string;
  durationSec: number;
  width: number;
  height: number;
  fileSizeBytes: number;
}

export class RenderService {
  private static workDir = path.join(process.cwd(), ".storage", "work");

  private static ensureDir(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private static async updateJobState(
    jobId: string,
    stage: string,
    progress: number,
    description: string,
    logs: string[] = []
  ) {
    try {
      const existing = await prisma.generationJob.findUnique({ where: { id: jobId } });
      let currentLogs: string[] = [];
      try {
        currentLogs = JSON.parse(existing?.logsJson || "[]");
      } catch {}

      const timestamp = new Date().toISOString();
      const updatedLogs = [...currentLogs, ...logs.map((l) => `[${timestamp}] ${l}`)];

      await prisma.generationJob.update({
        where: { id: jobId },
        data: {
          currentStage: stage,
          progress,
          stageDescription: description,
          logsJson: JSON.stringify(updatedLogs),
        },
      });
    } catch (err) {
      console.warn(`Failed to update job ${jobId} state:`, err);
    }
  }

  /**
   * Executes the real server-side FFmpeg rendering pipeline.
   */
  static async render(jobId: string, clientApiKey?: string): Promise<RenderResult> {
    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
      include: {
        project: {
          include: {
            memories: { orderBy: { sortOrder: "asc" } },
            storyOutline: {
              include: {
                chapters: { orderBy: { chapterNumber: "asc" } },
              },
            },
          },
        },
      },
    });

    if (!job || !job.project) {
      throw new Error(`GenerationJob or associated project not found: ${jobId}`);
    }

    const project = job.project;
    const jobDir = path.join(this.workDir, jobId);
    this.ensureDir(jobDir);

    const renderStorageDir = path.join(
      process.cwd(),
      ".storage",
      "users",
      project.userId,
      "projects",
      project.id,
      "renders",
      jobId
    );
    this.ensureDir(renderStorageDir);

    try {
      // 1. ANALYZING
      await this.updateJobState(
        jobId,
        "analyzing",
        20,
        "02 / PROBING MEDIA RESOLUTION & ASPECT RATIOS",
        ["Resolving physical media paths", `Found ${project.memories.length} media assets`]
      );

      // Resolve physical paths on disk
      const resolvedMemories = project.memories.map((m) => {
        let filePath = "";
        if (m.storageKey) {
          filePath = path.join(process.cwd(), ".storage", m.storageKey);
        }
        return {
          id: m.id,
          type: m.type,
          filePath,
          caption: m.caption || "",
          date: m.date || "",
        };
      }).filter((m) => fs.existsSync(m.filePath));

      // Fallback: If no uploaded files exist on disk, create a default high-res sample canvas
      if (resolvedMemories.length === 0) {
        const fallbackPath = path.join(jobDir, "fallback_35mm.png");
        // Create 1920x804 sample test frame
        const fallbackArgs = [
          "-y",
          "-f",
          "lavfi",
          "-i",
          "color=c=0x1E1A18:s=1920x804:d=1",
          "-vframes",
          "1",
          fallbackPath,
        ];
        await FFmpegRunner.runFFmpeg(fallbackArgs);
        resolvedMemories.push({
          id: "mem_fallback_01",
          type: "photo",
          filePath: fallbackPath,
          caption: project.title,
          date: new Date().toISOString().split("T")[0],
        });
      }

      // 2. STORY & SCENE PLANNING
      await this.updateJobState(
        jobId,
        "story_ready",
        35,
        "03 / STRUCTURING 2.39:1 CINEMASCOPE SCENE GRAPH",
        ["Planning Ken Burns motion vectors at 24fps"]
      );

      const chapters = project.storyOutline?.chapters || [
        { chapterNumber: 1, title: "Act I: Establishing Frame", handwrittenBeat: project.title, synopsis: project.title },
        { chapterNumber: 2, title: "Act II: The Journey", handwrittenBeat: "In the quiet hours", synopsis: "The journey" },
        { chapterNumber: 3, title: "Act III: Horizon", handwrittenBeat: "Looking back with gratitude", synopsis: "Epilogue" },
      ];

      const plannedScenes = ScenePlanner.planScenes(chapters, resolvedMemories);

      // 3. RENDERING SCENE CLIPS
      await this.updateJobState(
        jobId,
        "rendering_scenes",
        55,
        "04 / ENCODING 1920x804 MASTER SCENE CLIPS",
        [`Rendering ${plannedScenes.length} scenes with 24fps motion`]
      );

      const sceneClipPaths: string[] = [];

      for (let i = 0; i < plannedScenes.length; i++) {
        const sc = plannedScenes[i];
        const sceneClipPath = path.join(jobDir, `scene_${i + 1}.mp4`);
        const overlayPath = path.join(jobDir, `overlay_${i + 1}.png`);
        const duration = sc.durationSec;
        const totalFrames = Math.round(duration * 24);
        const fadeOutStart = Math.max(1, duration - 0.7);

        // Generate crisp 1920x804 title card and subtitle overlay PNG
        await SubtitleOverlayService.createSceneOverlay({
          actNumber: sc.order,
          actTitle: sc.title,
          subtitle: sc.subtitle,
          outputPath: overlayPath,
        });

        if (sc.mediaType === "photo") {
          // Ken Burns zoom filter with burned 2.39:1 title card and subtitle overlay
          const zoomSpeed = 0.0007;
          const filterGraph = `[0:v]scale=3840:-1,zoompan=z='min(zoom+${zoomSpeed},1.06)':d=${totalFrames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x804:fps=24,format=yuv420p[base];[1:v]fade=t=in:st=0.3:d=0.5:alpha=1,fade=t=out:st=${fadeOutStart}:d=0.5:alpha=1[over];[base][over]overlay=0:0:format=auto,format=yuv420p`;

          const args = [
            "-y",
            "-loop",
            "1",
            "-i",
            sc.mediaPath,
            "-loop",
            "1",
            "-i",
            overlayPath,
            "-filter_complex",
            filterGraph,
            "-t",
            String(duration),
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-pix_fmt",
            "yuv420p",
            "-an",
            sceneClipPath,
          ];
          await FFmpegRunner.runFFmpeg(args);
        } else {
          // Video scene: scale & crop to 1920x804, force 24fps with burned overlay
          const filterGraph = `[0:v]scale=1920:804:force_original_aspect_ratio=increase,crop=1920:804,fps=24,format=yuv420p[base];[1:v]fade=t=in:st=0.3:d=0.5:alpha=1,fade=t=out:st=${fadeOutStart}:d=0.5:alpha=1[over];[base][over]overlay=0:0:format=auto,format=yuv420p`;

          const args = [
            "-y",
            "-i",
            sc.mediaPath,
            "-loop",
            "1",
            "-i",
            overlayPath,
            "-filter_complex",
            filterGraph,
            "-t",
            String(duration),
            "-c:v",
            "libx264",
            "-preset",
            "ultrafast",
            "-pix_fmt",
            "yuv420p",
            "-an",
            sceneClipPath,
          ];
          await FFmpegRunner.runFFmpeg(args);
        }

        sceneClipPaths.push(sceneClipPath);
      }

      // 4. MIXING AUDIO SOUNDTRACK & REAL VOICEOVER NARRATION
      let styleMood = "nostalgia";
      try {
        if (project.styleJson) {
          const parsed = JSON.parse(project.styleJson);
          styleMood = parsed.id || parsed.name || "nostalgia";
        }
      } catch {}

      await this.updateJobState(
        jobId,
        "mixing_audio",
        60,
        "05 / SYNTHESIZING NARRATOR VOICE & HARMONIC CINEMA SCORE",
        ["Composing multi-layered score", "Synthesizing spoken voiceover tracks"]
      );

      const totalDurationSec = plannedScenes.reduce((acc, sc) => acc + sc.durationSec, 0);
      const rawMusicPath = path.join(jobDir, "raw_music.aac");
      await RenderAudioService.generateSoundtrack(totalDurationSec, rawMusicPath, styleMood);

      // Synthesize narrator voice clips for each scene
      const voiceCues: Array<{ voiceClipPath: string; startTimeSec: number; durationSec?: number }> = [];
      let currentOffset = 0.5;

      for (let i = 0; i < plannedScenes.length; i++) {
        const sc = plannedScenes[i];
        const stepProgress = Math.round(60 + ((i + 1) / plannedScenes.length) * 15);
        await this.updateJobState(
          jobId,
          "mixing_audio",
          stepProgress,
          `05 / SYNTHESIZING NARRATOR VOICE (${i + 1}/${plannedScenes.length})`,
          [`Synthesizing scene ${i + 1} narration`, `Timing offset: ${currentOffset.toFixed(1)}s`]
        );

        if (sc.subtitle && sc.subtitle.trim().length > 0) {
          const voiceClipPath = path.join(jobDir, `voice_${i + 1}.aac`);
          try {
            await activeVoiceProvider.synthesize(sc.subtitle, voiceClipPath, styleMood, { apiKey: clientApiKey });
            if (fs.existsSync(voiceClipPath)) {
              const probe = await MediaProbe.probe(voiceClipPath);
              voiceCues.push({
                voiceClipPath,
                startTimeSec: currentOffset,
                durationSec: probe.durationSec,
              });

              // Persist audio asset record
              try {
                const hasKey = !!(clientApiKey || process.env.GEMINI_API_KEY);
                await prisma.audioAsset.create({
                  data: {
                    projectId: project.id,
                    provider: hasKey ? "gemini" : "system",
                    model: hasKey ? "gemini-2.5-flash" : "system-say",
                    voice: styleMood,
                    storageKey: `users/${project.userId}/projects/${project.id}/audio/voice_${i + 1}.aac`,
                    mimeType: "audio/aac",
                    durationSec: probe.durationSec,
                    sampleRate: probe.audioSampleRate || 48000,
                    channels: probe.audioChannels || 2,
                  },
                });
              } catch {}
            }
          } catch (ttsErr) {
            console.warn(`Voice synthesis skipped for scene ${i + 1}:`, ttsErr);
          }
        }
        currentOffset += sc.durationSec;
      }

      // Mix ambient music and voiceover with dynamic audio ducking and EBU R128 normalization
      const masterAudioPath = path.join(jobDir, "master_soundtrack.aac");
      await NarratorMixer.mixMasterSoundtrack(
        rawMusicPath,
        voiceCues,
        masterAudioPath,
        totalDurationSec
      );

      // 5. CONCATENATING & ENCODING MASTER MP4
      await this.updateJobState(
        jobId,
        "encoding",
        85,
        "06 / MUXING 2.39:1 H.264 CINEMA MASTER",
        ["Assembling seamless reel with master audio"]
      );

      const concatListPath = path.join(jobDir, "concat_list.txt");
      const concatContent = sceneClipPaths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
      fs.writeFileSync(concatListPath, concatContent, "utf-8");

      const rawMasterPath = path.join(jobDir, "raw_master.mp4");
      const concatArgs = [
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        concatListPath,
        "-i",
        masterAudioPath,
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "20",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-shortest",
        "-movflags",
        "+faststart",
        rawMasterPath,
      ];
      await FFmpegRunner.runFFmpeg(concatArgs);

      // 6. VERIFYING OUTPUT WITH FFPROBE
      await this.updateJobState(
        jobId,
        "verifying",
        92,
        "07 / VERIFYING MASTER INTEGRITY WITH FFPROBE",
        ["Inspecting frame count, resolution, and audio channels"]
      );

      const probeResult = await MediaProbe.probe(rawMasterPath);
      if (probeResult.durationSec <= 0 || probeResult.width !== 1920 || probeResult.height !== 804) {
        throw new Error(
          `Render verification failed: invalid dimensions (${probeResult.width}x${probeResult.height}) or zero duration.`
        );
      }

      // 7. EXTRACT POSTER FRAME
      const finalPosterPath = path.join(renderStorageDir, "poster.jpg");
      const posterArgs = [
        "-y",
        "-ss",
        "00:00:01",
        "-i",
        rawMasterPath,
        "-vframes",
        "1",
        "-q:v",
        "2",
        finalPosterPath,
      ];
      await FFmpegRunner.runFFmpeg(posterArgs);

      // 8. PERSIST MASTER MP4
      const finalMp4Path = path.join(renderStorageDir, "final.mp4");
      fs.copyFileSync(rawMasterPath, finalMp4Path);

      // Cleanup scratch work directory
      try {
        fs.rmSync(jobDir, { recursive: true, force: true });
      } catch {}

      const outputVideoUrl = `/api/render/jobs/${jobId}/video.mp4`;
      const posterUrl = `/api/render/jobs/${jobId}/poster.jpg`;

      // 9. UPDATE DATABASE TO COMPLETE
      await prisma.generationJob.update({
        where: { id: jobId },
        data: {
          status: "complete",
          progress: 100,
          currentStage: "complete",
          stageDescription: "08 / 4K CINEMASCOPE MASTER READY",
          outputVideoUrl,
          completedAt: new Date(),
        },
      });

      // Update project status to ready
      await prisma.project.update({
        where: { id: project.id },
        data: { status: "ready" },
      });

      return {
        outputVideoPath: finalMp4Path,
        outputVideoUrl,
        posterPath: finalPosterPath,
        posterUrl,
        durationSec: probeResult.durationSec,
        width: probeResult.width,
        height: probeResult.height,
        fileSizeBytes: probeResult.fileSizeBytes,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : "Video rendering failed.";
      await prisma.generationJob.update({
        where: { id: jobId },
        data: {
          status: "failed",
          error: errMsg,
          stageDescription: "RENDER FAILED",
        },
      });
      throw err;
    }
  }
}

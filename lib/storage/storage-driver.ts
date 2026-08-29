import fs from "fs";
import path from "path";
import sharp from "sharp";

export interface SaveMediaResult {
  storageKey: string;
  thumbnailKey?: string;
  url: string;
  thumbnailUrl?: string;
  fileSize: number;
  width?: number;
  height?: number;
}

export class StorageDriver {
  private baseDir = path.join(process.cwd(), ".storage");

  constructor() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Persists a binary file to the standard user/project storage namespace.
   * users/{userId}/projects/{projectId}/media/{memoryId}/original.{ext}
   */
  async saveMedia(
    userId: string,
    projectId: string,
    memoryId: string,
    fileName: string,
    mimeType: string,
    buffer: Buffer
  ): Promise<SaveMediaResult> {
    const ext = fileName.split(".").pop()?.toLowerCase() || "bin";
    const dirRelative = path.join("users", userId, "projects", projectId, "media", memoryId);
    const targetDir = path.join(this.baseDir, dirRelative);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const originalFileName = `original.${ext}`;
    const originalFilePath = path.join(targetDir, originalFileName);
    fs.writeFileSync(originalFilePath, buffer);

    const storageKey = path.join(dirRelative, originalFileName).replace(/\\/g, "/");
    const publicUrl = `/api/storage/${storageKey}`;

    let thumbnailKey: string | undefined;
    let thumbnailUrl: string | undefined;
    let width: number | undefined;
    let height: number | undefined;

    // Generate real thumbnail for images using sharp
    if (mimeType.startsWith("image/")) {
      try {
        const metadata = await sharp(buffer).metadata();
        width = metadata.width;
        height = metadata.height;

        const thumbFileName = "thumbnail.webp";
        const thumbFilePath = path.join(targetDir, thumbFileName);

        await sharp(buffer)
          .resize({ width: 600, height: 450, fit: "cover" })
          .webp({ quality: 82 })
          .toFile(thumbFilePath);

        thumbnailKey = path.join(dirRelative, thumbFileName).replace(/\\/g, "/");
        thumbnailUrl = `/api/storage/${thumbnailKey}`;
      } catch (err) {
        console.warn("Failed to generate image thumbnail with sharp:", err);
      }
    }

    return {
      storageKey,
      thumbnailKey,
      url: publicUrl,
      thumbnailUrl: thumbnailUrl || publicUrl,
      fileSize: buffer.length,
      width,
      height,
    };
  }

  /**
   * Retrieves binary file from storage.
   */
  getMediaFile(storageKey: string): { filePath: string; exists: boolean } {
    if (!storageKey || storageKey.includes("..")) {
      return { filePath: "", exists: false };
    }

    const safeKey = path.normalize(storageKey);
    const baseResolved = path.resolve(this.baseDir);
    const filePath = path.resolve(this.baseDir, safeKey);

    // Strict path containment verification
    if (!filePath.startsWith(baseResolved)) {
      return { filePath: "", exists: false };
    }

    return {
      filePath,
      exists: fs.existsSync(filePath) && fs.statSync(filePath).isFile(),
    };
  }
}

export const storageDriver = new StorageDriver();

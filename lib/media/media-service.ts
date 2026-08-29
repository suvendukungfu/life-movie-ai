import { Memory, MemoryType } from "@/lib/types/domain";

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  type?: MemoryType;
}

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
const ACCEPTED_AUDIO_TYPES = ["audio/mpeg", "audio/wav", "audio/x-m4a", "audio/mp4", "audio/aac"];

const MAX_IMAGE_SIZE = 25 * 1024 * 1024; // 25 MB
const MAX_VIDEO_SIZE = 60 * 1024 * 1024; // 60 MB
const MAX_AUDIO_SIZE = 30 * 1024 * 1024; // 30 MB

export class MediaService {
  static validateFile(file: File): FileValidationResult {
    const mime = file.type.toLowerCase();

    if (ACCEPTED_IMAGE_TYPES.includes(mime)) {
      if (file.size > MAX_IMAGE_SIZE) {
        return { valid: false, error: `Photograph is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is 25MB.` };
      }
      return { valid: true, type: "photo" };
    }

    if (ACCEPTED_VIDEO_TYPES.includes(mime)) {
      if (file.size > MAX_VIDEO_SIZE) {
        return { valid: false, error: `Video file is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is 60MB.` };
      }
      return { valid: true, type: "video" };
    }

    if (ACCEPTED_AUDIO_TYPES.includes(mime)) {
      if (file.size > MAX_AUDIO_SIZE) {
        return { valid: false, error: `Audio voice memo is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max allowed is 30MB.` };
      }
      return { valid: true, type: "audio" };
    }

    return {
      valid: false,
      error: `Unsupported file format (${file.type || "unknown"}). Please upload JPG, PNG, WEBP, MP4, MOV, or MP3.`,
    };
  }

  static async fileToMemory(file: File, projectId: string, order: number): Promise<Memory> {
    const validation = this.validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const type = validation.type || "photo";
    const objectUrl = URL.createObjectURL(file);

    // Extract approximate date from lastModified
    const dateStr = file.lastModified
      ? new Date(file.lastModified).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];

    // Clean file title as default caption
    const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
    const rotation = (Math.random() * 4 - 2); // subtle -2 to +2 deg natural angle

    return {
      id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectId,
      type,
      url: objectUrl,
      thumbnailUrl: objectUrl,
      caption: cleanName.length > 3 ? cleanName : "Captured Moment",
      date: dateStr,
      location: "Location",
      people: [],
      order,
      aspect: type === "video" ? "aspect-16/9" : "aspect-4/3",
      rotation,
      fileSize: file.size,
      fileName: file.name,
    };
  }
}

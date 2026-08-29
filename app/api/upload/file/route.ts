import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth-service";
import { prisma } from "@/lib/db/client";
import { storageDriver } from "@/lib/storage/storage-driver";
import { rateLimiter } from "@/lib/security/rate-limiter";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/wav",
  "audio/x-m4a",
];

const MAX_SIZES: Record<string, number> = {
  image: 25 * 1024 * 1024,
  video: 60 * 1024 * 1024,
  audio: 30 * 1024 * 1024,
};

export async function POST(req: Request) {
  const session = await AuthService.getSession(req);
  if (!session.isAuthenticated || !session.user) {
    return NextResponse.json({ success: false, error: "Authentication required to upload media." }, { status: 401 });
  }

  const rate = rateLimiter.check(`upload_file_${session.user.id}`, 60, 60000);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: "Upload rate limit reached. Please wait a moment." },
      { status: 429 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const projectId = formData.get("projectId") as string | null;
    const caption = (formData.get("caption") as string) || "";
    const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];
    const location = (formData.get("location") as string) || "";
    const peopleRaw = (formData.get("people") as string) || "[]";

    if (!file || !projectId) {
      return NextResponse.json({ success: false, error: "Both 'file' and 'projectId' are required." }, { status: 400 });
    }

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You do not have authorization to add media to this project." },
        { status: 403 }
      );
    }

    const mimeType = file.type.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { success: false, error: `Invalid file format (${mimeType}). Allowed: JPG, PNG, WEBP, MP4, MOV, MP3, WAV.` },
        { status: 400 }
      );
    }

    const typePrefix = mimeType.split("/")[0];
    const maxSize = MAX_SIZES[typePrefix] || MAX_SIZES.image;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: `File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max: ${(maxSize / (1024 * 1024)).toFixed(0)}MB.` },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const memoryId = `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Persist actual binary file to physical storage namespace
    const saved = await storageDriver.saveMedia(
      session.user.id,
      projectId,
      memoryId,
      file.name,
      mimeType,
      buffer
    );

    const mediaType = mimeType.startsWith("image/") ? "photo" : mimeType.startsWith("video/") ? "video" : "audio";

    // Count existing memories to set sort order
    const existingCount = await prisma.memory.count({ where: { projectId } });

    // Save record in PostgreSQL / SQLite database
    const dbMemory = await prisma.memory.create({
      data: {
        id: memoryId,
        projectId,
        type: mediaType,
        url: saved.url,
        thumbnailUrl: saved.thumbnailUrl,
        storageKey: saved.storageKey,
        thumbnailKey: saved.thumbnailKey,
        caption: caption || file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
        date,
        location: location || "Archive Location",
        peopleJson: peopleRaw,
        sortOrder: existingCount + 1,
        aspect: mediaType === "video" ? "aspect-16/9" : "aspect-4/3",
        rotation: Math.random() * 4 - 2,
        fileSize: saved.fileSize,
        fileName: file.name,
        mimeType,
        width: saved.width,
        height: saved.height,
        status: "ready",
      },
    });

    let parsedPeople: string[] = [];
    try {
      parsedPeople = JSON.parse(dbMemory.peopleJson);
    } catch {
      parsedPeople = [];
    }

    return NextResponse.json({
      success: true,
      memory: {
        id: dbMemory.id,
        projectId: dbMemory.projectId,
        type: dbMemory.type,
        url: dbMemory.url,
        thumbnailUrl: dbMemory.thumbnailUrl,
        caption: dbMemory.caption,
        date: dbMemory.date,
        location: dbMemory.location,
        people: parsedPeople,
        order: dbMemory.sortOrder,
        aspect: dbMemory.aspect,
        rotation: dbMemory.rotation,
        fileSize: dbMemory.fileSize,
        fileName: dbMemory.fileName,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Upload processing failed.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

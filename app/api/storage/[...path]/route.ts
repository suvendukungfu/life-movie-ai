import { NextResponse } from "next/server";
import fs from "fs";
import { storageDriver } from "@/lib/storage/storage-driver";
import { AuthService } from "@/lib/auth/auth-service";
import { prisma } from "@/lib/db/client";

interface RouteProps {
  params: Promise<{ path: string[] }>;
}

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  mp4: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};

export async function GET(req: Request, { params }: RouteProps) {
  const { path: pathSegments } = await params;
  const storageKey = pathSegments.join("/");

  const fileInfo = storageDriver.getMediaFile(storageKey);
  if (!fileInfo.exists) {
    return NextResponse.json({ success: false, error: "File not found." }, { status: 404 });
  }

  // Path format: users/{userId}/projects/{projectId}/...
  const parts = storageKey.split("/");
  if (parts.length >= 4 && parts[0] === "users" && parts[2] === "projects") {
    const ownerUserId = parts[1];
    const projectId = parts[3];

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, privacy: true },
    });

    if (project && project.privacy === "private") {
      const session = await AuthService.getSession(req);
      if (!session.isAuthenticated || session.user.id !== ownerUserId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized access to private project media." },
          { status: 403 }
        );
      }
    }
  }

  const ext = storageKey.split(".").pop()?.toLowerCase() || "";
  const contentType = MIME_MAP[ext] || "application/octet-stream";
  const stat = fs.statSync(fileInfo.filePath);
  const fileSize = stat.size;

  const range = req.headers.get("range");

  if (range) {
    const partsRange = range.replace(/bytes=/, "").split("-");
    const start = parseInt(partsRange[0], 10);
    const end = partsRange[1] ? parseInt(partsRange[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;

    const stream = fs.createReadStream(fileInfo.filePath, { start, end });
    const readable = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      },
    });

    return new Response(readable, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": String(chunksize),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  }

  const fileStream = fs.createReadStream(fileInfo.filePath);
  const readable = new ReadableStream({
    start(controller) {
      fileStream.on("data", (chunk) => controller.enqueue(chunk));
      fileStream.on("end", () => controller.close());
      fileStream.on("error", (err) => controller.error(err));
    },
  });

  return new Response(readable, {
    status: 200,
    headers: {
      "Content-Length": String(fileSize),
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
    },
  });
}

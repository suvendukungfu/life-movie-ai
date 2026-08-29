import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db/client";
import { AuthService } from "@/lib/auth/auth-service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  const { id: jobId } = await params;

  const job = await prisma.generationJob.findUnique({
    where: { id: jobId },
    include: { project: true },
  });

  if (!job || !job.project) {
    return NextResponse.json({ success: false, error: "Render job or film not found." }, { status: 404 });
  }

  // Verify ownership or public project access
  if (job.project.privacy === "private") {
    const session = await AuthService.getSession(req);
    if (!session.isAuthenticated || session.user.id !== job.project.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to private master film." },
        { status: 403 }
      );
    }
  }

  const filePath = path.join(
    process.cwd(),
    ".storage",
    "users",
    job.project.userId,
    "projects",
    job.project.id,
    "renders",
    jobId,
    "final.mp4"
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ success: false, error: "Master video file not found on disk." }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.get("range");

  if (range) {
    const partsRange = range.replace(/bytes=/, "").split("-");
    const start = parseInt(partsRange[0], 10);
    const end = partsRange[1] ? parseInt(partsRange[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;

    const stream = fs.createReadStream(filePath, { start, end });
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
        "Content-Type": "video/mp4",
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const fileStream = fs.createReadStream(filePath);
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
      "Content-Type": "video/mp4",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/db/client";

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
    return NextResponse.json({ success: false, error: "Poster frame not found." }, { status: 404 });
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
    "poster.jpg"
  );

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ success: false, error: "Poster file not found on disk." }, { status: 404 });
  }

  const stat = fs.statSync(filePath);
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
      "Content-Length": String(stat.size),
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

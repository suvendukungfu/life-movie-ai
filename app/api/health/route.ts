import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { FFmpegRunner } from "@/lib/rendering/ffmpeg-runner";
import fs from "fs";
import path from "path";

export async function GET() {
  const timestamp = new Date().toISOString();
  let dbStatus = "ok";
  let ffmpegStatus = "ok";
  let storageStatus = "ok";

  // 1. Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "error";
  }

  // 2. FFmpeg availability check
  try {
    const res = await FFmpegRunner.runFFprobe(["-version"], { timeoutMs: 5000 });
    if (res.exitCode !== 0) ffmpegStatus = "error";
  } catch {
    ffmpegStatus = "error";
  }

  // 3. Storage directory check
  try {
    const storageDir = path.join(process.cwd(), ".storage");
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
  } catch {
    storageStatus = "error";
  }

  const isHealthy = dbStatus === "ok" && ffmpegStatus === "ok" && storageStatus === "ok";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "degraded",
      version: "0.2.0",
      timestamp,
      subsystems: {
        database: dbStatus,
        ffmpeg: ffmpegStatus,
        storage: storageStatus,
      },
    },
    { status: isHealthy ? 200 : 503 }
  );
}

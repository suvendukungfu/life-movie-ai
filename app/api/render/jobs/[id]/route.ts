import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  const { id } = await params;
  const job = await prisma.generationJob.findUnique({
    where: { id },
  });

  if (!job) {
    return NextResponse.json({ success: false, error: "Render job not found." }, { status: 404 });
  }

  let logs: string[] = [];
  try {
    logs = JSON.parse(job.logsJson);
  } catch {
    logs = [];
  }

  return NextResponse.json({
    success: true,
    job: {
      id: job.id,
      projectId: job.projectId,
      status: job.status,
      progress: job.progress,
      currentStage: job.currentStage,
      stageDescription: job.stageDescription,
      logs,
      outputVideoUrl: job.outputVideoUrl,
      error: job.error,
      createdAt: job.createdAt.toISOString(),
      completedAt: job.completedAt?.toISOString(),
    },
  });
}

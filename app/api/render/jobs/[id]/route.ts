import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { AuthService } from "@/lib/auth/auth-service";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  const { id } = await params;
  const job = await prisma.generationJob.findUnique({
    where: { id },
    include: { project: { select: { userId: true, privacy: true } } },
  });

  if (!job) {
    return NextResponse.json({ success: false, error: "Render job not found." }, { status: 404 });
  }

  // If parent project is private, enforce session authorization
  if (job.project && job.project.privacy === "private") {
    const session = await AuthService.getSession(req);
    if (!session.isAuthenticated || session.user.id !== job.project.userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access to private render job." },
        { status: 403 }
      );
    }
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

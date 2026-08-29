import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth-service";
import { prisma } from "@/lib/db/client";
import { rateLimiter } from "@/lib/security/rate-limiter";
import { RenderWorker } from "@/lib/rendering/render-worker";

export async function POST(req: Request) {
  const session = await AuthService.getSession(req);
  if (!session.isAuthenticated || !session.user) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  const rate = rateLimiter.check(`render_job_${session.user.id}`, 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: "Render queue busy. Please wait before starting another render." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ success: false, error: "projectId is required." }, { status: 400 });
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "You do not have authorization to render this project." },
        { status: 403 }
      );
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const timestamp = new Date().toISOString();

    const dbJob = await prisma.generationJob.create({
      data: {
        id: jobId,
        projectId,
        status: "queued",
        progress: 10,
        currentStage: "queued",
        stageDescription: "01 / QUEUED FOR 35MM PROCESSING",
        logsJson: JSON.stringify([`[${timestamp}] Job initialized for project ${projectId}`]),
      },
    });

    // Extract client-provided Gemini API key (BYOK)
    const clientApiKey = req.headers.get("x-gemini-api-key") || body.apiKey || undefined;

    // Fire asynchronous background worker execution
    RenderWorker.processJob(jobId, clientApiKey).catch((err) => {
      console.error(`Background render error for job ${jobId}:`, err);
    });

    return NextResponse.json({
      success: true,
      job: {
        id: dbJob.id,
        projectId: dbJob.projectId,
        status: dbJob.status,
        progress: dbJob.progress,
        currentStage: dbJob.currentStage,
        stageDescription: dbJob.stageDescription,
        logs: JSON.parse(dbJob.logsJson),
        createdAt: dbJob.createdAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create render job.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

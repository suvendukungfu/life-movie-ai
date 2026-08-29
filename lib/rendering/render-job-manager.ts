import { GenerationJob } from "@/lib/types/domain";

export type RenderStage =
  | "queued"
  | "analyzing"
  | "story_ready"
  | "generating_audio"
  | "composing"
  | "encoding"
  | "complete"
  | "failed";

export interface DetailedRenderJob extends GenerationJob {
  currentStage: RenderStage;
  logs: string[];
  outputVideoUrl?: string;
}

class RenderJobManager {
  private jobs = new Map<string, DetailedRenderJob>();

  createJob(projectId: string): DetailedRenderJob {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newJob: DetailedRenderJob = {
      id: jobId,
      projectId,
      status: "running",
      progress: 10,
      currentStageIndex: 1,
      currentStage: "queued",
      stageDescription: "01 / QUEUED FOR 35MM PROCESSING",
      logs: [`[${new Date().toISOString()}] Job initialized for project ${projectId}`],
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, newJob);

    // Run background pipeline asynchronously
    this.runBackgroundPipeline(jobId);

    return newJob;
  }

  getJob(jobId: string): DetailedRenderJob | null {
    return this.jobs.get(jobId) || null;
  }

  private runBackgroundPipeline(jobId: string) {
    const stages: Array<{ stage: RenderStage; progress: number; desc: string; delayMs: number }> = [
      { stage: "analyzing", progress: 25, desc: "02 / ANALYZING MEMORIES & TIMESTAMP CHRONOLOGY", delayMs: 1000 },
      { stage: "story_ready", progress: 50, desc: "03 / STRUCTURING 5-ACT NARRATIVE BEATS", delayMs: 2000 },
      { stage: "generating_audio", progress: 70, desc: "04 / MASTERING ANALOG SCORE & VOICE STEMS", delayMs: 3200 },
      { stage: "composing", progress: 85, desc: "05 / WEAVING 2.39:1 CINEMASCOPE SCENES", delayMs: 4400 },
      { stage: "complete", progress: 100, desc: "06 / 4K MASTER CUT READY", delayMs: 5600 },
    ];

    stages.forEach((st) => {
      setTimeout(() => {
        const job = this.jobs.get(jobId);
        if (!job || job.status === "failed") return;

        job.currentStage = st.stage;
        job.progress = st.progress;
        job.stageDescription = st.desc;
        job.logs.push(`[${new Date().toISOString()}] Stage ${st.stage}: ${st.desc}`);

        if (st.stage === "complete") {
          job.status = "completed";
          job.completedAt = new Date().toISOString();
          job.outputVideoUrl = `/api/public/film/${job.projectId}/video.mp4`;
        }

        this.jobs.set(jobId, job);
      }, st.delayMs);
    });
  }
}

export const renderJobManager = new RenderJobManager();

import { prisma } from "@/lib/db/client";
import { RenderService } from "./render-service";

export class RenderWorker {
  private static isRunning = false;

  /**
   * Processes a single job immediately in the background.
   */
  static async processJob(jobId: string, clientApiKey?: string) {
    try {
      console.log(`[RenderWorker] 🎬 Processing job ${jobId}...`);
      const result = await RenderService.render(jobId, clientApiKey);
      console.log(`[RenderWorker] ✅ Job ${jobId} finished successfully. Output: ${result.outputVideoUrl} (${result.width}x${result.height}, ${result.durationSec.toFixed(1)}s)`);
      return result;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[RenderWorker] ❌ Job ${jobId} failed:`, msg);
      throw err;
    }
  }

  /**
   * Continuous queue polling worker loop for background workers.
   */
  static async startWorkerLoop() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("[RenderWorker] 🚀 Background Render Worker started. Listening for queued jobs...");

    while (this.isRunning) {
      try {
        const nextJob = await prisma.generationJob.findFirst({
          where: { status: "queued" },
          orderBy: { createdAt: "asc" },
        });

        if (nextJob) {
          await this.processJob(nextJob.id);
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }
      } catch (err) {
        console.error("[RenderWorker] Worker loop error:", err);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  static stop() {
    this.isRunning = false;
  }
}

// Auto-run if executed directly
if (require.main === module) {
  RenderWorker.startWorkerLoop();
}

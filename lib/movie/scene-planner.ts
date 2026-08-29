import { Memory } from "@/lib/types/domain";

export interface PlannedScene {
  id: string;
  order: number;
  title: string;
  mediaPath: string;
  mediaType: "photo" | "video";
  durationSec: number;
  cameraMotion: "slow_zoom_in" | "slow_zoom_out" | "pan_right" | "subtle_drift";
  subtitle?: string;
  transition: "crossfade" | "fade";
  targetWidth: number;
  targetHeight: number;
}

export class ScenePlanner {
  static readonly CINEMASCOPE_WIDTH = 1920;
  static readonly CINEMASCOPE_HEIGHT = 804; // 2.388:1 ~ 2.39:1 standard

  static planScenes(
    chapters: Array<{ chapterNumber: number; title: string; handwrittenBeat: string; synopsis: string }>,
    memories: Array<{ id: string; type: string; filePath: string; caption?: string; date?: string }>
  ): PlannedScene[] {
    const planned: PlannedScene[] = [];
    const motions = ["slow_zoom_in", "slow_zoom_out", "pan_right", "subtle_drift"] as const;

    chapters.forEach((act, idx) => {
      const mem = memories[idx % memories.length] || memories[0];
      const motion = motions[idx % motions.length];
      const isVideo = mem?.type === "video";
      const durationSec = isVideo ? 5.5 : 4.5;
      const subtitleText = mem?.caption || act.handwrittenBeat.replace(/"/g, "");

      planned.push({
        id: `scene_${act.chapterNumber}_${idx + 1}`,
        order: idx + 1,
        title: act.title,
        mediaPath: mem?.filePath || "",
        mediaType: isVideo ? "video" : "photo",
        durationSec,
        cameraMotion: motion,
        subtitle: subtitleText,
        transition: "crossfade",
        targetWidth: this.CINEMASCOPE_WIDTH,
        targetHeight: this.CINEMASCOPE_HEIGHT,
      });
    });

    return planned;
  }
}

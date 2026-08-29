import { FFmpegRunner } from "./ffmpeg-runner";

export interface MediaProbeResult {
  width: number;
  height: number;
  durationSec: number;
  fps: number;
  hasAudio: boolean;
  hasVideo: boolean;
  codecName?: string;
  audioCodecName?: string;
  formatName: string;
  fileSizeBytes: number;
}

export class MediaProbe {
  static async probe(filePath: string): Promise<MediaProbeResult> {
    const args = [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      filePath,
    ];

    const res = await FFmpegRunner.runFFprobe(args);
    const parsed = JSON.parse(res.stdout);

    const videoStream = parsed.streams?.find((s: any) => s.codec_type === "video");
    const audioStream = parsed.streams?.find((s: any) => s.codec_type === "audio");

    let width = videoStream?.width || 0;
    let height = videoStream?.height || 0;
    let durationSec = parseFloat(parsed.format?.duration || videoStream?.duration || audioStream?.duration || "0");
    let fileSizeBytes = parseInt(parsed.format?.size || "0", 10);

    // Calculate FPS
    let fps = 24;
    if (videoStream?.r_frame_rate) {
      const [num, den] = videoStream.r_frame_rate.split("/").map(Number);
      if (den && den > 0) {
        fps = Math.round(num / den);
      }
    }

    return {
      width,
      height,
      durationSec,
      fps: fps || 24,
      hasVideo: !!videoStream,
      hasAudio: !!audioStream,
      codecName: videoStream?.codec_name,
      audioCodecName: audioStream?.codec_name,
      formatName: parsed.format?.format_name || "unknown",
      fileSizeBytes,
    };
  }
}

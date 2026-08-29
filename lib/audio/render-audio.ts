import { FFmpegRunner } from "@/lib/rendering/ffmpeg-runner";

export class RenderAudioService {
  /**
   * Generates a 48kHz stereo AAC ambient soundtrack matching the film duration.
   */
  static async generateSoundtrack(
    durationSec: number,
    outputAudioPath: string,
    mood: string = "warm"
  ): Promise<string> {
    const freq = mood.toLowerCase().includes("nostalgia") ? 220 : 174.61;
    const fadeOutStart = Math.max(0, durationSec - 2);

    const args = [
      "-y",
      "-f",
      "lavfi",
      "-i",
      `sine=f=${freq}:d=${durationSec}`,
      "-af",
      `volume=0.06,lowpass=f=900,afade=t=in:ss=0:d=1.5,afade=t=out:st=${fadeOutStart}:d=2`,
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      outputAudioPath,
    ];

    await FFmpegRunner.runFFmpeg(args);
    return outputAudioPath;
  }
}

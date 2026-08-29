import { FFmpegRunner } from "@/lib/rendering/ffmpeg-runner";

export interface ScoreHarmonics {
  root: number;
  third: number;
  fifth: number;
  sub: number;
  filterCutoff: number;
}

export const MOOD_HARMONICS: Record<string, ScoreHarmonics> = {
  nostalgia: { root: 146.83, third: 185.0, fifth: 220.0, sub: 73.42, filterCutoff: 1000 },
  documentary: { root: 130.81, third: 155.56, fifth: 196.0, sub: 65.41, filterCutoff: 900 },
  cinematic: { root: 146.83, third: 174.61, fifth: 220.0, sub: 73.42, filterCutoff: 1200 },
  romantic: { root: 220.0, third: 277.18, fifth: 329.63, sub: 110.0, filterCutoff: 1100 },
  youthful: { root: 196.0, third: 246.94, fifth: 293.66, sub: 98.0, filterCutoff: 1400 },
  dramatic: { root: 164.81, third: 196.0, fifth: 246.94, sub: 82.41, filterCutoff: 850 },
};

export class CinemaScoreGenerator {
  /**
   * Synthesizes a multi-layered harmonic ambient cinema soundtrack.
   */
  static async generateHarmonicScore(
    durationSec: number,
    outputAudioPath: string,
    mood: string = "nostalgia"
  ): Promise<string> {
    const key = mood.toLowerCase();
    const harmonics = MOOD_HARMONICS[key] || MOOD_HARMONICS.nostalgia;
    const fadeOutStart = Math.max(0, durationSec - 2.5);

    const filterGraph = `[0:a]volume=0.06[sub];[1:a]volume=0.05[root];[2:a]volume=0.04[third];[3:a]volume=0.035[fifth];[sub][root][third][fifth]amix=inputs=4:duration=first:dropout_transition=2,lowpass=f=${harmonics.filterCutoff},afade=t=in:ss=0:d=1.5,afade=t=out:st=${fadeOutStart}:d=2.5,volume=1.3,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[out]`;

    const args = [
      "-y",
      "-f", "lavfi", "-i", `sine=f=${harmonics.sub}:d=${durationSec}`,
      "-f", "lavfi", "-i", `sine=f=${harmonics.root}:d=${durationSec}`,
      "-f", "lavfi", "-i", `sine=f=${harmonics.third}:d=${durationSec}`,
      "-f", "lavfi", "-i", `sine=f=${harmonics.fifth}:d=${durationSec}`,
      "-filter_complex", filterGraph,
      "-map", "[out]",
      "-c:a", "aac",
      "-b:a", "192k",
      "-ar", "48000",
      "-t", String(durationSec),
      outputAudioPath,
    ];

    await FFmpegRunner.runFFmpeg(args);
    return outputAudioPath;
  }
}

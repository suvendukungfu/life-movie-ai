import { FFmpegRunner } from "@/lib/rendering/ffmpeg-runner";

export interface VoiceSceneCue {
  voiceClipPath: string;
  startTimeSec: number;
}

export class NarratorMixer {
  /**
   * Mixes background ambient music with narrator voiceover tracks at precise scene time offsets.
   */
  static async mixMasterSoundtrack(
    musicPath: string,
    voiceCues: VoiceSceneCue[],
    outputMixedPath: string,
    totalDurationSec: number
  ): Promise<string> {
    if (voiceCues.length === 0) {
      return musicPath;
    }

    const inputs: string[] = ["-i", musicPath];
    const filterParts: string[] = [];

    // Base background music track is stream 0
    filterParts.push("[0:a]volume=0.45[music_ducked]");

    // Process each voiceover cue with adelay
    for (let i = 0; i < voiceCues.length; i++) {
      const cue = voiceCues[i];
      inputs.push("-i", cue.voiceClipPath);
      const delayMs = Math.round(cue.startTimeSec * 1000);
      const inputIdx = i + 1;
      filterParts.push(`[${inputIdx}:a]adelay=${delayMs}|${delayMs},volume=1.35[v${i}]`);
    }

    // Combine all voice streams + music into master mix
    const mixInputs = ["[music_ducked]"];
    for (let i = 0; i < voiceCues.length; i++) {
      mixInputs.push(`[v${i}]`);
    }

    const totalInputs = mixInputs.length;
    const filterGraph = `${filterParts.join(";")};${mixInputs.join("")}amix=inputs=${totalInputs}:duration=first:dropout_transition=2,volume=1.2,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[out]`;

    const args = [
      "-y",
      ...inputs,
      "-filter_complex",
      filterGraph,
      "-map",
      "[out]",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-t",
      String(totalDurationSec),
      outputMixedPath,
    ];

    await FFmpegRunner.runFFmpeg(args);
    return outputMixedPath;
  }
}

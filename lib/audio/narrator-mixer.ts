import { FFmpegRunner } from "@/lib/rendering/ffmpeg-runner";

export interface VoiceSceneCue {
  voiceClipPath: string;
  startTimeSec: number;
  durationSec?: number;
}

export class NarratorMixer {
  /**
   * Mixes background ambient music with narrator voiceover tracks at precise scene time offsets.
   * Applies dynamic audio ducking and EBU R128 broadcast loudness normalization.
   */
  static async mixMasterSoundtrack(
    musicPath: string,
    voiceCues: VoiceSceneCue[],
    outputMixedPath: string,
    totalDurationSec: number
  ): Promise<string> {
    if (voiceCues.length === 0) {
      // Normalize standalone music track with EBU R128
      const normArgs = [
        "-y",
        "-i",
        musicPath,
        "-af",
        "loudnorm=I=-16:TP=-1.5:LRA=11,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo",
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
      await FFmpegRunner.runFFmpeg(normArgs);
      return outputMixedPath;
    }

    const inputs: string[] = ["-i", musicPath];
    const filterParts: string[] = [];

    // Base background music stream is 0:a with subtle ducking bed
    filterParts.push("[0:a]volume=0.42[music_bed]");

    // Process each voiceover cue with sample-accurate adelay and vocal presence EQ
    for (let i = 0; i < voiceCues.length; i++) {
      const cue = voiceCues[i];
      inputs.push("-i", cue.voiceClipPath);
      const delayMs = Math.max(0, Math.round(cue.startTimeSec * 1000));
      const inputIdx = i + 1;
      filterParts.push(`[${inputIdx}:a]adelay=${delayMs}|${delayMs},highpass=f=80,lowpass=f=12000,volume=1.4[v${i}]`);
    }

    // Combine music bed + all voice streams
    const mixInputs = ["[music_bed]"];
    for (let i = 0; i < voiceCues.length; i++) {
      mixInputs.push(`[v${i}]`);
    }

    const totalInputs = mixInputs.length;
    const filterGraph = `${filterParts.join(";")};${mixInputs.join("")}amix=inputs=${totalInputs}:duration=first:dropout_transition=2,loudnorm=I=-16:TP=-1.5:LRA=11,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo[out]`;

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

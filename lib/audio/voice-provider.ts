import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { FFmpegRunner } from "@/lib/rendering/ffmpeg-runner";
import { GeminiTTSProvider } from "./gemini-tts-provider";
import { getVoiceProfileForStyle, VoiceProfile } from "./voice-profiles";

export interface VoiceProvider {
  name: string;
  synthesize(text: string, outputAacPath: string, styleIdOrProfile?: string | VoiceProfile): Promise<string>;
}

/**
 * Native System Voice Provider (macOS `say` / Linux `espeak-ng`).
 * 100% free, runs offline, zero network latency.
 */
export class SystemVoiceProvider implements VoiceProvider {
  name = "System Voice Narrator (Offline / Free)";

  async synthesize(text: string, outputAacPath: string, styleIdOrProfile?: string | VoiceProfile): Promise<string> {
    const isMac = process.platform === "darwin";
    const tempDir = path.dirname(outputAacPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const profile = typeof styleIdOrProfile === "object" ? styleIdOrProfile : getVoiceProfileForStyle(styleIdOrProfile);
    const rate = Math.round(165 * profile.speedMultiplier);

    if (isMac && fs.existsSync("/usr/bin/say")) {
      const tempAiff = path.join(tempDir, `tts_raw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.aiff`);

      await new Promise<void>((resolve, reject) => {
        const proc = spawn("/usr/bin/say", [
          "-r",
          String(rate),
          "-o",
          tempAiff,
          text,
        ]);
        proc.on("close", (code) => {
          if (code === 0 && fs.existsSync(tempAiff)) {
            resolve();
          } else {
            reject(new Error(`macOS say command exited with code ${code}`));
          }
        });
        proc.on("error", reject);
      });

      // Convert AIFF to 48kHz stereo AAC with warm voice EQ
      const ffmpegArgs = [
        "-y",
        "-i",
        tempAiff,
        "-af",
        "highpass=f=80,lowpass=f=8000,volume=1.2",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-ac",
        "2",
        outputAacPath,
      ];
      await FFmpegRunner.runFFmpeg(ffmpegArgs);

      try {
        fs.unlinkSync(tempAiff);
      } catch {}

      return outputAacPath;
    }

    // Fallback: If on Linux with espeak
    const hasEspeak = fs.existsSync("/usr/bin/espeak") || fs.existsSync("/usr/bin/espeak-ng");
    if (hasEspeak) {
      const bin = fs.existsSync("/usr/bin/espeak-ng") ? "/usr/bin/espeak-ng" : "/usr/bin/espeak";
      const tempWav = path.join(tempDir, `tts_raw_${Date.now()}.wav`);

      await new Promise<void>((resolve, reject) => {
        const proc = spawn(bin, ["-s", String(Math.round(150 * profile.speedMultiplier)), "-w", tempWav, text]);
        proc.on("close", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`espeak exited with code ${code}`));
        });
        proc.on("error", reject);
      });

      await FFmpegRunner.runFFmpeg([
        "-y",
        "-i",
        tempWav,
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        "-ar",
        "48000",
        "-ac",
        "2",
        outputAacPath,
      ]);

      try {
        fs.unlinkSync(tempWav);
      } catch {}

      return outputAacPath;
    }

    throw new Error("No system TTS binary available on host.");
  }
}

/**
 * Harmonic Narrator Fallback.
 * Generates an ambient warm harmonic speech-like tone bed if no system speech synthesizer is installed.
 */
export class HarmonicNarratorFallback implements VoiceProvider {
  name = "Harmonic Narrator Bed (Local Synth)";

  async synthesize(text: string, outputAacPath: string): Promise<string> {
    const words = text.split(/\s+/).length;
    const duration = Math.max(2.5, Math.min(6.0, words * 0.45));

    const args = [
      "-y",
      "-f",
      "lavfi",
      "-i",
      `sine=f=220:d=${duration}`,
      "-af",
      `volume=0.04,lowpass=f=600,afade=t=in:ss=0:d=0.5,afade=t=out:st=${duration - 0.5}:d=0.5`,
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      outputAacPath,
    ];

    await FFmpegRunner.runFFmpeg(args);
    return outputAacPath;
  }
}

/**
 * Active Multi-Tier Voice Provider Router.
 * 1. Primary: Google Gemini Neural TTS (when GEMINI_API_KEY is present)
 * 2. Secondary: Native System Voice (/usr/bin/say on macOS, espeak-ng on Linux)
 * 3. Tertiary: Harmonic Tone Synth Bed
 */
export class VoiceProviderRouter implements VoiceProvider {
  private gemini = new GeminiTTSProvider();
  private system = new SystemVoiceProvider();
  private fallback = new HarmonicNarratorFallback();

  get name(): string {
    return process.env.GEMINI_API_KEY ? this.gemini.name : this.system.name;
  }

  async synthesize(
    text: string,
    outputAacPath: string,
    styleIdOrProfile?: string | VoiceProfile,
    options?: { apiKey?: string; timeoutMs?: number }
  ): Promise<string> {
    const profile = typeof styleIdOrProfile === "object" ? styleIdOrProfile : getVoiceProfileForStyle(styleIdOrProfile);
    const resolvedKey = options?.apiKey || (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0 ? process.env.GEMINI_API_KEY : undefined);

    // 1. Try Gemini Neural TTS if key is present (client key or server key)
    if (resolvedKey) {
      try {
        const result = await this.gemini.synthesize({
          text,
          outputPath: outputAacPath,
          voiceProfile: profile,
          apiKey: resolvedKey,
          timeoutMs: options?.timeoutMs,
        });
        return result.audioPath;
      } catch (geminiErr) {
        console.warn("[VoiceProvider] Gemini TTS unavailable, falling back to system speech synthesizer:", geminiErr);
      }
    }

    // 2. Try System Voice (say / espeak)
    try {
      return await this.system.synthesize(text, outputAacPath, profile);
    } catch (sysErr) {
      console.warn("[VoiceProvider] System TTS unavailable, using harmonic tone bed:", sysErr);
    }

    // 3. Guaranteed local fallback
    return await this.fallback.synthesize(text, outputAacPath);
  }
}

export const activeVoiceProvider = new VoiceProviderRouter();

import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { getGeminiApiKey } from "@/lib/config/env";
import { FFmpegRunner } from "@/lib/rendering/ffmpeg-runner";
import { MediaProbe } from "@/lib/rendering/media-probe";
import { VoiceProfile, VOICE_PROFILES } from "./voice-profiles";

export interface GeminiTTSOptions {
  text: string;
  outputPath: string;
  voiceProfile?: VoiceProfile;
  timeoutMs?: number;
}

export interface GeminiTTSResult {
  audioPath: string;
  durationSec: number;
  sampleRate: number;
  channels: number;
  voice: string;
  model: string;
}

/**
 * Creates a standard 44-byte canonical WAV container header for raw PCM audio data.
 */
export function createWavHeader(
  dataLength: number,
  sampleRate: number = 24000,
  channels: number = 1,
  bitsPerSample: number = 16
): Buffer {
  const header = Buffer.alloc(44);
  const byteRate = (sampleRate * channels * bitsPerSample) / 8;
  const blockAlign = (channels * bitsPerSample) / 8;

  // RIFF chunk descriptor
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + dataLength, 4);
  header.write("WAVE", 8);

  // fmt sub-chunk
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size for PCM
  header.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(byteRate, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);

  // data sub-chunk
  header.write("data", 36);
  header.writeUInt32LE(dataLength, 40);

  return header;
}

export class GeminiTTSProvider {
  name = "Google Gemini Neural Narration";
  private defaultModel = "gemini-2.5-flash";

  private getClient(): GoogleGenAI {
    const apiKey = getGeminiApiKey();
    return new GoogleGenAI({ apiKey });
  }

  /**
   * Synthesizes narration text using Google Gemini Audio Output / TTS.
   */
  async synthesize(options: GeminiTTSOptions): Promise<GeminiTTSResult> {
    const { text, outputPath, voiceProfile = VOICE_PROFILES.nostalgia, timeoutMs = 30000 } = options;

    if (!text || text.trim().length === 0) {
      throw new Error("Narration text cannot be empty.");
    }

    const ai = this.getClient();
    const tempDir = path.dirname(outputPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempRawPath = path.join(tempDir, `gemini_tts_raw_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.tmp`);

    const prompt = `You are a professional film narrator. Read the following life story scene text with natural, emotive inflection:

Narrator Direction: ${voiceProfile.directionPrompt}

Text to read aloud:
"${text.trim()}"`;

    let audioBuffer: Buffer | null = null;
    let mimeType = "audio/wav";
    let lastError: Error | null = null;

    // Retry loop with exponential backoff (max 3 attempts)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const responsePromise = ai.models.generateContent({
          model: this.defaultModel,
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          config: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: voiceProfile.geminiVoice,
                },
              },
            },
          },
        });

        // Timeout wrapper
        const response = await Promise.race([
          responsePromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Gemini TTS request timed out after ${timeoutMs}ms`)), timeoutMs)
          ),
        ]);

        const candidate = response.candidates?.[0];
        const part = candidate?.content?.parts?.find((p) => (p as { inlineData?: { data?: string } }).inlineData?.data);

        if (part && "inlineData" in part && part.inlineData?.data) {
          const rawBase64 = part.inlineData.data;
          audioBuffer = Buffer.from(rawBase64, "base64");
          mimeType = part.inlineData.mimeType || "audio/pcm;rate=24000";
          break;
        }

        throw new Error("Gemini response did not contain inline audio data.");
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        const errMsg = lastError.message;

        if (errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED")) {
          if (attempt < 3) {
            const delayMs = attempt * 3000;
            console.warn(`[GeminiTTS] Rate limit (429). Retrying in ${delayMs}ms (attempt ${attempt}/3)...`);
            await new Promise((r) => setTimeout(r, delayMs));
            continue;
          }
        }
        break;
      }
    }

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error(`Gemini TTS generation failed: ${lastError?.message || "Empty audio payload"}`);
    }

    // Process raw audio buffer:
    // If PCM format or mimeType mentions rate=24000, wrap with canonical WAV header
    if (mimeType.includes("pcm") || mimeType.includes("raw") || !mimeType.includes("mp3")) {
      const sampleRate = mimeType.includes("rate=") ? parseInt(mimeType.split("rate=")[1], 10) || 24000 : 24000;
      const wavHeader = createWavHeader(audioBuffer.length, sampleRate, 1, 16);
      fs.writeFileSync(tempRawPath, Buffer.concat([wavHeader, audioBuffer]));
    } else {
      fs.writeFileSync(tempRawPath, audioBuffer);
    }

    // Convert and normalize to high-fidelity 48kHz stereo AAC stem
    const ffmpegArgs = [
      "-y",
      "-i",
      tempRawPath,
      "-af",
      "highpass=f=80,lowpass=f=12000,volume=1.25",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-ac",
      "2",
      outputPath,
    ];

    try {
      await FFmpegRunner.runFFmpeg(ffmpegArgs);
    } finally {
      if (fs.existsSync(tempRawPath)) {
        try {
          fs.unlinkSync(tempRawPath);
        } catch {}
      }
    }

    // Probe output with FFprobe to validate integrity
    const probe = await MediaProbe.probe(outputPath);
    if (probe.durationSec <= 0) {
      throw new Error(`Generated narration audio has invalid zero duration (${probe.durationSec}s).`);
    }

    return {
      audioPath: outputPath,
      durationSec: probe.durationSec,
      sampleRate: probe.audioSampleRate || 48000,
      channels: probe.audioChannels || 2,
      voice: voiceProfile.geminiVoice,
      model: this.defaultModel,
    };
  }
}

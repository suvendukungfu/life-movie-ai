import { spawn } from "child_process";
import fs from "fs";

export interface FFmpegRunOptions {
  timeoutMs?: number;
  onProgress?: (progressPercent: number) => void;
}

export interface FFmpegResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export class FFmpegRunner {
  private static findBinary(name: string): string {
    const customEnv = name === "ffmpeg" ? process.env.FFMPEG_PATH : process.env.FFPROBE_PATH;
    if (customEnv && fs.existsSync(customEnv)) return customEnv;

    const commonPaths = [
      `/opt/homebrew/bin/${name}`,
      `/usr/local/bin/${name}`,
      `/usr/bin/${name}`,
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(/*turbopackIgnore: true*/ p)) return p;
    }

    return name; // fallback to PATH
  }

  /**
   * Executes FFmpeg safely using spawn with argument array.
   */
  static runFFmpeg(args: string[], options?: FFmpegRunOptions): Promise<FFmpegResult> {
    const bin = this.findBinary("ffmpeg");
    return this.executeProcess(bin, args, options);
  }

  /**
   * Executes FFprobe safely using spawn with argument array.
   */
  static runFFprobe(args: string[], options?: FFmpegRunOptions): Promise<FFmpegResult> {
    const bin = this.findBinary("ffprobe");
    return this.executeProcess(bin, args, options);
  }

  private static executeProcess(
    bin: string,
    args: string[],
    options?: FFmpegRunOptions
  ): Promise<FFmpegResult> {
    return new Promise((resolve, reject) => {
      const timeout = options?.timeoutMs || 180000; // 3 minutes default timeout
      let stdout = "";
      let stderr = "";
      let isTimedOut = false;

      const proc = spawn(bin, args, {
        windowsHide: true,
      });

      const timer = setTimeout(() => {
        isTimedOut = true;
        proc.kill("SIGKILL");
        reject(new Error(`FFmpeg process timed out after ${timeout}ms: ${bin} ${args.slice(0, 5).join(" ")}...`));
      }, timeout);

      proc.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      proc.stderr.on("data", (data) => {
        const chunk = data.toString();
        stderr += chunk;
      });

      proc.on("error", (err) => {
        clearTimeout(timer);
        reject(new Error(`Failed to start ${bin}: ${err.message}`));
      });

      proc.on("close", (code) => {
        clearTimeout(timer);
        if (isTimedOut) return;

        if (code === 0) {
          resolve({ stdout, stderr, exitCode: 0 });
        } else {
          const errorSnippet = stderr.slice(-800) || stdout.slice(-800) || `Exit code ${code}`;
          reject(new Error(`FFmpeg command failed (exit code ${code}):\n${errorSnippet}`));
        }
      });
    });
  }
}

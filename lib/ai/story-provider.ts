import { AIStoryProvider, AIStoryPromptInput } from "./types";
import { StoryOutline } from "@/lib/types/domain";
import { GeminiStoryProvider } from "./gemini-provider";
import { DeterministicStoryProvider } from "./deterministic-provider";

/**
 * Story provider abstraction.
 *
 * GEMINI_API_KEY present → real AI screenplay generation
 * GEMINI_API_KEY absent  → deterministic fallback (app still works)
 *
 * If Gemini fails at runtime (rate limit, network error, bad JSON),
 * automatically falls back to the deterministic engine.
 */
class StoryProviderRouter implements AIStoryProvider {
  private gemini: GeminiStoryProvider | null;
  private deterministic: DeterministicStoryProvider;

  constructor() {
    this.deterministic = new DeterministicStoryProvider();
    this.gemini = process.env.GEMINI_API_KEY
      ? new GeminiStoryProvider()
      : null;
  }

  get name(): string {
    return this.gemini
      ? this.gemini.name
      : this.deterministic.name;
  }

  async generateStoryOutline(input: AIStoryPromptInput, options?: { apiKey?: string }): Promise<StoryOutline> {
    const hasKey = !!(options?.apiKey || process.env.GEMINI_API_KEY);
    if (!hasKey) {
      return this.deterministic.generateStoryOutline(input);
    }

    try {
      if (!this.gemini) {
        this.gemini = new GeminiStoryProvider();
      }
      return await this.gemini.generateStoryOutline(input, options);
    } catch (err) {
      console.warn(
        "[StoryProvider] Gemini generation failed, falling back to deterministic director:",
        err instanceof Error ? err.message : err
      );
      return this.deterministic.generateStoryOutline(input);
    }
  }
}

export const activeStoryProvider: AIStoryProvider = new StoryProviderRouter();

// Re-export individual providers for direct use
export { DeterministicStoryProvider } from "./deterministic-provider";
export { GeminiStoryProvider } from "./gemini-provider";

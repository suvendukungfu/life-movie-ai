import { AIStoryProvider, AIStoryPromptInput } from "./types";
import { StoryOutline } from "@/lib/types/domain";
import { StoryGenerator } from "./story-generator";

/**
 * Deterministic fallback story provider.
 * Always works without any API key or network access.
 * Used when Gemini is unavailable or rate-limited.
 */
export class DeterministicStoryProvider implements AIStoryProvider {
  name = "Deterministic Director Engine (Local)";

  async generateStoryOutline(input: AIStoryPromptInput): Promise<StoryOutline> {
    return StoryGenerator.generateOutline(
      input.title,
      input.category,
      input.style,
      input.memories,
      input.interview
    );
  }
}

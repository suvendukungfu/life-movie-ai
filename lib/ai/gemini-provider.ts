import { GoogleGenAI } from "@google/genai";
import { AIStoryProvider, AIStoryPromptInput } from "./types";
import { StoryOutline, StoryChapter } from "@/lib/types/domain";

/**
 * Real Gemini AI Story Provider.
 *
 * Reads GEMINI_API_KEY from process.env (server-side only).
 * Never hardcodes, prints, logs, commits, or exposes the key.
 *
 * Uses structured JSON output with Gemini's generative model
 * to transform user memories + interview answers into a
 * cinematic 5-act personal documentary screenplay.
 */
export class GeminiStoryProvider implements AIStoryProvider {
  name = "Gemini AI Storyteller";

  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }
    return new GoogleGenAI({ apiKey });
  }

  private buildPrompt(input: AIStoryPromptInput): string {
    const memorySummaries = input.memories
      .map(
        (m, i) =>
          `Memory ${i + 1} [${m.id}]: type=${m.type}, caption="${m.caption}", date="${m.date}", location="${m.location}", people=[${m.people.join(", ")}]`
      )
      .join("\n");

    const interviewText = [
      `About: ${input.interview.about}`,
      `People: ${input.interview.people}`,
      `Unforgettable moment: ${input.interview.unforgettableMoment}`,
      `Hardest moment: ${input.interview.hardestMoment}`,
      `Turning point: ${input.interview.turningPoint}`,
      `Desired ending feeling: ${input.interview.endingFeeling}`,
      input.interview.additionalNotes
        ? `Additional notes: ${input.interview.additionalNotes}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `You are the story director for LIFE MOVIE — a cinematic personal documentary engine.

Transform the user's real memories and interview answers into a structured five-act personal documentary screenplay.

FILM TITLE: ${input.title}
STORY CATEGORY: ${input.category.title} — ${input.category.tag || ""}
DIRECTOR STYLE: ${input.style.name}

USER'S MEMORIES:
${memorySummaries || "No specific memories provided. Create a universal human story based on the interview answers."}

USER'S INTERVIEW:
${interviewText}

Return ONLY valid JSON matching this exact structure:

{
  "logline": "A single compelling sentence describing this person's story as a film.",
  "theme": "The central emotional theme of this documentary.",
  "actStructure": [
    {
      "id": "ch_1",
      "chapterNumber": 1,
      "title": "Act I: [Title]",
      "handwrittenBeat": "A short intimate line as if handwritten in a journal.",
      "synopsis": "2-3 sentence synopsis of this act.",
      "targetTone": "One word: e.g. Nostalgic, Luminous, Bittersweet, Triumphant, Contemplative",
      "associatedMemoryIds": ["list of memory IDs from the user's memories that belong in this act"]
    }
  ]
}

RULES:
- Create exactly 5 chapters (acts), numbered 1 through 5.
- Act 1: The world before. Establish the protagonist's life.
- Act 2: The inciting moment. Something changes.
- Act 3: The struggle or journey. The middle of the story.
- Act 4: The turning point. Transformation happens.
- Act 5: Resolution. The ending feeling should match: "${input.interview.endingFeeling}".
- Never invent important facts the user did not provide.
- Only use information provided by the user.
- Preserve names and relationships accurately.
- Make the story emotionally authentic, not generic AI writing.
- Use cinematic but natural language.
- Each chapter's "handwrittenBeat" should sound like a real human thought, not corporate copy.
- Distribute the user's memory IDs across the acts logically.
- The "id" for each chapter should be "ch_1", "ch_2", etc.
- Return ONLY the JSON object. No markdown fences, no explanation.`;
  }

  async generateStoryOutline(
    input: AIStoryPromptInput
  ): Promise<StoryOutline> {
    const client = this.getClient();
    const prompt = this.buildPrompt(input);

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    const rawText = response.text ?? "";

    // Strip markdown code fences if Gemini wraps the response
    let jsonText = rawText.trim();
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```(?:json)?\s*/, "").replace(/```\s*$/, "");
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      throw new Error(
        `Gemini returned invalid JSON. Raw response (first 500 chars): ${rawText.slice(0, 500)}`
      );
    }

    // Validate and transform to StoryOutline
    return this.validateAndTransform(parsed, input);
  }

  private validateAndTransform(
    raw: Record<string, unknown>,
    input: AIStoryPromptInput
  ): StoryOutline {
    const logline =
      typeof raw.logline === "string" && raw.logline.length > 0
        ? raw.logline
        : `The story of ${input.title}`;

    const theme =
      typeof raw.theme === "string" && raw.theme.length > 0
        ? raw.theme
        : "A life lived fully";

    const rawActs = Array.isArray(raw.actStructure) ? raw.actStructure : [];

    if (rawActs.length === 0) {
      throw new Error(
        "Gemini response missing actStructure array. Cannot build screenplay."
      );
    }

    const actStructure: StoryChapter[] = rawActs.map(
      (act: Record<string, unknown>, idx: number) => ({
        id: typeof act.id === "string" ? act.id : `ch_${idx + 1}`,
        chapterNumber:
          typeof act.chapterNumber === "number" ? act.chapterNumber : idx + 1,
        title:
          typeof act.title === "string"
            ? act.title
            : `Act ${idx + 1}`,
        handwrittenBeat:
          typeof act.handwrittenBeat === "string"
            ? act.handwrittenBeat
            : "",
        synopsis:
          typeof act.synopsis === "string" ? act.synopsis : "",
        targetTone:
          typeof act.targetTone === "string"
            ? act.targetTone
            : "Contemplative",
        associatedMemoryIds: Array.isArray(act.associatedMemoryIds)
          ? act.associatedMemoryIds.filter(
              (id: unknown) => typeof id === "string"
            )
          : [],
      })
    );

    return { logline, theme, actStructure };
  }
}

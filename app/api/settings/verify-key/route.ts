import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { rateLimiter } from "@/lib/security/rate-limiter";

export async function POST(req: Request) {
  // Rate limit by IP or general identifier
  const ip = req.headers.get("x-forwarded-for") || "anonymous";
  const rate = rateLimiter.check(`verify_key_${ip}`, 10, 60000);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: "Too many verification attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { apiKey } = body;

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid Google Gemini API key." },
        { status: 400 }
      );
    }

    const trimmedKey = apiKey.trim();

    // Verify key by issuing a minimal query to Google Gemini 2.5 Flash
    const ai = new GoogleGenAI({ apiKey: trimmedKey });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Reply with the single word: OK",
    });

    if (response && response.text) {
      return NextResponse.json({
        success: true,
        message: "Google Gemini API key verified successfully.",
        model: "gemini-2.5-flash",
      });
    }

    return NextResponse.json(
      { success: false, error: "Unable to verify API key with Gemini." },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[VerifyKey] API key verification failed:", message.slice(0, 100));

    let userMessage = "Invalid Google Gemini API key. Please check your key from Google AI Studio.";
    if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED")) {
      userMessage = "API key is valid, but currently experiencing rate limiting from Google AI Studio.";
      // It's technically a valid key!
      return NextResponse.json({
        success: true,
        message: userMessage,
        model: "gemini-2.5-flash",
        isRateLimited: true,
      });
    } else if (message.includes("API_KEY_INVALID") || message.includes("403") || message.includes("401")) {
      userMessage = "API key was rejected by Google Gemini (Invalid Key).";
    }

    return NextResponse.json({ success: false, error: userMessage }, { status: 400 });
  }
}

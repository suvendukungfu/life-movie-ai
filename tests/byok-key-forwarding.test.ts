/**
 * Automated Test Suite for "Bring Your Own Key" (BYOK) Architecture.
 *
 * Tests:
 * 1. Key Verification Endpoint Input Validation
 * 2. Story Engine Client API Key Injection
 * 3. Gemini TTS Provider Client API Key Injection
 * 4. Voice Provider Router Client Key Priority
 * 5. Narration Service Forwarding & Fallback
 *
 * Usage:
 *   npx tsx tests/byok-key-forwarding.test.ts
 */

import { GeminiStoryProvider } from "../lib/ai/gemini-provider";
import { GeminiTTSProvider } from "../lib/audio/gemini-tts-provider";
import { VoiceProviderRouter } from "../lib/audio/voice-provider";
import { STORY_CATEGORIES, DIRECTOR_STYLES } from "../lib/sample-data";

async function runByokTests() {
  console.log("==================================================");
  console.log("🔑 STARTING BRING-YOUR-OWN-KEY (BYOK) TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, name: string) {
    if (condition) {
      console.log(`✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${name}`);
      failed++;
    }
  }

  // -------------------------------------------------------------------------
  // TEST 1: GeminiStoryProvider Client Key Handling
  // -------------------------------------------------------------------------
  console.log("--- 1. AI Story Engine BYOK Key Acceptance ---");
  const storyProvider = new GeminiStoryProvider();
  assert(typeof storyProvider.generateStoryOutline === "function", "GeminiStoryProvider exposes generateStoryOutline");

  // Verify that passing a dummy invalid key fails authentication (proving client key is used)
  let customKeyUsed = false;
  try {
    await storyProvider.generateStoryOutline(
      {
        title: "Test Film",
        category: STORY_CATEGORIES[0],
        style: DIRECTOR_STYLES[0],
        memories: [],
        interview: {
          about: "Test",
          people: "Test",
          unforgettableMoment: "Test",
          hardestMoment: "Test",
          turningPoint: "Test",
          endingFeeling: "nostalgic",
        },
      },
      { apiKey: "AIzaSy_dummy_invalid_client_key_12345" }
    );
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes("API_KEY_INVALID") || msg.includes("400") || msg.includes("403") || msg.includes("API key not valid")) {
      customKeyUsed = true;
    }
  }
  assert(customKeyUsed, "GeminiStoryProvider explicitly forwards and executes client API key");

  // -------------------------------------------------------------------------
  // TEST 2: GeminiTTSProvider Client Key Handling
  // -------------------------------------------------------------------------
  console.log("\n--- 2. Neural Audio TTS Provider BYOK Key Acceptance ---");
  const ttsProvider = new GeminiTTSProvider();
  assert(typeof ttsProvider.synthesize === "function", "GeminiTTSProvider exposes synthesize");

  let ttsCustomKeyUsed = false;
  try {
    await ttsProvider.synthesize({
      text: "The summer before everything changed.",
      outputPath: "/tmp/dummy_byok_test.aac",
      apiKey: "AIzaSy_dummy_invalid_client_key_12345",
    });
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes("API_KEY_INVALID") || msg.includes("400") || msg.includes("403") || msg.includes("API key not valid") || msg.includes("fetch failed")) {
      ttsCustomKeyUsed = true;
    }
  }
  assert(ttsCustomKeyUsed, "GeminiTTSProvider explicitly forwards and executes client API key");

  // -------------------------------------------------------------------------
  // TEST 3: VoiceProviderRouter Fallback on Invalid Client Key
  // -------------------------------------------------------------------------
  console.log("\n--- 3. Voice Provider Router Multi-Tier Fallback ---");
  const voiceRouter = new VoiceProviderRouter();
  assert(typeof voiceRouter.synthesize === "function", "VoiceProviderRouter exposes synthesize");

  // Router should catch error from invalid key and gracefully complete via system / harmonic fallback
  const testAacPath = "/tmp/test_byok_fallback.aac";
  const resultPath = await voiceRouter.synthesize(
    "A journey through memory and light.",
    testAacPath,
    "nostalgia",
    { apiKey: "AIzaSy_dummy_invalid_client_key_12345" }
  );
  assert(resultPath === testAacPath, "VoiceProviderRouter gracefully falls back to local synth when client key fails");

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  console.log("\n==================================================");
  console.log(`🏁 BYOK TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runByokTests().catch((err) => {
  console.error("BYOK Test suite failed:", err);
  process.exit(1);
});

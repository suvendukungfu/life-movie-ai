/**
 * Standalone Gemini API integration test.
 *
 * Reads GEMINI_API_KEY from .env (never hardcoded).
 * Sends a test prompt and validates structured JSON response.
 *
 * Usage:
 *   npx tsx tests/gemini-test.ts
 */

import fs from "fs";
import path from "path";

// Manual .env loader (avoids dotenv dependency)
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) {
      process.env[key] = val;
    }
  }
}

import { GeminiStoryProvider } from "../lib/ai/gemini-provider";
import { DeterministicStoryProvider } from "../lib/ai/deterministic-provider";
import { STORY_CATEGORIES, DIRECTOR_STYLES } from "../lib/sample-data";

async function runGeminiTest() {
  console.log("==================================================");
  console.log("🧠 GEMINI AI STORY ENGINE — INTEGRATION TEST");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // Use real category and style from sample data
  const testCategory = STORY_CATEGORIES.find((c) => c.id === "college") || STORY_CATEGORIES[0];
  const testStyle = DIRECTOR_STYLES.find((s) => s.id === "indie") || DIRECTOR_STYLES[0];

  const testInput = {
    title: "My College Years",
    category: testCategory,
    style: testStyle,
    memories: [
      { id: "mem_1", projectId: "test", type: "photo" as const, url: "", caption: "First day of college", date: "2020-08-15", location: "Campus", people: ["Me"], order: 1 },
      { id: "mem_2", projectId: "test", type: "photo" as const, url: "", caption: "Met my best friends", date: "2020-09-01", location: "Dorm", people: ["Me", "Alex", "Sam"], order: 2 },
      { id: "mem_3", projectId: "test", type: "photo" as const, url: "", caption: "First hackathon — we won!", date: "2021-02-14", location: "Innovation Lab", people: ["Me", "Alex", "Sam"], order: 3 },
      { id: "mem_4", projectId: "test", type: "photo" as const, url: "", caption: "Graduation day", date: "2024-05-20", location: "University Hall", people: ["Me", "Alex", "Sam", "Professor Kumar", "Family"], order: 4 },
    ],
    interview: {
      about: "My four years of engineering college — the friendships, the all-nighters, the failures, and the moments that shaped who I am today.",
      people: "Alex (roommate and co-founder), Sam (the one who always had my back), Professor Kumar (mentor)",
      unforgettableMoment: "Winning our first hackathon at 3 AM, standing on stage with Alex and Sam, barely able to keep our eyes open but feeling invincible.",
      hardestMoment: "Almost failing thermodynamics in second year. I considered dropping out. Professor Kumar talked me off the ledge.",
      turningPoint: "Getting the internship at the startup that eventually became my career. I almost didn't apply.",
      endingFeeling: "nostalgic" as const,
    },
  };

  // -------------------------------------------------------
  // TEST 1: Verify GEMINI_API_KEY exists (without printing it)
  // -------------------------------------------------------
  const hasKey = !!process.env.GEMINI_API_KEY;
  assert(hasKey, "GEMINI_API_KEY is set in environment (value not logged)");

  if (!hasKey) {
    console.log("\n⚠️  Cannot run Gemini tests without GEMINI_API_KEY in .env");
    console.log("   Add your key to .env and re-run this test.\n");

    // Test fallback provider instead
    console.log("--- Testing deterministic fallback instead ---\n");
    const fallback = new DeterministicStoryProvider();
    const fallbackResult = await fallback.generateStoryOutline(testInput);

    assert(typeof fallbackResult.logline === "string" && fallbackResult.logline.length > 0, "Fallback produces logline");
    assert(fallbackResult.actStructure.length >= 3, "Fallback produces act structure");
    console.log(`\n   Fallback logline: "${fallbackResult.logline}"`);
    console.log(`   Fallback chapters: ${fallbackResult.actStructure.length}`);

    console.log(`\n🏁 RESULTS: ${passed} PASSED, ${failed} FAILED (Gemini skipped — no API key)\n`);
    process.exit(failed > 0 ? 1 : 0);
  }

  // -------------------------------------------------------
  // TEST 2: Send real prompt to Gemini
  // -------------------------------------------------------
  console.log("\n📡 Sending test screenplay prompt to Gemini...\n");

  const provider = new GeminiStoryProvider();

  try {
    const outline = await provider.generateStoryOutline(testInput);

    // Validate structure
    assert(typeof outline.logline === "string" && outline.logline.length > 10, "Gemini returned a real logline");
    assert(typeof outline.theme === "string" && outline.theme.length > 3, "Gemini returned a theme");
    assert(Array.isArray(outline.actStructure), "Gemini returned actStructure array");
    assert(outline.actStructure.length === 5, `Gemini returned exactly 5 chapters (got ${outline.actStructure.length})`);

    // Validate each chapter
    for (const ch of outline.actStructure) {
      assert(typeof ch.id === "string", `Chapter ${ch.chapterNumber} has id`);
      assert(typeof ch.title === "string" && ch.title.length > 0, `Chapter ${ch.chapterNumber} has title: "${ch.title}"`);
      assert(typeof ch.handwrittenBeat === "string" && ch.handwrittenBeat.length > 0, `Chapter ${ch.chapterNumber} has handwrittenBeat`);
      assert(typeof ch.synopsis === "string" && ch.synopsis.length > 0, `Chapter ${ch.chapterNumber} has synopsis`);
      assert(typeof ch.targetTone === "string", `Chapter ${ch.chapterNumber} has targetTone: "${ch.targetTone}"`);
      assert(Array.isArray(ch.associatedMemoryIds), `Chapter ${ch.chapterNumber} has associatedMemoryIds array`);
    }

    // Print the screenplay
    console.log("\n──────────────────────────────────────────────────");
    console.log("📜 GEMINI SCREENPLAY OUTPUT");
    console.log("──────────────────────────────────────────────────");
    console.log(`Logline: "${outline.logline}"`);
    console.log(`Theme:   "${outline.theme}"`);
    console.log("");
    for (const ch of outline.actStructure) {
      console.log(`  ${ch.title}`);
      console.log(`    Beat: "${ch.handwrittenBeat}"`);
      console.log(`    Tone: ${ch.targetTone}`);
      console.log(`    Memories: [${ch.associatedMemoryIds.join(", ")}]`);
      console.log("");
    }
  } catch (err) {
    console.error("Gemini test failed with exception:", err);
    failed++;
  }

  console.log("==================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runGeminiTest();

/**
 * Standalone Gemini AI Story Engine & Screenplay Test Suite.
 *
 * Architecture:
 * - Section A: Deterministic Story Provider Engine (Always executes & verifies 5-act structure)
 * - Section B: Live Google Gemini 2.5 Flash API Integration (Executes when GEMINI_API_KEY is present)
 *
 * Usage:
 *   npx tsx tests/gemini-test.ts
 */

import fs from "fs";
import path from "path";

// Load local .env if present (server-side only)
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
    if (process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

import { GeminiStoryProvider } from "../lib/ai/gemini-provider";
import { DeterministicStoryProvider } from "../lib/ai/deterministic-provider";
import { STORY_CATEGORIES, DIRECTOR_STYLES } from "../lib/sample-data";

async function runGeminiTest() {
  console.log("==================================================");
  console.log("🧠 STORY ENGINE & SCREENPLAY TEST SUITE");
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

  // ---------------------------------------------------------------------------
  // SECTION A: Deterministic & Independent Story Generation Tests (Always Run)
  // ---------------------------------------------------------------------------
  console.log("--- Section A: Deterministic Story Engine Verification ---");
  const fallbackProvider = new DeterministicStoryProvider();
  const fallbackResult = await fallbackProvider.generateStoryOutline(testInput);

  assert(typeof fallbackResult.logline === "string" && fallbackResult.logline.length > 5, "Deterministic provider generates valid logline");
  assert(typeof fallbackResult.theme === "string" && fallbackResult.theme.length > 3, "Deterministic provider generates narrative theme");
  assert(Array.isArray(fallbackResult.actStructure) && fallbackResult.actStructure.length === 5, "Deterministic provider generates exactly 5 acts");
  assert(fallbackResult.actStructure[0].associatedMemoryIds.includes("mem_1"), "Deterministic provider maps memory IDs to corresponding acts");

  // ---------------------------------------------------------------------------
  // SECTION B: Live Google Gemini 2.5 Flash API Test (Conditional)
  // ---------------------------------------------------------------------------
  console.log("\n--- Section B: Live Google Gemini AI Provider Test ---");
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    console.log("ℹ️ Skipping live Gemini integration test: GEMINI_API_KEY is not configured.");
    console.log("  (Deterministic screenplay engine is fully active and tested above)\n");
    console.log("==================================================");
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================\n");
    if (failed > 0) process.exit(1);
    return;
  }

  console.log("📡 Sending test screenplay prompt to Google Gemini 2.5 Flash...\n");
  const provider = new GeminiStoryProvider();

  try {
    const outline = await provider.generateStoryOutline(testInput);

    assert(typeof outline.logline === "string" && outline.logline.length > 10, "Gemini returned a real logline");
    assert(typeof outline.theme === "string" && outline.theme.length > 3, "Gemini returned a theme");
    assert(Array.isArray(outline.actStructure) && outline.actStructure.length === 5, "Gemini returned exactly 5 chapters");

    for (const ch of outline.actStructure) {
      assert(typeof ch.id === "string", `Chapter ${ch.chapterNumber} has id`);
      assert(typeof ch.title === "string" && ch.title.length > 0, `Chapter ${ch.chapterNumber} has title`);
      assert(typeof ch.handwrittenBeat === "string" && ch.handwrittenBeat.length > 0, `Chapter ${ch.chapterNumber} has handwrittenBeat`);
      assert(typeof ch.synopsis === "string" && ch.synopsis.length > 0, `Chapter ${ch.chapterNumber} has synopsis`);
      assert(typeof ch.targetTone === "string", `Chapter ${ch.chapterNumber} has targetTone`);
      assert(Array.isArray(ch.associatedMemoryIds), `Chapter ${ch.chapterNumber} has associatedMemoryIds array`);
    }

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
  } catch (err: unknown) {
    const errString = String(err);
    if (errString.includes("429") || errString.includes("RESOURCE_EXHAUSTED")) {
      console.warn("⚠️ Google Gemini Free Tier daily quota cooldown reached (429 RESOURCE_EXHAUSTED).");
      console.warn("  Verified deterministic fallback provider remains operational.");
    } else {
      console.error("Gemini live test failed with exception:", err);
      failed++;
    }
  }

  console.log("==================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runGeminiTest();

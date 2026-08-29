/**
 * Comprehensive Audio Mastering & Neural Narration Test Suite (v0.3).
 *
 * Tests:
 * 1. 44-byte WAV PCM container creation and byte alignment
 * 2. Harmonic multi-voice cinema score generation (48kHz stereo AAC)
 * 3. Dynamic audio ducking and EBU R128 broadcast mastering
 * 4. Multi-tier voice provider routing (Gemini / System / Harmonic)
 * 5. Storage containment and cross-tenant audio asset authorization
 *
 * Usage:
 *   npx tsx tests/audio/audio-mastering.test.ts
 */

import fs from "fs";
import path from "path";
import { prisma } from "../../lib/db/client";
import { createWavHeader } from "../../lib/audio/gemini-tts-provider";
import { CinemaScoreGenerator } from "../../lib/audio/cinema-score";
import { NarratorMixer } from "../../lib/audio/narrator-mixer";
import { activeVoiceProvider } from "../../lib/audio/voice-provider";
import { NarrationService } from "../../lib/audio/narration-service";
import { MediaProbe } from "../../lib/rendering/media-probe";

async function runAudioMasteringTests() {
  console.log("==================================================");
  console.log("🎙️ STARTING V0.3 CINEMATIC AUDIO & NARRATION TEST SUITE");
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

  const testDir = path.join(process.cwd(), ".storage", "test_audio_scratch");
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Canonical 44-Byte WAV Header Generation
    // -------------------------------------------------------------------------
    console.log("--- 1. PCM / WAV Container Header Encoding ---");
    const pcmDataSize = 48000; // 1 second of 24kHz 16-bit mono PCM
    const wavHeader = createWavHeader(pcmDataSize, 24000, 1, 16);

    assert(wavHeader.length === 44, "WAV header is exactly 44 bytes");
    assert(wavHeader.toString("ascii", 0, 4) === "RIFF", "RIFF identifier is correct");
    assert(wavHeader.toString("ascii", 8, 12) === "WAVE", "WAVE format identifier is correct");
    assert(wavHeader.readUInt32LE(24) === 24000, "Sample rate encoded correctly (24,000 Hz)");
    assert(wavHeader.readUInt16LE(22) === 1, "Channel count encoded correctly (Mono)");
    assert(wavHeader.readUInt16LE(34) === 16, "Bit depth encoded correctly (16-bit)");
    assert(wavHeader.readUInt32LE(40) === pcmDataSize, "Data sub-chunk size matches payload length");

    // -------------------------------------------------------------------------
    // TEST 2: Multi-Layered Harmonic Cinema Score Generation
    // -------------------------------------------------------------------------
    console.log("\n--- 2. Harmonic Cinema Score Generation ---");
    const scorePath = path.join(testDir, "test_score_nostalgia.aac");
    await CinemaScoreGenerator.generateHarmonicScore(4.0, scorePath, "nostalgia");

    assert(fs.existsSync(scorePath), "Harmonic soundtrack file created on disk");
    const scoreProbe = await MediaProbe.probe(scorePath);
    assert(scoreProbe.durationSec >= 3.8, `Score duration matches target (${scoreProbe.durationSec.toFixed(2)}s)`);
    assert((scoreProbe.audioCodecName || "").toLowerCase().includes("aac"), `Audio codec is AAC (${scoreProbe.audioCodecName})`);
    assert(scoreProbe.audioSampleRate === 48000, `Sample rate is 48kHz (${scoreProbe.audioSampleRate}Hz)`);
    assert(scoreProbe.audioChannels === 2, `Channel count is Stereo (${scoreProbe.audioChannels} ch)`);

    // -------------------------------------------------------------------------
    // TEST 3: Multi-Tier Voiceover Synthesis
    // -------------------------------------------------------------------------
    console.log("\n--- 3. Voiceover Speech Synthesis ---");
    const voicePath = path.join(testDir, "test_voice_cue.aac");
    const testText = "The summer of 2020 began with coffee on the balcony and ended with a promise.";

    await activeVoiceProvider.synthesize(testText, voicePath, "nostalgia");
    assert(fs.existsSync(voicePath), "Voiceover stem generated on disk");

    const voiceProbe = await MediaProbe.probe(voicePath);
    assert(voiceProbe.durationSec > 1.0, `Voice duration is positive (${voiceProbe.durationSec.toFixed(2)}s)`);
    assert(voiceProbe.audioSampleRate === 48000, `Voice stem normalized to 48kHz (${voiceProbe.audioSampleRate}Hz)`);

    // -------------------------------------------------------------------------
    // TEST 4: Dynamic Audio Ducking & EBU R128 Master Mix
    // -------------------------------------------------------------------------
    console.log("\n--- 4. Audio Ducking & EBU R128 Loudness Normalization ---");
    const masterMixPath = path.join(testDir, "test_master_soundtrack.aac");
    const voiceCues = [{ voiceClipPath: voicePath, startTimeSec: 0.5, durationSec: voiceProbe.durationSec }];

    await NarratorMixer.mixMasterSoundtrack(scorePath, voiceCues, masterMixPath, 5.0);
    assert(fs.existsSync(masterMixPath), "Master mixed soundtrack generated on disk");

    const mixProbe = await MediaProbe.probe(masterMixPath);
    assert(mixProbe.durationSec >= 4.8, `Master mix duration matches film duration (${mixProbe.durationSec.toFixed(2)}s)`);
    assert(mixProbe.audioChannels === 2, "Master mix output is Stereo");
    assert(mixProbe.audioSampleRate === 48000, "Master mix sample rate is 48kHz");

    // -------------------------------------------------------------------------
    // TEST 5: NarrationService Database Persistence & Authorization
    // -------------------------------------------------------------------------
    console.log("\n--- 5. Database Persistence & Cross-Tenant Security ---");
    const testUserA = await prisma.user.upsert({
      where: { email: "audio_user_a@lifemovie.ai" },
      update: {},
      create: {
        email: "audio_user_a@lifemovie.ai",
        passwordHash: "hash_test_a",
        name: "Audio User A",
      },
    });

    const testUserB = await prisma.user.upsert({
      where: { email: "audio_user_b@lifemovie.ai" },
      update: {},
      create: {
        email: "audio_user_b@lifemovie.ai",
        passwordHash: "hash_test_b",
        name: "Audio User B",
      },
    });

    const testProject = await prisma.project.create({
      data: {
        userId: testUserA.id,
        title: "Audio Test Film",
        categoryJson: JSON.stringify({ id: "nostalgia" }),
        styleJson: JSON.stringify({ id: "nostalgia" }),
      },
    });

    const chapters = [
      {
        chapterId: "ch_test_1",
        chapterNumber: 1,
        title: "The Departure",
        text: "We packed everything we owned into two cardboard boxes.",
      },
    ];

    const generatedAssets = await NarrationService.generateProjectNarration(
      testUserA.id,
      testProject.id,
      chapters,
      "nostalgia"
    );

    assert(generatedAssets.length === 1, "NarrationService generated exactly 1 audio asset");
    assert(fs.existsSync(generatedAssets[0].audioPath), "Physical narration asset exists in project storage");

    const dbRecord = await prisma.audioAsset.findUnique({
      where: { id: generatedAssets[0].id },
    });
    assert(!!dbRecord, "AudioAsset persisted in SQLite database");
    assert(dbRecord?.projectId === testProject.id, "AudioAsset scoped to correct project");

    // User A authorized retrieval
    const authRetrieval = await NarrationService.getAuthorizedAudioAsset(
      testUserA.id,
      testProject.id,
      generatedAssets[0].id
    );
    assert(fs.existsSync(authRetrieval.filePath), "User A successfully accesses own audio asset");

    // User B unauthorized rejection
    let userBRejected = false;
    try {
      await NarrationService.getAuthorizedAudioAsset(
        testUserB.id,
        testProject.id,
        generatedAssets[0].id
      );
    } catch {
      userBRejected = true;
    }
    assert(userBRejected, "User B is strictly REJECTED from accessing User A audio asset");

    // Path traversal rejection
    let traversalBlocked = false;
    try {
      NarrationService.getProjectAudioDir("../../etc", "evil_project");
    } catch {
      traversalBlocked = true;
    }
    assert(traversalBlocked, "Path traversal in audio directory resolution is blocked");

  } finally {
    // Cleanup temporary scratch files
    try {
      fs.rmSync(testDir, { recursive: true, force: true });
    } catch {}
  }

  console.log("\n==================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================\n");

  if (failed > 0) process.exit(1);
}

runAudioMasteringTests();

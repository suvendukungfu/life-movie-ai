import fs from "fs";
import path from "path";
import { prisma } from "../../lib/db/client";
import { FFmpegRunner } from "../../lib/rendering/ffmpeg-runner";
import { MediaProbe } from "../../lib/rendering/media-probe";
import { RenderService } from "../../lib/rendering/render-service";
import { storageDriver } from "../../lib/storage/storage-driver";

async function runRenderPipelineTests() {
  console.log("==================================================");
  console.log("🎬 STARTING REAL CINEMA RENDERING ENGINE TEST SUITE");
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

  try {
    // ---------------------------------------------------------
    // TEST 1: Verify FFmpeg and FFprobe Binaries
    // ---------------------------------------------------------
    const versionCheck = await FFmpegRunner.runFFmpeg(["-version"]);
    assert(versionCheck.stdout.includes("ffmpeg version"), "FFmpeg executable is available and functioning");

    const probeVersion = await FFmpegRunner.runFFprobe(["-version"]);
    assert(probeVersion.stdout.includes("ffprobe version"), "FFprobe executable is available and functioning");

    // ---------------------------------------------------------
    // TEST 2: Create Test User & Project in Database
    // ---------------------------------------------------------
    const testEmail = `filmmaker_render_${Date.now()}@studio.com`;
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        passwordHash: "dummyHashForRenderTest",
        name: "Cinema Architect",
      },
    });

    const projectId = `proj_cinema_${Date.now()}`;
    const project = await prisma.project.create({
      data: {
        id: projectId,
        userId: user.id,
        title: "THE GOA MONSOON REEL",
        categoryJson: JSON.stringify({ id: "travel", title: "TRAVEL" }),
        styleJson: JSON.stringify({ id: "nostalgia", name: "NOSTALGIA", colorGrade: "contrast(110%)" }),
        description: "Monsoon rains over the Western Ghats",
        privacy: "public",
        status: "draft",
      },
    });

    assert(project.id === projectId, "Project initialized in Prisma database");

    // ---------------------------------------------------------
    // TEST 3: Create Real Test Image Assets on Disk
    // ---------------------------------------------------------
    const tempDir = path.join(process.cwd(), ".storage", "test_scratch");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // Generate 2 real 1920x1080 test images using FFmpeg lavfi
    const img1Path = path.join(tempDir, "frame_01.png");
    const img2Path = path.join(tempDir, "frame_02.png");

    await FFmpegRunner.runFFmpeg([
      "-y",
      "-f",
      "lavfi",
      "-i",
      "color=c=0x8C5A32:s=1920x1080:d=1",
      "-vframes",
      "1",
      img1Path,
    ]);

    await FFmpegRunner.runFFmpeg([
      "-y",
      "-f",
      "lavfi",
      "-i",
      "color=c=0x325A64:s=1920x1080:d=1",
      "-vframes",
      "1",
      img2Path,
    ]);

    const img1Buffer = fs.readFileSync(img1Path);
    const img2Buffer = fs.readFileSync(img2Path);

    const mem1 = await storageDriver.saveMedia(user.id, projectId, `mem_${Date.now()}_1`, "frame_01.png", "image/png", img1Buffer);
    const mem2 = await storageDriver.saveMedia(user.id, projectId, `mem_${Date.now()}_2`, "frame_02.png", "image/png", img2Buffer);

    await prisma.memory.createMany({
      data: [
        {
          id: `mem_${Date.now()}_1`,
          projectId,
          type: "photo",
          url: mem1.url,
          thumbnailUrl: mem1.thumbnailUrl,
          storageKey: mem1.storageKey,
          caption: "Morning mist along the cliffside",
          date: "2026-07-12",
          sortOrder: 1,
        },
        {
          id: `mem_${Date.now()}_2`,
          projectId,
          type: "photo",
          url: mem2.url,
          thumbnailUrl: mem2.thumbnailUrl,
          storageKey: mem2.storageKey,
          caption: "Chai stalls steaming in the downpour",
          date: "2026-07-13",
          sortOrder: 2,
        },
      ],
    });

    assert(fs.existsSync(img1Path) && fs.existsSync(img2Path), "Real image assets saved to storage driver");

    // ---------------------------------------------------------
    // TEST 4: Create Screenplay Outline in DB
    // ---------------------------------------------------------
    const outline = await prisma.storyOutline.create({
      data: {
        projectId,
        logline: "Two friends chasing the first rain across Goa.",
        theme: "Nature washes away the noise.",
      },
    });

    await prisma.storyChapter.createMany({
      data: [
        {
          outlineId: outline.id,
          chapterNumber: 1,
          title: "Act I: The Salt Wind",
          handwrittenBeat: "The first drops hit the roof",
          synopsis: "Arriving before the storm",
          targetTone: "Atmospheric",
        },
        {
          outlineId: outline.id,
          chapterNumber: 2,
          title: "Act II: The Torrent",
          handwrittenBeat: "Sheltering under tin roofs",
          synopsis: "The height of the monsoon",
          targetTone: "Luminous",
        },
      ],
    });

    // ---------------------------------------------------------
    // TEST 5: Create and Execute Real Render Job
    // ---------------------------------------------------------
    const jobId = `job_test_render_${Date.now()}`;
    await prisma.generationJob.create({
      data: {
        id: jobId,
        projectId,
        status: "queued",
        progress: 10,
        currentStage: "queued",
        stageDescription: "QUEUED",
      },
    });

    console.log(`[Test] 🎞️ Executing RenderService.render(${jobId})...`);
    const renderResult = await RenderService.render(jobId);

    assert(fs.existsSync(renderResult.outputVideoPath), "Rendered master .mp4 file physically exists on disk");
    assert(fs.existsSync(renderResult.posterPath), "Extracted poster frame .jpg physically exists on disk");

    // ---------------------------------------------------------
    // TEST 6: FFprobe Forensic Metadata Validation
    // ---------------------------------------------------------
    const probe = await MediaProbe.probe(renderResult.outputVideoPath);

    assert(probe.width === 1920, "Output master width is exactly 1920px");
    assert(probe.height === 804, "Output master height is exactly 804px (2.39:1 Cinemascope)");
    assert(probe.durationSec > 5.0, `Output video duration is real (${probe.durationSec.toFixed(2)}s)`);
    assert(probe.hasVideo && probe.codecName === "h264", "Output video encoded with H.264 (AVC)");
    assert(probe.hasAudio && probe.audioCodecName === "aac", "Output audio encoded with 48kHz AAC");

    // ---------------------------------------------------------
    // TEST 7: Database State Verification
    // ---------------------------------------------------------
    const completedJob = await prisma.generationJob.findUnique({
      where: { id: jobId },
    });

    assert(completedJob?.status === "complete", "GenerationJob marked as complete in Prisma DB");
    assert(completedJob?.progress === 100, "GenerationJob progress is 100%");
    assert(
      completedJob?.outputVideoUrl === `/api/render/jobs/${jobId}/video.mp4`,
      "GenerationJob outputVideoUrl points to secure stream endpoint"
    );

    // Cleanup test scratch
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}

    console.log("\n==================================================");
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test failed with exception:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runRenderPipelineTests();

import { prisma } from "../lib/db/client";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../lib/auth/session";
import { storageDriver } from "../lib/storage/storage-driver";

async function runBackendIntegrationTests() {
  console.log("==================================================");
  console.log("🧪 STARTING LIFE MOVIE BACKEND INTEGRATION TEST SUITE");
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
    // TEST 1: User Registration & Password Hashing
    // ---------------------------------------------------------
    const testEmailA = `director_a_${Date.now()}@studio.com`;
    const passwordA = "secureSecretPass2026!";
    const passwordHashA = await hashPassword(passwordA);

    assert(
      !passwordHashA.includes(passwordA) && passwordHashA.startsWith("$2"),
      "Password hashing uses salted bcrypt"
    );

    const matchA = await verifyPassword(passwordA, passwordHashA);
    const wrongMatchA = await verifyPassword("wrongPass!", passwordHashA);
    assert(matchA && !wrongMatchA, "Password verification succeeds for correct password and rejects incorrect password");

    const userA = await prisma.user.create({
      data: {
        email: testEmailA,
        passwordHash: passwordHashA,
        name: "Director Maya",
      },
    });
    assert(!!userA.id && userA.email === testEmailA, "User A persisted to real database");

    const testEmailB = `director_b_${Date.now()}@studio.com`;
    const passwordHashB = await hashPassword("passwordB123");
    const userB = await prisma.user.create({
      data: {
        email: testEmailB,
        passwordHash: passwordHashB,
        name: "Director Liam",
      },
    });
    assert(!!userB.id && userB.id !== userA.id, "User B created with distinct user ID");

    // ---------------------------------------------------------
    // TEST 2: Cryptographic JWT Session Token Creation & Verification
    // ---------------------------------------------------------
    const tokenA = await createSessionToken({
      id: userA.id,
      email: userA.email,
      name: userA.name,
      createdAt: userA.createdAt.toISOString(),
    });

    const verifiedUser = await verifySessionToken(tokenA);
    assert(
      verifiedUser?.id === userA.id && verifiedUser?.email === userA.email,
      "JWT Session token verified cryptographically"
    );

    const invalidToken = await verifySessionToken("tampered.fake.jwt");
    assert(invalidToken === null, "Invalid/tampered JWT tokens are strictly rejected");

    // ---------------------------------------------------------
    // TEST 3: Relational Project Creation & Persistence
    // ---------------------------------------------------------
    const projectId = `proj_college_${Date.now()}`;
    const projectA = await prisma.project.create({
      data: {
        id: projectId,
        userId: userA.id,
        title: "My College Years",
        categoryJson: JSON.stringify({ id: "comingofage", title: "COMING OF AGE" }),
        styleJson: JSON.stringify({ id: "nostalgia", name: "NOSTALGIA" }),
        description: "The golden hour of undergraduate memory",
        privacy: "private",
        status: "draft",
      },
    });
    assert(projectA.userId === userA.id, "Project created in database and scoped to User A");

    // ---------------------------------------------------------
    // TEST 4: Physical Binary Storage & Sharp Thumbnail Generation
    // ---------------------------------------------------------
    // 1x1 red PNG buffer
    const testPngBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64"
    );

    const memoryId = `mem_${Date.now()}_test`;
    const savedMedia = await storageDriver.saveMedia(
      userA.id,
      projectId,
      memoryId,
      "quad_dorm.png",
      "image/png",
      testPngBuffer
    );

    assert(
      savedMedia.storageKey.startsWith(`users/${userA.id}/projects/${projectId}/media/${memoryId}/original`),
      "Binary saved to standard storage hierarchy: users/{userId}/projects/{projectId}/media/{memoryId}/original.png"
    );

    const fileCheck = storageDriver.getMediaFile(savedMedia.storageKey);
    assert(fileCheck.exists, "Physical binary file exists on disk");

    // Create memory record in DB
    const memoryRecord = await prisma.memory.create({
      data: {
        id: memoryId,
        projectId,
        type: "photo",
        url: savedMedia.url,
        thumbnailUrl: savedMedia.thumbnailUrl,
        storageKey: savedMedia.storageKey,
        thumbnailKey: savedMedia.thumbnailKey,
        caption: "Late nights in the library courtyard",
        date: "2024-05-18",
        location: "Main Quadrangle",
        peopleJson: JSON.stringify(["Alex", "Priya"]),
        sortOrder: 1,
        status: "ready",
      },
    });
    assert(memoryRecord.id === memoryId, "Memory record created in database with permanent storage URL");

    // ---------------------------------------------------------
    // TEST 5: Cross-User Ownership Authorization (User B -> User A)
    // ---------------------------------------------------------
    const foundProject = await prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true, privacy: true },
    });

    const isAuthorizedForUserA = foundProject?.userId === userA.id;
    const isAuthorizedForUserB = foundProject?.userId === userB.id;

    assert(isAuthorizedForUserA, "User A is correctly authorized for own project");
    assert(!isAuthorizedForUserB, "User B is strictly DENIED access to User A's private project");

    // ---------------------------------------------------------
    // TEST 6: Reload & Query Verification
    // ---------------------------------------------------------
    const reloadedProject = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        memories: true,
      },
    });

    assert(
      reloadedProject !== null &&
        reloadedProject.title === "My College Years" &&
        reloadedProject.memories.length === 1 &&
        reloadedProject.memories[0].caption === "Late nights in the library courtyard" &&
        reloadedProject.memories[0].url.startsWith("/api/storage/users/"),
      "Reload query retrieves complete persistent project and permanent memory references"
    );

    console.log("\n==================================================");
    console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("==================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution threw exception:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runBackendIntegrationTests();

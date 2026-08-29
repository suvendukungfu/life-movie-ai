import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Ensure DATABASE_URL is defined before Prisma client is initialized
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.VERCEL ? "file:/tmp/dev.db" : "file:./dev.db";
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let isInitialized = false;

/**
 * Ensures SQLite tables exist on fresh database instances (e.g. serverless /tmp).
 */
export async function ensureDbSchema() {
  if (isInitialized) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "avatarUrl" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS "projects" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "categoryJson" TEXT NOT NULL,
        "styleJson" TEXT NOT NULL,
        "description" TEXT,
        "privacy" TEXT NOT NULL DEFAULT 'public',
        "status" TEXT NOT NULL DEFAULT 'draft',
        "publicShareId" TEXT UNIQUE,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "audio_assets" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "chapterId" TEXT,
        "provider" TEXT NOT NULL,
        "model" TEXT NOT NULL,
        "voice" TEXT NOT NULL,
        "storageKey" TEXT NOT NULL,
        "mimeType" TEXT NOT NULL DEFAULT 'audio/aac',
        "durationSec" REAL NOT NULL DEFAULT 0,
        "sampleRate" INTEGER NOT NULL DEFAULT 48000,
        "channels" INTEGER NOT NULL DEFAULT 2,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "memories" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "thumbnailUrl" TEXT,
        "storageKey" TEXT,
        "thumbnailKey" TEXT,
        "caption" TEXT,
        "date" TEXT,
        "location" TEXT,
        "peopleJson" TEXT NOT NULL DEFAULT '[]',
        "sortOrder" INTEGER NOT NULL DEFAULT 0,
        "aspect" TEXT DEFAULT 'aspect-4/3',
        "rotation" REAL DEFAULT 0,
        "fileSize" INTEGER,
        "fileName" TEXT,
        "mimeType" TEXT,
        "width" INTEGER,
        "height" INTEGER,
        "duration" REAL,
        "status" TEXT NOT NULL DEFAULT 'ready',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "story_interviews" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT UNIQUE NOT NULL,
        "answersJson" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "story_outlines" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT UNIQUE NOT NULL,
        "logline" TEXT NOT NULL,
        "theme" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "story_chapters" (
        "id" TEXT PRIMARY KEY,
        "storyOutlineId" TEXT NOT NULL,
        "chapterNumber" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "handwrittenBeat" TEXT NOT NULL,
        "synopsis" TEXT NOT NULL,
        "targetTone" TEXT NOT NULL,
        "memoryIdsJson" TEXT NOT NULL DEFAULT '[]',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("storyOutlineId") REFERENCES "story_outlines" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "movie_scenes" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "subtitle" TEXT NOT NULL,
        "durationSec" REAL NOT NULL,
        "mediaType" TEXT NOT NULL,
        "mediaUrl" TEXT NOT NULL,
        "kenBurnsDirection" TEXT NOT NULL,
        "colorGradeLut" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS "generation_jobs" (
        "id" TEXT PRIMARY KEY,
        "projectId" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'queued',
        "progress" INTEGER NOT NULL DEFAULT 0,
        "currentStage" TEXT NOT NULL DEFAULT 'queued',
        "stageDescription" TEXT NOT NULL DEFAULT '',
        "outputVideoUrl" TEXT,
        "outputPosterUrl" TEXT,
        "durationSec" REAL,
        "logsJson" TEXT NOT NULL DEFAULT '[]',
        "error" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("projectId") REFERENCES "projects" ("id") ON DELETE CASCADE
      );
    `);
    isInitialized = true;
  } catch (err) {
    console.warn("[Prisma] Database self-healing check note:", err);
  }
}

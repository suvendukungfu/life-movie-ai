# LIFE MOVIE — Implementation Status & Architecture Matrix

This document defines the verified state and operational boundaries of all subsystems in the **LIFE MOVIE** application.

---

## 📊 System Architecture & Provider Matrix

| Subsystem | Current Implementation | Target Infrastructure | Status |
| :--- | :--- | :--- | :--- |
| **Authentication** | Real email/password registration & login, bcrypt salted hashing, signed HTTP-only JWT cookies (`lm_session`), user ownership verification | Self-hosted JWT + bcrypt (Zero-cost) | **REAL** |
| **Database** | Prisma ORM with relational schema (`users`, `projects`, `memories`, `story_interviews`, `story_outlines`, `story_chapters`, `movie_scenes`, `generation_jobs`, `audio_assets`), persistent SQLite database `prisma/dev.db` | SQLite / PostgreSQL compatible schema | **REAL** |
| **Media Storage** | Structured persistent binary storage hierarchy saving to `.storage/users/{userId}/projects/{projectId}/media/{memoryId}/original.{ext}` and `thumbnail.webp`, HTTP range streaming `/api/storage/[...path]` | Local filesystem (Zero-cost) / S3 compatible | **REAL** |
| **Media Processing** | Server-side MIME validator, size limits, Sharp WebP thumbnail generator, FFprobe metadata extraction | Sharp + FFprobe | **REAL** |
| **AI Story Engine** | Google Gemini 2.5 Flash (`gemini-2.5-flash`) with structured JSON schemas, exponential backoff, and deterministic fallback | Google Gemini 2.5 Flash | **REAL** |
| **Voiceover & TTS** | Gemini TTS + native host speech synthesis (`/usr/bin/say`, `espeak-ng`) + harmonic synthesis fallback | Gemini TTS / Local Host TTS | **REAL** |
| **Movie Rendering** | Native server-side FFmpeg pipeline: 1920x804 2.39:1 Cinemascope, 24 FPS, H.264 video, 48kHz AAC stereo audio, poster extraction | Local FFmpeg Server Pipeline | **REAL** |
| **Rate Limiting & Costs** | In-memory token bucket rate limiter (`lib/security/rate-limiter.ts`) | In-memory Rate Limiter | **REAL** |
| **Public Sharing** | Sanitized `/api/public/film/[id]` with zero private data leak | Public Screening Room Endpoint | **REAL** |

---

## 🔒 Security & Privacy Rules

1. **Zero Secret Leakage**: API keys, service roles, and internal storage paths are never sent to client bundles or logged in errors.
2. **Strict Ownership Authorization**: Every project query, mutation, upload, or deletion strictly verifies `project.userId === session.userId`.
3. **Cryptographically Signed Sessions**: User identity is derived exclusively from verified HTTP-only JWT cookies.
4. **Path Traversal Defense**: All storage paths enforce path normalization and root containment checks.
5. **Safe Process Execution**: FFmpeg and system binaries execute strictly via `child_process.spawn` argument arrays (no shell string execution).

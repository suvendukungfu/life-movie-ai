# LIFE MOVIE — Implementation Status & Architecture Matrix

This document defines the current state and operational boundaries of all subsystems in the **LIFE MOVIE** application.

---

## 📊 System Architecture & Provider Matrix

| Subsystem | Current Implementation | Target Infrastructure | Status |
| :--- | :--- | :--- | :--- |
| **Authentication** | Real email/password registration & login, bcrypt password hashing, cryptographically signed HTTP-only JWT cookies (`lm_session`), user ownership verification | Auth.js / Supabase Auth / Clerk | **REAL** |
| **Database** | Prisma ORM with relational schema (`users`, `projects`, `memories`, `story_interviews`, `story_outlines`, `story_chapters`, `movie_scenes`, `generation_jobs`), SQLite development database `dev.db` | PostgreSQL (Neon / Supabase / AWS RDS) | **REAL** |
| **Object Storage** | Structured binary storage driver saving to `users/{userId}/projects/{projectId}/media/{memoryId}/original.{ext}` and `thumbnail.webp`, HTTP range streaming `/api/storage/[...path]` | Cloudflare R2 / AWS S3 | **REAL** |
| **Media Processing** | Server-side MIME validator, size limits, Sharp WebP thumbnail generator | Sharp / FFmpeg server worker | **REAL** |
| **AI Story Engine** | Deterministic director engine with structured JSON validation & pluggable Gemini/OpenAI hooks | Gemini 1.5 Pro / GPT-4o | **PROVIDER_INTERFACE** |
| **Voiceover & TTS** | Web Audio API synthesizer + TTS voice provider interface | ElevenLabs / OpenAI TTS | **PROVIDER_INTERFACE** |
| **Movie Rendering** | Browser-side 2.39:1 playback player + server-side job state machine | Remotion Lambda / FFmpeg worker cluster | **MOCKED** |
| **Rate Limiting & Costs** | In-memory token bucket rate limiter (`lib/security/rate-limiter.ts`) | Upstash Redis / Cloudflare KV | **REAL** |
| **Public Sharing** | Sanitized `/api/public/film/[id]` with zero private data leak | Edge CDN cached public screening room | **REAL** |

---

## 🔒 Security & Privacy Rules

1. **Zero Secret Leakage**: API keys, service roles, and internal storage paths are never sent to client bundles.
2. **Strict Ownership Authorization**: Every project query, mutation, upload, or deletion strictly verifies `project.userId === session.userId`.
3. **Cryptographically Signed Sessions**: User identity is derived exclusively from verified HTTP-only JWT cookies.
4. **Sanitized Public Responses**: Public screening routes (`/api/public/film/[id]`) strip user emails, internal IDs, and private drafts.
5. **Standard Storage Hierarchy**: All uploaded media is physically stored inside `users/{userId}/projects/{projectId}/media/{memoryId}/`.

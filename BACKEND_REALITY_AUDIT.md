# LIFE MOVIE Backend Reality Audit

**Date of Audit**: August 29, 2026  
**Auditor**: Senior Backend & Systems Forensic Lead  
**Repository**: `life-movie-ai`  
**Execution Environment**: macOS / Node.js v25.9.0 / Next.js 16.3.3 Turbopack

---

## 1. Executive Summary

This forensic audit evaluates the operational reality of the LIFE MOVIE backend infrastructure. Below is the honest, unspun percentage breakdown:

- **REAL PRODUCTION BACKEND**: **15%**  
  *(App Router API endpoints, request validation schemas, token-bucket rate limiter, and public sanitization filters).*
- **LOCAL PERSISTENCE**: **20%**  
  *(Local disk file-backed JSON store `.data/projects.json` that survives server restarts, plus client localStorage).*
- **MOCKED / INTERFACE ONLY / STUB**: **65%**  
  *(Cloud LLM story generation, Cloud TTS voice generation, signed S3/R2 binary object storage, FFmpeg/Remotion `.mp4` server rendering, and durable worker queues).*

---

## 2. Master Classification Matrix

| Subsystem | Classification | Concrete Evidence | What is Missing for Production |
| :--- | :--- | :--- | :--- |
| **Database** | **LOCAL** | File-backed `.data/projects.json` exists on disk (23 KB) and survives server restarts. No PostgreSQL connection or ORM. | Real PostgreSQL instance, connection pooling, migrations (Prisma/Drizzle), indexing, and ACID transaction guarantees. |
| **Authentication** | **MOCKED** | [`lib/auth/auth-service.ts`](file:///Users/suvendusahoo/lifeturn/life-movie-ai/lib/auth/auth-service.ts) hardcodes `DEFAULT_DEV_USER` (`user_filmmaker_01`, Arjun Mehta). No cryptographic JWT verify. | Auth.js / Clerk / Supabase Auth, bcrypt passwords, OAuth providers, refresh tokens, and session cookie validation. |
| **Object Storage** | **INTERFACE_ONLY** | [`lib/storage/object-storage.ts`](file:///Users/suvendusahoo/lifeturn/life-movie-ai/lib/storage/object-storage.ts) returns mock path `/api/upload/storage/...`. No S3/R2 SDK installed in `package.json`. | `@aws-sdk/client-s3`, AWS S3 or Cloudflare R2 bucket, pre-signed PUT URLs, CORS configuration, and binary storage. |
| **AI Story Engine** | **MOCKED** | [`lib/ai/story-provider.ts`](file:///Users/suvendusahoo/lifeturn/life-movie-ai/lib/ai/story-provider.ts) runs `DeterministicStoryProvider` (template string interpolation). No external LLM called. | Real OpenAI / Gemini API call via SDK (`openai` or `@google/genai`), prompt templates, temperature controls, and retry handlers. |
| **Voiceover / TTS** | **MOCKED** | [`lib/audio/voice-provider.ts`](file:///Users/suvendusahoo/lifeturn/life-movie-ai/lib/audio/voice-provider.ts) calculates duration from word count. Audio is client Web Audio oscillator tones. | ElevenLabs / OpenAI TTS API client, audio stem storage (`.mp3`/`.wav`), voice model management, and loudness normalization. |
| **Video Rendering** | **MOCKED** | [`lib/rendering/render-job-manager.ts`](file:///Users/suvendusahoo/lifeturn/life-movie-ai/lib/rendering/render-job-manager.ts) runs `setTimeout` status updates. Zero `.mp4` files exist on disk. | Remotion / FFmpeg rendering pipeline, canvas frame stitching, video compositor, audio stem mixing, and MP4 encoder. |
| **Background Jobs** | **MOCKED** | `renderJobManager` stores jobs in an ephemeral in-memory `Map`. Jobs are completely lost if Node.js restarts during generation. | Durable distributed queue (Redis / BullMQ / AWS SQS / Temporal), worker processes, and failure retry queues. |
| **Public Sharing** | **LOCAL** | [`app/api/public/film/[id]/route.ts`](file:///Users/suvendusahoo/lifeturn/life-movie-ai/app/api/public/film/[id]/route.ts) sanitizes and serves records from `.data/projects.json`. | Edge CDN caching and domain-level privacy token validation. |
| **Rate Limiting** | **LOCAL** | [`lib/security/rate-limiter.ts`](file:///Users/suvendusahoo/lifeturn/life-movie-ai/lib/security/rate-limiter.ts) implements an in-memory token bucket. Resets on server restart. | Upstash Redis or Cloudflare KV for distributed multi-instance rate limiting. |

---

## 3. Forensic Subsystem Deep-Dive

### 3.1. Database
- **Implementation**: [`lib/storage/db-repository.ts`](file:///Users/suvendusahoo/lifeturn/life-movie-ai/lib/storage/db-repository.ts) uses Node.js `fs.writeFileSync` to write to `/Users/suvendusahoo/lifeturn/life-movie-ai/.data/projects.json`.
- **Server Restart Test**:
  1. Created project `"THE JETSKI CHRONICLES"` via UI and POST `/api/projects`.
  2. Verified `.data/projects.json` contains the JSON record (23,309 bytes).
  3. Sent `GET http://localhost:3001/api/projects` -> successfully returned project record from disk.
- **Verdict**: **LOCAL PERSISTENT** (Survives server restarts on local disk, but is NOT a production database).

### 3.2. Authentication & Authorization
- **Implementation**: [`lib/auth/auth-service.ts`](file:///Users/suvendusahoo/lifeturn/life-movie-ai/lib/auth/auth-service.ts)
  ```typescript
  export const DEFAULT_DEV_USER: AuthUser = {
    id: "user_filmmaker_01",
    name: "Arjun Mehta",
    email: "arjun@lifemovie.studio",
    ...
  };
  ```
- **Evidence**: Every unauthenticated incoming request automatically receives `user_filmmaker_01`. No real authentication tokens, cookies, or password hashes exist.
- **Verdict**: **MOCKED / STUB**.

### 3.3. Object Storage & File Upload
- **Implementation**: `POST /api/upload/sign` returns:
  ```json
  {
    "success": true,
    "uploadUrl": "/api/upload/storage/projects/proj_test/raw_1787991996179_zz5wt5.jpg",
    "storageKey": "projects/proj_test/raw_1787991996179_zz5wt5.jpg"
  }
  ```
- **Evidence**: No handler exists for `/api/upload/storage/...`. No S3/R2 SDK is installed in `package.json`. Uploaded images in the UI are held in memory as `URL.createObjectURL(file)` browser blobs.
- **Verdict**: **INTERFACE ONLY**.

### 3.4. AI Story Generation
- **Implementation**: `POST /api/story/generate` returns:
  ```json
  {
    "success": true,
    "provider": "Deterministic Director Engine (Local)",
    "outline": { ... }
  }
  ```
- **Evidence**: No external LLM (OpenAI / Gemini) API call is executed. The engine uses deterministic TypeScript template string substitution.
- **Verdict**: **MOCKED (Deterministic Fallback)**.

### 3.5. Video Rendering & Background Jobs
- **Implementation**: [`lib/rendering/render-job-manager.ts`](file:///Users/suvendusahoo/lifeturn/life-movie-ai/lib/rendering/render-job-manager.ts)
  ```typescript
  const stages = [
    { stage: "analyzing", progress: 25, delayMs: 1000 },
    { stage: "story_ready", progress: 50, delayMs: 2000 },
    { stage: "generating_audio", progress: 70, delayMs: 3200 },
    { stage: "composing", progress: 85, delayMs: 4400 },
    { stage: "complete", progress: 100, delayMs: 5600 },
  ];
  ```
- **Evidence**:
  1. Ran disk search `find . -name "*.mp4"` -> **0 video files found**.
  2. The "render" is simulated by Javascript `setTimeout` intervals advancing an in-memory string.
  3. The "movie player" in the UI is an HTML `<img>` tag with CSS filters and Web Audio API synthesized audio notes.
  4. If the server process restarts during a render, the in-memory `Map` is wiped clean.
- **Verdict**: **MOCKED**.

---

## 4. Complete User Journey Reality

| Step | User Action | What Actually Executes | Reality Classification |
| :--- | :--- | :--- | :--- |
| **1. Create Project** | Enters title & arc | Updates React state | Client State |
| **2. Ingest Media** | Selects / drops JPGs | Creates browser `blob:` ObjectURLs | Browser Memory |
| **3. Contact Sheet** | Edits captions / metadata | Updates React memory state | Client State |
| **4. Interview** | Answers 6 questions | Updates React memory state | Client State |
| **5. Director Lens** | Selects style | Updates React memory state | Client State |
| **6. Story Outline** | Clicks Generate | `POST /api/story/generate` (Deterministic template) | **MOCKED AI** |
| **7. Approval & Render**| Clicks Render 4K | `POST /api/render/jobs` (Starts 5.6s `setTimeout`) | **MOCKED RENDER** |
| **8. Play Premiere** | Watches movie | HTML `<img>` + CSS filter + Web Audio synth | **BROWSER MONTAGE** |
| **9. Save Project** | Saves film | `POST /api/projects` (Writes to `.data/projects.json`) | **LOCAL FILE STORE** |
| **10. Share Film** | Opens `/film/[id]` | `GET /api/public/film/[id]` (Reads `.data/projects.json`) | **LOCAL FILE STORE** |

---

## 5. Dependency Audit (`package.json`)

```json
{
  "dependencies": {
    "@gsap/react": "^2.1.2",
    "canvas-confetti": "^1.9.4",
    "clsx": "^2.1.1",
    "gsap": "^3.15.0",
    "lucide-react": "^1.35.0",
    "next": "16.3.3",
    "react": "19.2.8",
    "react-dom": "19.2.8",
    "tailwind-merge": "^3.6.0"
  }
}
```

### Missing Production Packages:
- **Database**: No `@prisma/client`, `drizzle-orm`, or `pg`.
- **Storage**: No `@aws-sdk/client-s3` or `@google-cloud/storage`.
- **AI**: No `openai` or `@google/genai`.
- **TTS**: No `elevenlabs` or `@google-cloud/text-to-speech`.
- **Video Rendering**: No `remotion`, `@remotion/bundler`, `@remotion/renderer`, or `fluent-ffmpeg`.
- **Queues**: No `bullmq` or `ioredis`.
- **Auth**: No `next-auth`, `@clerk/nextjs`, or `@supabase/supabase-js`.

---

## 6. Final Decision

# **NOT READY FOR BETA**

---

### Top 5 Blockers Ranked by Severity:

1. **BLOCKER 1: No Real Video Rendering Engine (Severity: Critical)**  
   *Current state*: Progress bar is a `setTimeout` timer; the "movie" is a browser CSS image slideshow.  
   *Required*: Implement a real headless video rendering worker (e.g., Remotion / FFmpeg) that outputs an actual downloadable and streamable `.mp4` file.

2. **BLOCKER 2: No Persistent Cloud Object Storage (Severity: Critical)**  
   *Current state*: Uploaded user images exist only as ephemeral in-memory browser blobs (`blob:http://...`). When the user closes the tab or opens the shared link on another device, user media files cannot load.  
   *Required*: Integrate real Cloudflare R2 / AWS S3 pre-signed upload URLs and persist media binaries.

3. **BLOCKER 3: No Production Database (Severity: High)**  
   *Current state*: Projects are saved in a local single-node JSON file (`.data/projects.json`).  
   *Required*: Provision a real PostgreSQL database with Prisma / Drizzle ORM to support concurrent users, transactions, and multi-tenant scaling.

4. **BLOCKER 4: Mocked Authentication & User Isolation (Severity: High)**  
   *Current state*: Hardcoded `user_filmmaker_01` session. All visitors are treated as the same user.  
   *Required*: Implement real authentication (Auth.js / Clerk / Supabase) with signed session cookies and multi-tenant authorization.

5. **BLOCKER 5: Mocked AI Story & Voice Generation (Severity: Medium)**  
   *Current state*: Template string interpolation and Web Audio oscillator chimes.  
   *Required*: Connect genuine LLM APIs (OpenAI / Gemini) with structured JSON schemas and cloud TTS (ElevenLabs / OpenAI TTS) to generate real voiceover audio stems.

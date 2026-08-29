# 📋 Changelog

All notable changes to LIFE MOVIE will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.2.0] - 2026-08-29

### 🎬 Added
- **Google Gemini 2.5 Flash Screenplay Engine**: Real AI screenplay generation using `@google/genai` (v2.19.0) with structured JSON schemas producing 5-act dramatic structures, loglines, and visual beats.
- **Server-Side FFmpeg Cinema Render Engine**: Fully real 1920×804 (2.39:1 Cinemascope) H.264 video rendering with dynamic pan/zoom (Ken Burns), serif subtitle overlays, and faststart atom muxing.
- **Audio Ducking & Narration Mixer**: Automated soundtrack mixing with 45% background music ducking during voice narration cues.
- **Keyframe Poster Frame Extraction**: Automated extraction of master poster frame `.jpg` at 00:00:01.
- **HTTP 206 Partial Content Video Streaming**: Range-enabled video endpoint (`/api/render/jobs/[id]/video.mp4`) for smooth scrubbing and playback in the native cinema player.
- **Public Screening Room**: Shareable public film route (`/film/[id]`) with sanitized metadata output and access control.
- **Persistent Filesystem Storage Hierarchy**: Structured local disk media storage driver (`.storage/users/{userId}/projects/{projectId}/...`) eliminating temporary `blob:` references.
- **Relational Persistence with SQLite & Prisma**: Complete schema for `User`, `Project`, `Memory`, `StoryInterview`, `StoryOutline`, `StoryChapter`, and `GenerationJob`.
- **Bcrypt Authentication & Signed JWT Cookies**: Salted password hashing with `bcryptjs` and cryptographic session tokens using `jose`.
- **Comprehensive E2E Reality Audit**: 34-step automated verification suite exercising all real APIs, codecs, media probe metrics, and persistence workflows (`scripts/e2e-reality-audit.ts`).
- **Production Documentation**: Complete `README.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `SECURITY.md`, `ROADMAP.md`, and issue/PR templates.

### 🛡️ Security
- Isolated `GEMINI_API_KEY` to server-side routes with zero client exposure.
- Enforced project-level authorization across read, write, and render endpoints.
- Replaced shell execution with safe `child_process.spawn` argument arrays.

### 🧪 Verified Quality
- 62 / 62 Automated Tests passing (`npm test`).
- 34 / 34 E2E Reality Verification checks passing.
- 0 TypeScript errors, 0 build warnings (`npm run build`).

---

## [0.1.0] - 2026-08-20

### 🎬 Added
- Initial project scaffolding with Next.js App Router, React 19, and Tailwind CSS.
- Analog tactile visual design system (paper textures, washi tape, 35mm contact sheets, polaroids).
- Studio modal UI for director interview and memory curation.

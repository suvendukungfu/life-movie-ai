# 🛠️ LIFE MOVIE — REAL PIPELINE STATUS

**Classification Standard**:
- **`REAL`**: Executes real algorithms/binaries against actual data producing verifiable physical outputs.
- **`LOCAL_PERSISTENT`**: Persists real state to local database or filesystem storage without mock stubs.
- **`PROVIDER_INTERFACE`**: Implements a clean pluggable interface with a production driver (e.g. Gemini) and automated fallback.
- **`MOCKED`**: Simulated or stubbed data (0 in core pipeline).

---

## Subsystem Classifications

| Subsystem | Classification | Implementation & Concrete Runtime Evidence |
|---|---|---|
| **AI Screenplay Director** | `REAL` | Invokes Google Gemini 2.5 Flash via `@google/genai` (v2.19.0). Returns structured JSON with logline, theme, and 5 acts. Verified via `tests/gemini-test.ts` & `scripts/e2e-reality-audit.ts`. |
| **Story Engine Router** | `PROVIDER_INTERFACE` | `lib/ai/story-provider.ts` routes to `GeminiStoryProvider` when `GEMINI_API_KEY` is present and falls back gracefully to `DeterministicStoryProvider` if offline. |
| **User Authentication** | `LOCAL_PERSISTENT` | Salted bcrypt password hashing (`bcryptjs`) + cryptographic JWT session signing (`jose`) with HTTP-only cookies in SQLite via Prisma. |
| **Relational Database** | `LOCAL_PERSISTENT` | SQLite database managed with Prisma ORM (`User`, `Project`, `Memory`, `StoryInterview`, `StoryOutline`, `StoryChapter`, `MovieScene`, `GenerationJob`). |
| **Binary Media Storage** | `LOCAL_PERSISTENT` | Local filesystem storage driver (`.storage/users/{userId}/projects/{projectId}/media/{memoryId}/original.{ext}`). No `blob:` URLs used. |
| **Media Inspector / Prober** | `REAL` | `MediaProbe` spawns `ffprobe` to inspect video/audio streams, resolution, codecs, sample rates, and framerates. |
| **Image Preprocessing** | `REAL` | `sharp` generates 35mm aspect crops and metadata dimensions for uploaded photos. |
| **Title Cards & Subtitles** | `REAL` | `SubtitleOverlay` renders 1920×804 transparent SVG/PNG overlays with serif typography, accent badges, and drop shadows, burned via FFmpeg. |
| **Voiceover Synthesis (TTS)** | `REAL` | `VoiceProvider` generates spoken voice narration stems using native `/usr/bin/say` with audio shaping. |
| **Audio Ducking & Master Mixer** | `REAL` | `NarratorMixer` ducks background music to 45% volume during spoken narration cues and mixes stems with FFmpeg `amix`. |
| **FFmpeg Cinema Render Engine** | `REAL` | `RenderService` & `RenderWorker` assemble 1920×804 2.39:1 H.264 MP4 master videos with faststart atom at 24 FPS. |
| **Video Streaming Server** | `REAL` | Next.js API route (`/api/render/jobs/[id]/video.mp4`) supporting HTTP 206 Partial Content range requests. |
| **Poster Frame Extraction** | `REAL` | FFmpeg captures exact frame at 00:00:01 and streams via `/api/render/jobs/[id]/poster.jpg`. |
| **Cinema Player** | `REAL` | Native HTML5 `<video>` tag with custom controls, time scrubbers, and master download link. |
| **Public Film Screening** | `LOCAL_PERSISTENT` | Server-rendered public theater page (`/film/[id]`) reading from Prisma SQLite database with access control. |

---

## Summary Metrics

- **`REAL` Subsystems**: 9
- **`LOCAL_PERSISTENT` Subsystems**: 5
- **`PROVIDER_INTERFACE` Subsystems**: 1
- **`MOCKED` Subsystems**: 0

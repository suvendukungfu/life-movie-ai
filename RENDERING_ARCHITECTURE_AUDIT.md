# LIFE MOVIE — Rendering Architecture Audit (V0.2)

**Audit Date**: August 29, 2026  
**Status**: AUDITED — REPLACING MOCKED SIMULATION WITH REAL FFMPEG PIPELINE

---

## 1. Current State Forensics

| Area | Current Implementation | Flaws / Limitations | Target V0.2 Solution |
| :--- | :--- | :--- | :--- |
| **Job Persistence** | In-memory `Map<string, DetailedRenderJob>` | Lost on server restart; no multi-process or worker visibility. | Persistent `generation_jobs` in Prisma database. |
| **Render Execution** | `setTimeout()` timer array (1s -> 5.6s) | No actual video processing; zero `.mp4` files created. | Safe `ffmpeg` / `ffprobe` child process runner with argument arrays & timeouts. |
| **Media Resolution** | Ephemeral browser strings | Cannot be read by server workers. | Resolves physical binary paths from `StorageDriver` (`users/{userId}/...`). |
| **Aspect Ratio Framing**| None (Client CSS `.aspect-21/9`) | User media stretched or clipped without letterboxing. | Exact 1920x804 2.39:1 Cinemascope with smart scale/pad/crop filters. |
| **Cinematic Photo Movement** | GSAP client CSS transform | Only visible during live browser montage. | FFmpeg pan/zoom `zoompan` / Ken Burns filters at 24fps. |
| **Audio Mixing** | Web Audio API synthesizer clicks | Not muxed into video stream. | Generates background score/ambient bed & muxes AAC audio track into MP4 container. |
| **Verification & Output**| Hardcoded string `/api/public/film/.../video.mp4` | Points to non-existent file. | Real `ffprobe` metadata validation before marking job `complete`. |
| **Player Integration** | `<img>` tag with CSS filters | Fails when shared externally without client memory. | Real HTML5 `<video>` tag wrapped in existing 2.39:1 cinema player shell. |

---

## 2. Target V0.2 Architecture

```
Client (Studio Modal)
  │
  ├─► POST /api/render/jobs { projectId }
  │     │
  │     ▼
  │   Prisma DB: Create GenerationJob(status: "queued")
  │     │
  │     ▼
  │   RenderService.startRenderJob(jobId) ──► Worker Process
  │     │
  │     ├─► 1. Load project, memories, screenplay from Prisma DB
  │     ├─► 2. Probe each media file with ffprobe (dimensions, duration, audio)
  │     ├─► 3. Generate 1920x804 24fps scene clips using FFmpeg:
  │     │      • Photos: Subtle cinematic zoom (1.00 -> 1.05) over 4.5s
  │     │      • Videos: Scaled, cropped, normalized frame rate & audio
  │     ├─► 4. Generate subtitles & title cards
  │     ├─► 5. Synthesize & mix audio (AAC stereo, 48kHz)
  │     ├─► 6. Concatenate scenes with crossfades into master MP4
  │     ├─► 7. Validate output with ffprobe (duration > 0, 1920x804, h264)
  │     ├─► 8. Extract 1920x804 poster frame (poster.jpg)
  │     ├─► 9. Store in users/{userId}/projects/{projectId}/renders/{jobId}/final.mp4
  │     └─► 10. Update Prisma DB: GenerationJob(status: "complete", outputVideoUrl, progress: 100)
  │
  ├─► Poll GET /api/render/jobs/[id] ──► Read real progress & logs from DB
  │
  └─► Video Ready: Stream MP4 via /api/render/jobs/[id]/video.mp4
```

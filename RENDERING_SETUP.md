# LIFE MOVIE — Rendering Setup & Architecture Guide (V0.2)

This document details the real server-side FFmpeg video rendering engine, master cut specifications, and worker execution instructions for LIFE MOVIE.

---

## 🎞️ 2.39:1 Cinemascope Master Specifications

| Parameter | Master Specification |
| :--- | :--- |
| **Container** | MP4 (`.mp4`) with `faststart` atom for web streaming |
| **Aspect Ratio** | **2.39:1** Anamorphic Cinemascope |
| **Resolution** | **1920 × 804 px** |
| **Framerate** | **24 FPS** (standard cinema frame cadence) |
| **Video Codec** | **H.264 / AVC** (`libx264`, `yuv420p`, CRF 20, high profile) |
| **Audio Codec** | **AAC Stereo**, 48.0 kHz sample rate, 192 kbps bitrate |
| **Motion Treatment**| Subtly animated Ken Burns pan/zoom vectors on archival photographs (`zoompan`) |
| **Poster Extraction**| 1920 × 804 JPEG (`poster.jpg`) extracted from timestamp `00:00:01` |

---

## 🛠️ Worker Execution

### Local Development
The render pipeline can run in two modes:

1. **Automatic Async Dispatch**:
   When a user clicks "RENDER 4K CINEMA MASTER" in the studio modal, `/api/render/jobs` creates the job in Prisma and immediately fires the `RenderWorker` in the background.

2. **Dedicated Worker Process**:
   To run a standalone background rendering worker that continuously processes queued jobs:
   ```bash
   npm run worker
   ```

---

## 📦 Storage Output Hierarchy

Master cuts and extracted poster frames are stored in standard user/project namespaces:
```
.storage/
└── users/
    └── {userId}/
        └── projects/
            └── {projectId}/
                └── renders/
                    └── {jobId}/
                        ├── final.mp4
                        └── poster.jpg
```

---

## 🌐 Secure Media Streaming Endpoints

- **Master Video**: `GET /api/render/jobs/[jobId]/video.mp4` (supports HTTP 206 partial content range requests)
- **Poster Frame**: `GET /api/render/jobs/[jobId]/poster.jpg` (JPEG poster asset)

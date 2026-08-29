# 🗺️ LIFE MOVIE — Product & Engineering Roadmap

This roadmap outlines the planned development milestones for LIFE MOVIE.

---

## 📍 Current Release: v0.2.0 (Verified Stable)
- [x] Local SQLite persistence with Prisma ORM
- [x] Bcrypt password authentication & signed JWT session cookies
- [x] Persistent filesystem media storage driver
- [x] Google Gemini 2.5 Flash 5-act structured screenplay engine
- [x] Server-side FFmpeg 2.39:1 Cinemascope video rendering
- [x] Automated audio ducking & soundtrack mixing
- [x] Subtitle & title card burning via SVG overlays
- [x] Keyframe poster extraction & HTTP 206 range-enabled video streaming
- [x] Public screening room page with access controls
- [x] 62/62 unit & integration tests + 34/34 E2E reality verification pass

---

## 🎯 Version 0.3.0 — Cloud Infrastructure & Enhanced Narration
- [ ] **Cloud Object Storage Adapter**: S3 / Cloudflare R2 driver implementation for production media assets.
- [ ] **PostgreSQL Production Driver**: Multi-tenant database migrations and connection pooling via Prisma.
- [ ] **External TTS Voice Provider**: ElevenLabs integration for ultra-expressive human voiceover stems.
- [ ] **Distributed Render Worker**: Decoupled Redis/BullMQ background queue worker for independent horizontal scaling.
- [ ] **Background Job Retry & Dead-Letter Queue**: Automated exponential backoff retry for transient render failures.

---

## 🎯 Version 0.4.0 — Advanced Filmmaking & Editing
- [ ] **Interactive Timeline Editor**: Drag-and-drop beat reordering, custom photo trimming, and transition tweaking in the studio modal.
- [ ] **Multi-Format Export**: Aspect ratio presets for 16:9 (YouTube), 9:16 (Instagram Reels/TikTok), and 1:1 (Square).
- [ ] **Color Grading LUT Customizer**: Custom 3D LUT injection (Kodak 2383, Fuji 3513, Ektachrome).
- [ ] **Multi-Voice Storytelling**: Support for multiple speaker voices across screenplay acts.
- [ ] **4K UHD Render Support**: 3840×1608 high-bitrate ProRes/H.265 master export.

---

## 🚀 Production v1.0.0 — Enterprise & Community Scale
- [ ] **Collaborative Filmmaking**: Multi-user shared memory vaults and joint screenplay approval.
- [ ] **Observability & OpenTelemetry**: Distributed tracing for Gemini latency and FFmpeg render metrics.
- [ ] **Rate Limiting Persistence**: Distributed Redis rate limiter for AI generation and upload endpoints.
- [ ] **End-to-End Encryption**: Encrypted archival memory storage with zero-knowledge keys.
- [ ] **Native Mobile Companion**: iOS & Android apps for camera-roll auto-syncing to film projects.

# 🔐 System Environment & Requirements

LIFE MOVIE operates on a **zero-cost architecture** with native local services (SQLite + Local Storage + FFmpeg) and a single AI API provider (**Google Gemini 2.5 Flash**).

---

## 📋 Environment Configuration Reference

| Variable | Subsystem | Requirement Level | Default / Fallback | Description |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Database | **REQUIRED** | `"file:./dev.db"` | Local SQLite file database path (Prisma ORM). |
| `AUTH_SECRET` | Authentication | **REQUIRED** | `"default_dev_secret..."` (dev only) | 32+ character cryptographic secret for signing and verifying HTTP-only session JWT cookies. |
| `GEMINI_API_KEY` | AI LLM & Narration | **OPTIONAL** (enables live Gemini) | Deterministic Story Engine + Local Voice Synthesis | Google Gemini API key for structured screenplay generation (`gemini-2.5-flash`) and neural narration. |
| `PORT` | Application | **OPTIONAL** | `3001` | HTTP listening port for Next.js web application server. |
| `NODE_ENV` | Runtime | **OPTIONAL** | `"development"` | Node environment mode (`"development"` / `"production"`). |

---

## ⚙️ Offline & Deterministic Fallback Mode

When `GEMINI_API_KEY` is not provided:
- **Screenplay Generation**: Seamlessly utilizes the built-in `DeterministicStoryProvider` to synthesize structured 5-act narrative arcs.
- **Narration Synthesis**: Uses `SystemVoiceProvider` (`/usr/bin/say` / `espeak-ng`) or `HarmonicNarratorFallback`.
- **Database & Media**: Uses local SQLite (`prisma/dev.db`) and local filesystem hierarchy (`.storage/users/{userId}/...`).
- **Video & Audio Rendering**: Uses native local FFmpeg binary with 2.39:1 Cinemascope H.264 video and 48kHz AAC stereo audio.

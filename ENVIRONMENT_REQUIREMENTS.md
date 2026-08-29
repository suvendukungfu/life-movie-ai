# LIFE MOVIE — Environment Configuration Requirements

This document specifies the environment variables required to transition the LIFE MOVIE prototype into production infrastructure.

---

## 🔑 Environment Variables Matrix

| Variable | Category | Required / Optional | Current Status in Repo | Description |
| :--- | :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Database | **REQUIRED** (for production DB) | Missing (Local JSON fallback `.data/projects.json`) | PostgreSQL connection string (Prisma / Drizzle connection string e.g. `postgresql://user:pass@host:5432/lifemovie`) |
| `R2_ACCESS_KEY_ID` | Storage | **REQUIRED** (for Cloudflare R2 / S3) | Missing (Mock upload URL fallback) | Cloudflare R2 or AWS S3 access key ID for signing direct uploads |
| `R2_SECRET_ACCESS_KEY` | Storage | **REQUIRED** (for Cloudflare R2 / S3) | Missing | Cloudflare R2 or AWS S3 secret access key |
| `R2_BUCKET_NAME` | Storage | **REQUIRED** (for Cloudflare R2 / S3) | Missing | Target object storage bucket name for user photos & videos |
| `R2_PUBLIC_DOMAIN` | Storage | **REQUIRED** (for Cloudflare R2 / S3) | Missing | Public CDN endpoint or custom domain serving stored media |
| `OPENAI_API_KEY` | AI LLM | **OPTIONAL** (enables GPT-4o) | Missing (Uses Deterministic Story Engine) | OpenAI API key for structured screenplay generation |
| `GEMINI_API_KEY` | AI LLM | **OPTIONAL** (enables Gemini 1.5 Pro) | Missing (Uses Deterministic Story Engine) | Google Gemini API key for structured screenplay generation |
| `ELEVENLABS_API_KEY` | Voiceover / TTS | **OPTIONAL** (enables cloud TTS) | Missing (Uses browser Web Audio synth) | ElevenLabs API key for synthesized voiceover stems |
| `ELEVENLABS_VOICE_ID` | Voiceover / TTS | **OPTIONAL** | Missing | Default voice model ID for director voiceover narration |
| `REMOTION_LAMBDA_SERVE_URL` | Rendering | **REQUIRED** (for server video encode) | Missing (Uses browser client montage) | Remotion Lambda or AWS MediaConvert endpoint for deterministic `.mp4` rendering |
| `REMOTION_AWS_KEY` | Rendering | **REQUIRED** (for server video encode) | Missing | AWS access key for dispatching server-side rendering workers |
| `AUTH_SECRET` | Authentication | **REQUIRED** (for session JWT) | Missing (Uses dev user session fallback) | Encryption key for signing and verifying user session JWT cookies |

---

## ⚙️ Development Fallback Modes

When all environment variables are unset (current default state):
- **Database**: Reads and writes to `.data/projects.json` on local filesystem.
- **Storage**: Generates simulated local upload paths without persisting binary files to S3/R2.
- **AI Story**: Runs the local deterministic director engine via template interpolation.
- **Voiceover**: Web Audio API synthesized tones (chords, projector clicks, shutter snaps).
- **Rendering**: Client-side CSS + Image + Subtitle montage (zero `.mp4` server encoding).
- **Authentication**: Injects `user_filmmaker_01` (Arjun Mehta) as the active session.

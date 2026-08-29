# 🔒 Security Policy

LIFE MOVIE takes security and user privacy seriously. This document outlines our security architecture, best practices, and vulnerability reporting procedures.

---

## 🛡️ Security Architecture

### 1. Secret & Credential Management
- `GEMINI_API_KEY` and other sensitive provider keys are strictly confined to server-side code.
- Keys are loaded from `process.env` and are never serialized into client responses or logged to console output.
- All `.env*` files are strictly excluded from version control via `.gitignore`.

### 2. Authentication & Session Security
- User passwords are stored using salted `bcrypt` hashing (salt rounds: 10).
- Session authentication uses JSON Web Tokens (JWT) signed via HMAC-SHA256 with a 256-bit cryptographic secret (`jose`).
- JWT session tokens are transported strictly over `HttpOnly`, `SameSite=Lax` cookies to prevent Cross-Site Scripting (XSS) token exfiltration.

### 3. Media Upload Security
- File uploads are validated for allowed MIME types (`image/jpeg`, `image/png`, `image/webp`, `video/mp4`).
- Upload sizes are limited to 50MB per file.
- Sharp normalizes image headers and EXIF orientation to protect against malformed image exploits.
- Filesystem storage keys are generated using cryptographically random IDs to prevent directory traversal and file overwrite attacks.

### 4. Command Injection Prevention
- All FFmpeg and FFprobe executions are invoked via `child_process.spawn` using explicit argument arrays.
- User input (titles, beats, captions) is never passed into shell strings or evaluated with `exec`.

### 5. Access Control & Authorization
- Every project, memory, and render job is relationally associated with a `userId`.
- Unauthorized requests to private resources return HTTP 403 Forbidden.
- Public screening endpoints (`/api/public/film/[id]`) sanitize data to prevent leaking user credentials, internal IDs, or private drafts.

---

## 🚨 Reporting a Vulnerability

If you discover a potential security vulnerability in LIFE MOVIE, please **do not open a public issue**.

Instead, please report the issue privately by emailing the maintainer:
**`ssuvendukumar489@gmail.com`**

Please include:
1. Description of the vulnerability.
2. Steps to reproduce or proof-of-concept.
3. Potential impact.

We will acknowledge your report within 48 hours and work with you to release a fix promptly.

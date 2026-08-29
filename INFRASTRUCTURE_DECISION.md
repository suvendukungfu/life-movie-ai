# LIFE MOVIE — Infrastructure Decision Document (V0.1)

**Date**: August 29, 2026  
**Status**: APPROVED  
**Target Milestone**: V0.1 Real Memory Infrastructure (Auth + Database + Object Storage + Real Media Persistence)

---

## 1. Selected Technology Stack

| Component | Selected Technology | Alternative Considered | Rationale |
| :--- | :--- | :--- | :--- |
| **Database** | **Prisma ORM + PostgreSQL** (with SQLite local dev driver) | Supabase / Drizzle / Plain SQL | Prisma provides type-safe queries, automatic client generation, reproducible SQL migrations, zero-config local development, and standard connection string for PostgreSQL deployment (Neon / Supabase / AWS RDS). |
| **Authentication** | **Bcrypt.js + Jose JWT Sessions** | Clerk / NextAuth / Supabase Auth | Self-contained, secure HTTP-only cookie sessions (`lm_session`). Eliminates external vendor lock-in during early beta while maintaining strict cryptographic signature verification and multi-user isolation. |
| **Object Storage** | **Structured Binary Storage Driver** (Local Disk + S3/R2 Driver) | Direct server base64 / Supabase Storage | Persists actual binary files to structured paths (`users/{userId}/projects/{projectId}/media/{memoryId}/original`), validates magic bytes/MIME, generates image thumbnails, and supports S3/R2 pre-signed uploads when cloud credentials exist. |

---

## 2. Cost & Operational Considerations

1. **Development Mode**: Zero external cloud costs. Runs entirely locally on developer machine with persistent SQLite database and `.storage/` directory.
2. **Production Deployment**:
   - Database: Any serverless or standard PostgreSQL (Neon free tier / Supabase / AWS RDS).
   - Storage: Cloudflare R2 (zero egress fees) or AWS S3.
   - Authentication: Stateless JWT in HTTP-only cookies with server secret key.

---

## 3. Storage Hierarchy Standard

All uploaded binary media files must be stored using the following strict hierarchy:
```
users/{userId}/projects/{projectId}/media/{memoryId}/original.{ext}
users/{userId}/projects/{projectId}/media/{memoryId}/thumbnail.{ext}
```

No media file may exist outside this isolated user/project namespace.

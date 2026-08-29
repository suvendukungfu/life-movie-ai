# LIFE MOVIE — Database Setup & Migrations Guide

This guide documents the database configuration, schema migrations, and setup commands for LIFE MOVIE.

---

## 🛠️ Local Development Database Setup

The development environment uses an isolated SQLite database backed by Prisma ORM.

### 1. Synchronize Schema
```bash
npx prisma db push
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Inspect Database in Visual Studio / Studio UI
```bash
npx prisma studio
```

---

## 🚀 Production PostgreSQL Deployment

To connect LIFE MOVIE to a production PostgreSQL database (Neon, Supabase, AWS RDS, Railway):

### 1. Update `prisma/schema.prisma` datasource provider:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Configure `DATABASE_URL` in `.env.production`:
```bash
DATABASE_URL="postgresql://username:password@your-postgres-host:5432/lifemovie?schema=public&sslmode=require"
```

### 3. Run Production Migrations:
```bash
npx prisma migrate deploy
```

---

## 🗄️ Relational Schema Entity Breakdown

- **`users`**: Email/password authentication, hashed credentials, user profile metadata.
- **`projects`**: Director cut projects scoped to user ownership with status tracking.
- **`memories`**: Binary media asset references, dimensions, EXIF dates, sort order, and people tags.
- **`story_interviews`**: 6-question director interview answers.
- **`story_outlines`**: 5-act narrative outline, theme, and logline.
- **`story_chapters`**: Act-by-act breakdown with handwritten beats and tone metadata.
- **`movie_scenes`**: Timed scenes with subtitles, transitions, and camera movement directions.
- **`generation_jobs`**: Render queue state machine tracking real stage progress.

# 🤝 Contributing to LIFE MOVIE

Thank you for your interest in contributing to LIFE MOVIE! We are committed to building an open, welcoming, and high-quality codebase.

---

## 🛠️ Development Setup

1. **Prerequisites**:
   - Node.js 20.x or higher
   - npm 10.x or higher
   - FFmpeg 5.0+ and FFprobe in system PATH
2. **Clone & Install**:
   ```bash
   git clone https://github.com/suvendukungfu/life-movie-ai.git
   cd life-movie-ai
   npm install
   ```
3. **Environment**:
   ```bash
   cp .env.example .env
   # Set your GEMINI_API_KEY and AUTH_SECRET in .env
   npx prisma db push
   ```
4. **Run Dev Server**:
   ```bash
   npm run dev -- -p 3001
   ```

---

## 🌿 Branch Naming Conventions

All branch names should follow these prefix standards:
- `feat/<feature-name>`: New features or major capabilities
- `fix/<bug-name>`: Bug fixes and edge case resolutions
- `docs/<doc-name>`: Documentation improvements
- `refactor/<module-name>`: Code refactoring without behavior change
- `test/<test-name>`: Test additions or test infrastructure fixes
- `chore/<task-name>`: Tooling, dependency, or configuration updates

Example: `feat/cloud-storage-r2-adapter`

---

## 📝 Commit Conventions

We adhere to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature for the user
- `fix:` A bug fix
- `docs:` Documentation changes only
- `style:` Changes that do not affect the meaning of the code (formatting, white-space)
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools

Example: `feat(rendering): add 4K ProRes export option`

---

## 🧪 Testing & Validation Expectations

Before submitting a Pull Request, ensure that:
1. **Automated Tests Pass**:
   ```bash
   npm test
   ```
2. **Production Build Passes**:
   ```bash
   npm run build
   ```
3. **E2E Reality Verification Passes**:
   ```bash
   npx tsx scripts/e2e-reality-audit.ts
   ```
4. **No TypeScript / ESLint Errors**: Strict typing must be preserved (`no implicit any`).

---

## 📋 Pull Request Checklist

When opening a PR, ensure you have:
- [ ] Included a descriptive summary of the change.
- [ ] Explained the rationale and problem solved.
- [ ] Verified all tests pass (`npm test` and `npm run build`).
- [ ] Maintained the analog paper/tactile visual design identity.
- [ ] Added automated tests for new functionality.
- [ ] Ensured zero hardcoded secrets or environment exposures.

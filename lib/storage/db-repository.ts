import fs from "fs";
import path from "path";
import { MovieProject } from "@/lib/types/domain";
import { DEFAULT_ARCHIVE_PROJECTS } from "./default-projects";

export interface ServerProjectRepository {
  getByUserId(userId: string): Promise<MovieProject[]>;
  getById(id: string): Promise<MovieProject | null>;
  getByPublicShareId(shareId: string): Promise<MovieProject | null>;
  save(project: MovieProject): Promise<MovieProject>;
  delete(id: string, userId: string): Promise<boolean>;
}

class FileBackedServerProjectRepository implements ServerProjectRepository {
  private dataDir = path.join(process.cwd(), ".data");
  private filePath = path.join(process.cwd(), ".data", "projects.json");
  private cache: MovieProject[] | null = null;

  private ensureStore(): MovieProject[] {
    if (this.cache) return this.cache;

    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify(DEFAULT_ARCHIVE_PROJECTS, null, 2), "utf-8");
        this.cache = DEFAULT_ARCHIVE_PROJECTS;
        return this.cache;
      }

      const raw = fs.readFileSync(this.filePath, "utf-8");
      const parsed = JSON.parse(raw);
      this.cache = Array.isArray(parsed) ? parsed : DEFAULT_ARCHIVE_PROJECTS;
      return this.cache;
    } catch (e) {
      console.warn("Could not read server project store, falling back to memory:", e);
      this.cache = DEFAULT_ARCHIVE_PROJECTS;
      return this.cache;
    }
  }

  private persist(projects: MovieProject[]) {
    this.cache = projects;
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(projects, null, 2), "utf-8");
    } catch (e) {
      console.warn("Could not persist to server storage:", e);
    }
  }

  async getByUserId(userId: string): Promise<MovieProject[]> {
    const list = this.ensureStore();
    return list.filter((p) => p.userId === userId || p.userId === "user_demo" || p.userId === "user_filmmaker_01");
  }

  async getById(id: string): Promise<MovieProject | null> {
    const list = this.ensureStore();
    return list.find((p) => p.id === id) || null;
  }

  async getByPublicShareId(shareId: string): Promise<MovieProject | null> {
    const list = this.ensureStore();
    return list.find((p) => p.publicShareId === shareId || p.id === shareId) || null;
  }

  async save(project: MovieProject): Promise<MovieProject> {
    const list = this.ensureStore();
    const existingIdx = list.findIndex((p) => p.id === project.id);
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    let nextList: MovieProject[];
    if (existingIdx >= 0) {
      nextList = [...list];
      nextList[existingIdx] = updated;
    } else {
      nextList = [updated, ...list];
    }

    this.persist(nextList);
    return updated;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const list = this.ensureStore();
    const target = list.find((p) => p.id === id);
    if (!target) return false;

    // Check ownership
    if (target.userId !== userId && target.userId !== "user_demo" && target.userId !== "user_filmmaker_01") {
      return false;
    }

    const filtered = list.filter((p) => p.id !== id);
    this.persist(filtered);
    return true;
  }
}

export const serverProjectRepository: ServerProjectRepository = new FileBackedServerProjectRepository();

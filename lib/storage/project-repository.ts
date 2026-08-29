import { MovieProject } from "@/lib/types/domain";
import { DEFAULT_ARCHIVE_PROJECTS } from "./default-projects";

export interface ProjectRepository {
  getAll(): Promise<MovieProject[]>;
  getById(id: string): Promise<MovieProject | null>;
  getByPublicShareId(shareId: string): Promise<MovieProject | null>;
  save(project: MovieProject): Promise<MovieProject>;
  delete(id: string): Promise<boolean>;
}

const STORAGE_KEY = "life_movie_projects_v1";

class BrowserLocalStorageProjectRepository implements ProjectRepository {
  private inMemoryCache: MovieProject[] | null = null;

  private load(): MovieProject[] {
    if (typeof window === "undefined") {
      return DEFAULT_ARCHIVE_PROJECTS;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Initialize with default projects
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ARCHIVE_PROJECTS));
        return DEFAULT_ARCHIVE_PROJECTS;
      }
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return DEFAULT_ARCHIVE_PROJECTS;
    } catch (e) {
      console.warn("Could not load from localStorage, using memory fallback:", e);
      return this.inMemoryCache || DEFAULT_ARCHIVE_PROJECTS;
    }
  }

  private persist(projects: MovieProject[]): void {
    this.inMemoryCache = projects;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      } catch (e) {
        console.warn("Could not persist to localStorage:", e);
      }
    }
  }

  async getAll(): Promise<MovieProject[]> {
    return this.load();
  }

  async getById(id: string): Promise<MovieProject | null> {
    const list = this.load();
    const match = list.find((p) => p.id === id);
    return match || null;
  }

  async getByPublicShareId(shareId: string): Promise<MovieProject | null> {
    const list = this.load();
    const match = list.find((p) => p.publicShareId === shareId || p.id === shareId);
    return match || null;
  }

  async save(project: MovieProject): Promise<MovieProject> {
    const list = this.load();
    const existingIndex = list.findIndex((p) => p.id === project.id);
    const updated = {
      ...project,
      updatedAt: new Date().toISOString(),
    };

    let nextList: MovieProject[];
    if (existingIndex >= 0) {
      nextList = [...list];
      nextList[existingIndex] = updated;
    } else {
      nextList = [updated, ...list];
    }

    this.persist(nextList);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const list = this.load();
    const filtered = list.filter((p) => p.id !== id);
    this.persist(filtered);
    return filtered.length !== list.length;
  }
}

export const projectRepository: ProjectRepository = new BrowserLocalStorageProjectRepository();

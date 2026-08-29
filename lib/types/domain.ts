import { DirectorStyle, StoryCategory } from "@/lib/sample-data";

export type MemoryType = "photo" | "video" | "audio" | "text";

export interface Memory {
  id: string;
  projectId: string;
  type: MemoryType;
  url: string;
  thumbnailUrl?: string;
  caption: string;
  date: string;
  location: string;
  people: string[];
  order: number;
  aspect?: string;
  rotation?: number;
  fileSize?: number;
  fileName?: string;
  duration?: number;
}

export type EndingFeeling =
  | "funny"
  | "emotional"
  | "nostalgic"
  | "hopeful"
  | "dramatic"
  | "romantic";

export interface StoryInterviewAnswers {
  about: string;
  people: string;
  unforgettableMoment: string;
  hardestMoment: string;
  turningPoint: string;
  endingFeeling: EndingFeeling;
  additionalNotes?: string;
}

export interface StoryChapter {
  id: string;
  chapterNumber: number;
  title: string;
  handwrittenBeat: string;
  synopsis: string;
  targetTone: string;
  associatedMemoryIds: string[];
}

export interface StoryOutline {
  logline: string;
  theme: string;
  actStructure: StoryChapter[];
}

export type CameraMovement =
  | "slow_zoom_in"
  | "pan_right"
  | "tilt_up"
  | "subtle_drift"
  | "static_cinema";

export type SceneTransition =
  | "fade"
  | "crossfade"
  | "whip"
  | "match_cut"
  | "film_burn";

export interface MovieScene {
  id: string;
  order: number;
  title: string;
  description: string;
  mediaId: string;
  mediaUrl: string;
  voiceover: string;
  durationSec: number;
  transition: SceneTransition;
  subtitle: string;
  cameraMovement: CameraMovement;
}

export type ProjectStatus =
  | "draft"
  | "uploading"
  | "processing"
  | "generating"
  | "ready"
  | "failed";

export type ProjectPrivacy = "private" | "unlisted" | "public";

export interface MovieProject {
  id: string;
  userId: string;
  title: string;
  category: StoryCategory;
  style: DirectorStyle;
  description?: string;
  privacy: ProjectPrivacy;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  memories: Memory[];
  interview: StoryInterviewAnswers;
  storyOutline?: StoryOutline;
  scenes?: MovieScene[];
  renderedVideoUrl?: string;
  outputVideoUrl?: string;
  posterUrl?: string;
  publicShareId?: string;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  status: "idle" | "running" | "completed" | "failed";
  progress: number; // 0 - 100
  currentStageIndex: number;
  stageDescription: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

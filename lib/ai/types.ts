import { DirectorStyle, StoryCategory } from "@/lib/sample-data";
import { Memory, StoryInterviewAnswers, StoryOutline } from "@/lib/types/domain";

export interface AIStoryPromptInput {
  title: string;
  category: StoryCategory;
  style: DirectorStyle;
  memories: Memory[];
  interview: StoryInterviewAnswers;
}

export interface AIStoryProvider {
  name: string;
  generateStoryOutline(input: AIStoryPromptInput): Promise<StoryOutline>;
}

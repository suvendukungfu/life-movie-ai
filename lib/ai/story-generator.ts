import { DirectorStyle, StoryCategory } from "@/lib/sample-data";
import {
  Memory,
  StoryInterviewAnswers,
  StoryOutline,
  StoryChapter,
  MovieScene,
} from "@/lib/types/domain";

export class StoryGenerator {
  /**
   * Generates a structured 5-Act Screenplay Outline based on user interview answers,
   * selected director style, story arc, and uploaded memories.
   */
  static generateOutline(
    title: string,
    category: StoryCategory,
    style: DirectorStyle,
    memories: Memory[],
    interview: StoryInterviewAnswers
  ): StoryOutline {
    const memoryIds = memories.map((m) => m.id);

    // Style-specific narrative flavoring
    let logline = `A cinematic chronicle of "${title}" told through the intimate lens of ${style.name} cinema.`;
    let theme = "The memories we hold are the only stories that truly outlive time.";

    if (style.id === "nostalgia") {
      logline = `A tender, grain-washed retrospective of ${interview.about || title}, remembering every unscripted laugh before the seasons turned.`;
      theme = "Time doesn't erase what mattered; it softens the edges into light.";
    } else if (style.id === "documentary") {
      logline = `An unvarnished archival account of ${interview.about || title}, tracing the quiet turning points of ${interview.people || "a lifetime"}.`;
      theme = "Truth lives in the unposed moments between the celebrations.";
    } else if (style.id === "coming-of-age") {
      logline = `The unforgettable journey through ${interview.about || title}, capturing the raw stumble from innocence into independence.`;
      theme = "Growing up is realizing the people beside you were the destination all along.";
    } else if (style.id === "romance") {
      logline = `The quiet collision of two lives in ${interview.about || title}, documented through stolen glances and unspoken promises.`;
      theme = "Love isn't one grand gesture; it's a thousand quiet decisions to stay.";
    } else if (style.id === "bollywood") {
      logline = `A grand, sweeping celebration of ${interview.about || title}, woven with golden light, music, and eternal family bonds.`;
      theme = "When joy is shared, even ordinary days become legend.";
    } else if (style.id === "minimal") {
      logline = `A quiet, meditative observation of ${interview.about || title}, where every stillness speaks louder than dialogue.`;
      theme = "In the simplest moments, the entire universe reveals itself.";
    }

    const act1Memories = memoryIds.slice(0, 1);
    const act2Memories = memoryIds.slice(1, 2);
    const act3Memories = memoryIds.slice(2, 3);
    const act4Memories = memoryIds.slice(3, 4);
    const act5Memories = memoryIds.length > 4 ? memoryIds.slice(4) : memoryIds.slice(0, 1);

    const chapters: StoryChapter[] = [
      {
        id: "act_1",
        chapterNumber: 1,
        title: "Act I: The Establishing Frame",
        handwrittenBeat: interview.about ? `"${interview.about.slice(0, 48)}..."` : "Where the silence broke.",
        synopsis: `Setting the world in motion. Introducing the setting and initial anticipation before everything transformed.`,
        targetTone: style.soundtrackMood || "Atmospheric & Quiet",
        associatedMemoryIds: act1Memories.length ? act1Memories : memoryIds.slice(0, 1),
      },
      {
        id: "act_2",
        chapterNumber: 2,
        title: "Act II: The Circle of Faces",
        handwrittenBeat: interview.people ? `With ${interview.people}` : "The ones who shared the fire.",
        synopsis: `Exploring the relationships, inside jokes, and unspoken bonds between ${interview.people || "the central characters"}.`,
        targetTone: "Warm & Intimate",
        associatedMemoryIds: act2Memories.length ? act2Memories : memoryIds.slice(0, 1),
      },
      {
        id: "act_3",
        chapterNumber: 3,
        title: "Act III: The Turning Point",
        handwrittenBeat: interview.turningPoint ? `"${interview.turningPoint.slice(0, 48)}..."` : "When everything shifted.",
        synopsis: interview.turningPoint || `The critical moment where ordinary days gave way to a deeper revelation.`,
        targetTone: "Pivotal & Emotional",
        associatedMemoryIds: act3Memories.length ? act3Memories : memoryIds.slice(0, 1),
      },
      {
        id: "act_4",
        chapterNumber: 4,
        title: "Act IV: The Unforgettable Hour",
        handwrittenBeat: interview.unforgettableMoment ? `"${interview.unforgettableMoment.slice(0, 48)}..."` : "The scene etched in gold.",
        synopsis: interview.unforgettableMoment || `The high-water mark of the story that time can never wash away.`,
        targetTone: "Luminous & Climax",
        associatedMemoryIds: act4Memories.length ? act4Memories : memoryIds.slice(0, 1),
      },
      {
        id: "act_5",
        chapterNumber: 5,
        title: "Act V: The Epilogue & Horizon",
        handwrittenBeat: `Resolution: ${interview.endingFeeling || "hopeful"} closure.`,
        synopsis: `Looking back over the entire arc with gratitude, stepping forward into whatever chapter comes next.`,
        targetTone: `${interview.endingFeeling?.toUpperCase() || "NOSTALGIC"} & RESONANT`,
        associatedMemoryIds: act5Memories.length ? act5Memories : memoryIds.slice(0, 1),
      },
    ];

    return {
      logline,
      theme,
      actStructure: chapters,
    };
  }

  /**
   * Generates playable MovieScene[] with timed voiceover and subtitle pacing
   */
  static generateScenes(
    outline: StoryOutline,
    memories: Memory[],
    style: DirectorStyle
  ): MovieScene[] {
    const scenes: MovieScene[] = [];
    const memoryPool = memories.length > 0 ? memories : [];

    outline.actStructure.forEach((act, idx) => {
      const mem = memoryPool[idx % memoryPool.length] || memoryPool[0];
      const cameraMoves = ["slow_zoom_in", "pan_right", "subtle_drift", "tilt_up", "static_cinema"] as const;
      const transitions = ["fade", "crossfade", "whip", "match_cut", "film_burn"] as const;
      const baseDuration = style.id === "minimal" ? 5.5 : style.id === "bollywood" ? 4.0 : 4.5;

      scenes.push({
        id: `scene_${act.id}_${idx + 1}`,
        order: idx + 1,
        title: act.title.toUpperCase(),
        description: act.synopsis,
        mediaId: mem?.id || `mem_fallback_${idx}`,
        mediaUrl: mem?.url || "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1200&auto=format&fit=crop",
        voiceover: act.synopsis,
        durationSec: baseDuration + (idx % 2) * 1.0,
        transition: transitions[idx % transitions.length],
        subtitle: `${mem?.date ? mem.date + " • " : ""}${act.handwrittenBeat.replace(/"/g, "")}`,
        cameraMovement: cameraMoves[idx % cameraMoves.length],
      });
    });

    return scenes;
  }
}

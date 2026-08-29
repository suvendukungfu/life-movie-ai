import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth-service";
import { activeStoryProvider } from "@/lib/ai/story-provider";
import { rateLimiter } from "@/lib/security/rate-limiter";
import { prisma } from "@/lib/db/client";
import { STORY_CATEGORIES, DIRECTOR_STYLES, StoryCategory, DirectorStyle } from "@/lib/sample-data";
import { Memory, StoryInterviewAnswers, StoryChapter, MemoryType, EndingFeeling } from "@/lib/types/domain";

export async function POST(req: Request) {
  const session = await AuthService.getSession(req);
  const userId = session.isAuthenticated && session.user ? session.user.id : "anonymous";
  const rate = rateLimiter.check(`ai_story_${userId}`, 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: "AI story generation rate limit reached. Please wait before generating another outline." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { projectId } = body;
    let { title, category, style, memories, interview } = body;

    // If projectId provided, load project from database if fields missing
    if (projectId) {
      const dbProject = await prisma.project.findUnique({
        where: { id: projectId },
        include: { memories: { orderBy: { sortOrder: "asc" } } },
      });

      if (dbProject) {
        title = title || dbProject.title;
        category = category || dbProject.categoryJson;
        style = style || dbProject.styleJson;

        if (!memories || memories.length === 0) {
          memories = dbProject.memories.map((m) => ({
            id: m.id,
            projectId: m.projectId,
            type: (m.type as MemoryType) || "photo",
            url: m.url,
            thumbnailUrl: m.thumbnailUrl || m.url,
            caption: m.caption || "",
            date: m.date || "",
            location: m.location || "",
            people: (() => {
              try {
                return JSON.parse(m.peopleJson);
              } catch {
                return [];
              }
            })(),
            order: m.sortOrder,
            aspect: m.aspect || "aspect-4/3",
            rotation: m.rotation || 0,
          }));
        }

        if (!interview) {
          const dbInterview = await prisma.storyInterview.findUnique({
            where: { projectId },
          });
          if (dbInterview) {
            interview = {
              about: dbInterview.about || "",
              people: dbInterview.people || "",
              unforgettableMoment: dbInterview.unforgettableMoment || "",
              hardestMoment: dbInterview.hardestMoment || "",
              turningPoint: dbInterview.turningPoint || "",
              endingFeeling: (dbInterview.endingFeeling as EndingFeeling) || "nostalgic",
              additionalNotes: dbInterview.additionalNotes || "",
            };
          }
        }
      }
    }

    title = title || "Untitled Life Film";

    // Resolve Category
    let resolvedCategory: StoryCategory;
    if (typeof category === "object" && category !== null && category.id) {
      resolvedCategory = category;
    } else {
      let catId = typeof category === "string" ? category.toLowerCase() : "nostalgia";
      try {
        const parsed = JSON.parse(category);
        if (parsed?.id) catId = parsed.id.toLowerCase();
      } catch {
        // use raw catId
      }
      resolvedCategory = STORY_CATEGORIES.find((c) => c.id.toLowerCase() === catId) || STORY_CATEGORIES[0];
    }

    // Resolve Style
    let resolvedStyle: DirectorStyle;
    if (typeof style === "object" && style !== null && style.id) {
      resolvedStyle = style;
    } else {
      let styleId = typeof style === "string" ? style.toLowerCase() : "nostalgia";
      try {
        const parsed = JSON.parse(style);
        if (parsed?.id) styleId = parsed.id.toLowerCase();
      } catch {
        // use raw styleId
      }
      resolvedStyle = DIRECTOR_STYLES.find((s) => s.id.toLowerCase() === styleId) || DIRECTOR_STYLES[0];
    }

    // Resolve Memories
    const resolvedMemories: Memory[] = Array.isArray(memories) ? memories : [];

    // Resolve Interview
    const resolvedInterview: StoryInterviewAnswers = {
      about: interview?.about || "A transformative season of growth, friendship, and quiet courage.",
      people: interview?.people || "Family, close companions, and mentors.",
      unforgettableMoment: interview?.unforgettableMoment || "The moment we realized everything was about to change.",
      hardestMoment: interview?.hardestMoment || "Late night uncertainty and overcoming self-doubt.",
      turningPoint: interview?.turningPoint || "Taking the leap into the unknown.",
      endingFeeling: interview?.endingFeeling || "nostalgic",
      additionalNotes: interview?.additionalNotes || "",
    };

    const outline = await activeStoryProvider.generateStoryOutline({
      title,
      category: resolvedCategory,
      style: resolvedStyle,
      memories: resolvedMemories,
      interview: resolvedInterview,
    });

    const outlineExt = outline as { actStructure?: StoryChapter[]; acts?: StoryChapter[]; chapters?: StoryChapter[]; title?: string };
    const chaptersList: StoryChapter[] =
      outline.actStructure || outlineExt.acts || outlineExt.chapters || [];

    // If projectId provided, persist story outline to database
    if (projectId) {
      await prisma.storyOutline.upsert({
        where: { projectId },
        create: {
          projectId,
          logline: outline.logline,
          theme: outline.theme,
          chapters: {
            create: chaptersList.map((chapter, index) => ({
              chapterNumber: chapter.chapterNumber || index + 1,
              title: chapter.title,
              handwrittenBeat: chapter.handwrittenBeat,
              synopsis: chapter.synopsis,
              targetTone: chapter.targetTone,
              memoryIdsJson: JSON.stringify(chapter.associatedMemoryIds || []),
            })),
          },
        },
        update: {
          logline: outline.logline,
          theme: outline.theme,
          chapters: {
            deleteMany: {},
            create: chaptersList.map((chapter, index) => ({
              chapterNumber: chapter.chapterNumber || index + 1,
              title: chapter.title,
              handwrittenBeat: chapter.handwrittenBeat,
              synopsis: chapter.synopsis,
              targetTone: chapter.targetTone,
              memoryIdsJson: JSON.stringify(chapter.associatedMemoryIds || []),
            })),
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      provider: activeStoryProvider.name,
      screenplay: {
        title: outlineExt.title || title,
        logline: outline.logline,
        theme: outline.theme,
        actStructure: chaptersList,
      },
      outline: {
        ...outline,
        actStructure: chaptersList,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate story outline.";
    console.error("AI Story generation failed:", err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

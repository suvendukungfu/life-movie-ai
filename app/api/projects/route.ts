import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth-service";
import { prisma } from "@/lib/db/client";
import { rateLimiter } from "@/lib/security/rate-limiter";
import {
  MovieProject,
  Memory,
  MemoryType,
  ProjectPrivacy,
  ProjectStatus,
  EndingFeeling,
  SceneTransition,
  CameraMovement,
} from "@/lib/types/domain";
import { StoryCategory, DirectorStyle } from "@/lib/sample-data";

export async function GET(req: Request) {
  const session = await AuthService.getSession(req);
  if (!session.isAuthenticated || !session.user) {
    return NextResponse.json({ success: false, error: "Authentication required to view films." }, { status: 401 });
  }

  const dbProjects = await prisma.project.findMany({
    where: { userId: session.user.id },
    include: {
      memories: { orderBy: { sortOrder: "asc" } },
      interview: true,
      storyOutline: {
        include: {
          chapters: { orderBy: { chapterNumber: "asc" } },
        },
      },
      scenes: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const projects: MovieProject[] = dbProjects.map((p) => {
    let category: StoryCategory = {} as StoryCategory;
    let style: DirectorStyle = {} as DirectorStyle;
    try {
      category = JSON.parse(p.categoryJson);
      style = JSON.parse(p.styleJson);
    } catch {
      // fallback
    }

    const memories: Memory[] = p.memories.map((m) => {
      let people: string[] = [];
      try {
        people = JSON.parse(m.peopleJson);
      } catch {
        people = [];
      }
      return {
        id: m.id,
        projectId: m.projectId,
        type: m.type as MemoryType,
        url: m.url,
        thumbnailUrl: m.thumbnailUrl || m.url,
        caption: m.caption || "",
        date: m.date || "",
        location: m.location || "",
        people,
        order: m.sortOrder,
        aspect: m.aspect || "aspect-4/3",
        rotation: m.rotation || 0,
        fileSize: m.fileSize || undefined,
        fileName: m.fileName || undefined,
      };
    });

    return {
      id: p.id,
      userId: p.userId,
      title: p.title,
      category,
      style,
      description: p.description || "",
      privacy: p.privacy as ProjectPrivacy,
      status: p.status as ProjectStatus,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      publicShareId: p.publicShareId || p.id,
      memories,
      interview: p.interview
        ? {
            about: p.interview.about || "",
            people: p.interview.people || "",
            unforgettableMoment: p.interview.unforgettableMoment || "",
            hardestMoment: p.interview.hardestMoment || "",
            turningPoint: p.interview.turningPoint || "",
            endingFeeling: (p.interview.endingFeeling as EndingFeeling) || "nostalgic",
            additionalNotes: p.interview.additionalNotes || undefined,
          }
        : {
            about: "",
            people: "",
            unforgettableMoment: "",
            hardestMoment: "",
            turningPoint: "",
            endingFeeling: "nostalgic",
          },
      storyOutline: p.storyOutline
        ? {
            logline: p.storyOutline.logline,
            theme: p.storyOutline.theme,
            actStructure: p.storyOutline.chapters.map((ch) => ({
              id: ch.id,
              chapterNumber: ch.chapterNumber,
              title: ch.title,
              handwrittenBeat: ch.handwrittenBeat,
              synopsis: ch.synopsis,
              targetTone: ch.targetTone,
              associatedMemoryIds: JSON.parse(ch.memoryIdsJson || "[]"),
            })),
          }
        : undefined,
      scenes: p.scenes.map((sc) => ({
        id: sc.id,
        order: sc.order,
        title: sc.title,
        description: sc.description || "",
        mediaId: sc.mediaId,
        mediaUrl: sc.mediaUrl,
        voiceover: sc.voiceover || "",
        durationSec: sc.durationSec,
        transition: sc.transition as SceneTransition,
        subtitle: sc.subtitle || "",
        cameraMovement: sc.cameraMovement as CameraMovement,
      })),
    };
  });

  return NextResponse.json({ success: true, projects, user: session.user });
}

export async function POST(req: Request) {
  const session = await AuthService.getSession(req);
  if (!session.isAuthenticated || !session.user) {
    return NextResponse.json({ success: false, error: "Authentication required to create a film." }, { status: 401 });
  }

  const rate = rateLimiter.check(`create_project_${session.user.id}`, 30, 60000);
  if (!rate.allowed) {
    return NextResponse.json({ success: false, error: "Rate limit reached. Please wait before creating more films." }, { status: 429 });
  }

  try {
    const body: Partial<MovieProject> = await req.json();
    if (!body.title) {
      return NextResponse.json({ success: false, error: "Film title is required." }, { status: 400 });
    }

    const projectId = body.id || `film_${Date.now()}`;
    const categoryJson = JSON.stringify(body.category || {});
    const styleJson = JSON.stringify(body.style || {});

    // Verify ownership if project already exists
    if (body.id) {
      const existingProject = await prisma.project.findUnique({
        where: { id: body.id },
        select: { userId: true },
      });
      if (existingProject && existingProject.userId !== session.user.id) {
        return NextResponse.json(
          { success: false, error: "You do not have authorization to modify this project." },
          { status: 403 }
        );
      }
    }

    // Create or update project in Prisma database
    const dbProject = await prisma.project.upsert({
      where: { id: projectId },
      create: {
        id: projectId,
        userId: session.user.id,
        title: body.title,
        categoryJson,
        styleJson,
        description: body.description || "",
        privacy: body.privacy || "public",
        status: body.status || "draft",
        publicShareId: body.publicShareId || projectId,
      },
      update: {
        title: body.title,
        categoryJson,
        styleJson,
        description: body.description || "",
        privacy: body.privacy || "public",
        status: body.status || "draft",
      },
      include: {
        memories: { orderBy: { sortOrder: "asc" } },
      },
    });

    // Save interview if provided
    if (body.interview) {
      await prisma.storyInterview.upsert({
        where: { projectId: dbProject.id },
        create: {
          projectId: dbProject.id,
          about: body.interview.about || "",
          people: body.interview.people || "",
          unforgettableMoment: body.interview.unforgettableMoment || "",
          hardestMoment: body.interview.hardestMoment || "",
          turningPoint: body.interview.turningPoint || "",
          endingFeeling: body.interview.endingFeeling || "nostalgic",
          additionalNotes: body.interview.additionalNotes || "",
        },
        update: {
          about: body.interview.about || "",
          people: body.interview.people || "",
          unforgettableMoment: body.interview.unforgettableMoment || "",
          hardestMoment: body.interview.hardestMoment || "",
          turningPoint: body.interview.turningPoint || "",
          endingFeeling: body.interview.endingFeeling || "nostalgic",
          additionalNotes: body.interview.additionalNotes || "",
        },
      });
    }

    // Save story outline if provided
    if (body.storyOutline) {
      const outline = await prisma.storyOutline.upsert({
        where: { projectId: dbProject.id },
        create: {
          projectId: dbProject.id,
          logline: body.storyOutline.logline,
          theme: body.storyOutline.theme,
        },
        update: {
          logline: body.storyOutline.logline,
          theme: body.storyOutline.theme,
        },
      });

      // Clear and re-create chapters
      await prisma.storyChapter.deleteMany({ where: { outlineId: outline.id } });
      for (const ch of body.storyOutline.actStructure) {
        await prisma.storyChapter.create({
          data: {
            outlineId: outline.id,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            handwrittenBeat: ch.handwrittenBeat,
            synopsis: ch.synopsis,
            targetTone: ch.targetTone,
            memoryIdsJson: JSON.stringify(ch.associatedMemoryIds || []),
          },
        });
      }
    }

    // Save scenes if provided
    if (body.scenes && body.scenes.length > 0) {
      await prisma.movieScene.deleteMany({ where: { projectId: dbProject.id } });
      for (const sc of body.scenes) {
        await prisma.movieScene.create({
          data: {
            projectId: dbProject.id,
            order: sc.order,
            title: sc.title,
            description: sc.description,
            mediaId: sc.mediaId,
            mediaUrl: sc.mediaUrl,
            voiceover: sc.voiceover,
            durationSec: sc.durationSec,
            transition: sc.transition,
            subtitle: sc.subtitle,
            cameraMovement: sc.cameraMovement,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      project: {
        ...body,
        id: dbProject.id,
        userId: dbProject.userId,
        createdAt: dbProject.createdAt.toISOString(),
        updatedAt: dbProject.updatedAt.toISOString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to persist project.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

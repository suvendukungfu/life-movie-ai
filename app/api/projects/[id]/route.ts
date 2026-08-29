import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth-service";
import { prisma } from "@/lib/db/client";
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

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  const { id } = await params;
  const session = await AuthService.getSession(req);

  const p = await prisma.project.findUnique({
    where: { id },
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
  });

  if (!p) {
    return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
  }

  // Verify ownership or public access
  if (p.privacy === "private") {
    if (!session.isAuthenticated || session.user.id !== p.userId) {
      return NextResponse.json(
        { success: false, error: "You do not have authorization to view this private film." },
        { status: 403 }
      );
    }
  }

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

  const project: MovieProject = {
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

  return NextResponse.json({ success: true, project });
}

export async function PATCH(req: Request, { params }: RouteProps) {
  const { id } = await params;
  const session = await AuthService.getSession(req);

  if (!session.isAuthenticated || !session.user) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  const existing = await prisma.project.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json(
      { success: false, error: "You do not have authorization to modify this project." },
      { status: 403 }
    );
  }

  try {
    const updates = await req.json();
    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: updates.title,
        description: updates.description,
        privacy: updates.privacy,
        status: updates.status,
      },
    });

    return NextResponse.json({ success: true, project: updated });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Update failed.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteProps) {
  const { id } = await params;
  const session = await AuthService.getSession(req);

  if (!session.isAuthenticated || !session.user) {
    return NextResponse.json({ success: false, error: "Authentication required." }, { status: 401 });
  }

  const existing = await prisma.project.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!existing) {
    return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json(
      { success: false, error: "You do not have authorization to delete this project." },
      { status: 403 }
    );
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true, message: "Project deleted successfully." });
}

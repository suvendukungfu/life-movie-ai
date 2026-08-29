import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";

interface RouteProps {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteProps) {
  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: {
      OR: [{ publicShareId: id }, { id }],
    },
    include: {
      memories: { orderBy: { sortOrder: "asc" } },
      interview: true,
      storyOutline: {
        include: {
          chapters: { orderBy: { chapterNumber: "asc" } },
        },
      },
      scenes: { orderBy: { order: "asc" } },
      jobs: { where: { status: "complete" }, orderBy: { completedAt: "desc" }, take: 1 },
    },
  });

  if (!project) {
    return NextResponse.json({ success: false, error: "Film not found." }, { status: 404 });
  }

  if (project.privacy === "private") {
    return NextResponse.json(
      { success: false, error: "This archival film is marked private by the director." },
      { status: 403 }
    );
  }

  let category: Record<string, unknown> = {};
  let style: Record<string, unknown> = {};
  try {
    category = JSON.parse(project.categoryJson);
    style = JSON.parse(project.styleJson);
  } catch {}

  const latestJob = project.jobs?.[0];

  const sanitized = {
    id: project.id,
    publicShareId: project.publicShareId || project.id,
    title: project.title,
    category,
    style,
    description: project.description,
    outputVideoUrl: latestJob?.outputVideoUrl || null,
    posterUrl: latestJob ? `/api/render/jobs/${latestJob.id}/poster.jpg` : null,
    storyOutline: project.storyOutline
      ? {
          logline: project.storyOutline.logline,
          theme: project.storyOutline.theme,
          actStructure: project.storyOutline.chapters.map((ch) => ({
            id: ch.id,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            handwrittenBeat: ch.handwrittenBeat,
            synopsis: ch.synopsis,
            targetTone: ch.targetTone,
          })),
        }
      : undefined,
    scenes: project.scenes.map((sc) => ({
      id: sc.id,
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
    })),
    createdAt: project.createdAt.toISOString(),
    memoriesCount: project.memories.length,
  };

  return NextResponse.json({ success: true, film: sanitized });
}

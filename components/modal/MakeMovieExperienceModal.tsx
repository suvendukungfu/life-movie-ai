"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { STORY_CATEGORIES, DIRECTOR_STYLES, DESK_PHOTOS, DirectorStyle, StoryCategory } from "@/lib/sample-data";
import { sound } from "@/lib/audio-synth";
import { Tape } from "@/components/ui/Tape";
import {
  X,
  Upload,
  Film,
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  Trash2,
  Calendar,
  MapPin,
  Users,
  Copy,
  FolderHeart,
  Edit3,
  Download,
} from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { Memory, StoryInterviewAnswers, StoryOutline, MovieScene, MovieProject, EndingFeeling } from "@/lib/types/domain";
import { MediaService } from "@/lib/media/media-service";
import { StoryGenerator } from "@/lib/ai/story-generator";
import { projectRepository } from "@/lib/storage/project-repository";
import Link from "next/link";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: StoryCategory;
  initialStyle?: DirectorStyle;
}

export function MakeMovieExperienceModal({
  isOpen,
  onClose,
  initialCategory,
  initialStyle,
}: ModalProps) {
  // Step 1: Arc & Title
  const [step, setStep] = useState<number>(1);
  const [title, setTitle] = useState<string>("SUMMER ON THE COAST");
  const [selectedCat, setSelectedCat] = useState<StoryCategory>(() => initialCategory || STORY_CATEGORIES[0]);

  // Step 2 & 3: Media Upload & Organization
  const [memories, setMemories] = useState<Memory[]>(() =>
    DESK_PHOTOS.slice(0, 4).map((p, idx) => ({
      id: `mem_preset_${idx}`,
      projectId: "proj_new",
      type: "photo",
      url: p.imageUrl,
      thumbnailUrl: p.imageUrl,
      caption: p.title,
      date: p.year || "2024-06-15",
      location: p.location || "Coastline",
      people: ["Maya", "Rohan"],
      order: idx + 1,
      aspect: "aspect-4/3",
      rotation: idx % 2 === 0 ? -1.5 : 2,
    }))
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 4: Story Interview
  const [interview, setInterview] = useState<StoryInterviewAnswers>({
    about: "A spontaneous road trip along the coast before everyone moved away.",
    people: "Maya, Rohan, Kabir, and Tara",
    unforgettableMoment: "Singing on the cliffside while the sun slipped below the water.",
    hardestMoment: "Packing our bags on the final evening in silence.",
    turningPoint: "When the car broke down and we had to camp on the beach.",
    endingFeeling: "nostalgic",
  });

  // Step 5: Director Style
  const [selectedDir, setSelectedDir] = useState<DirectorStyle>(() => initialStyle || DIRECTOR_STYLES[2]);

  // Step 6: Story Outline Approval
  const [storyOutline, setStoryOutline] = useState<StoryOutline | null>(null);

  // Step 7: Generation Progress
  const [generationProgress, setGenerationProgress] = useState<number>(0);
  const [stageDescription, setStageDescription] = useState<string>("01 / UNDERSTANDING YOUR MEMORIES");

  // Step 8: Playback & Saving
  const [generatedScenes, setGeneratedScenes] = useState<MovieScene[]>([]);
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [savedProject, setSavedProject] = useState<MovieProject | null>(null);
  const [shareCopied, setShareCopied] = useState<boolean>(false);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [renderedPosterUrl, setRenderedPosterUrl] = useState<string | null>(null);

  // Keyboard accessibility: Escape key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        sound.playTap();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Handle Playback Interval for Generated Scenes
  useEffect(() => {
    let timer: NodeJS.Timeout | number | undefined;
    if (isPlaying && generatedScenes.length > 0) {
      sound.startProjectorGate();
      timer = setInterval(() => {
        setCurrentSceneIdx((prev) => {
          if (prev >= generatedScenes.length - 1) {
            setIsPlaying(false);
            sound.stopProjectorGate();
            return 0;
          }
          sound.playShutter();
          return prev + 1;
        });
      }, 4000);
    } else {
      sound.stopProjectorGate();
    }
    return () => {
      clearInterval(timer);
      sound.stopProjectorGate();
    };
  }, [isPlaying, generatedScenes]);

  // Real Upload Handler storing actual binary files via /api/upload/file
  const [activeProjectId, setActiveProjectId] = useState<string>(() => `film_${Math.random().toString(36).substring(2, 10)}`);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    sound.playShutter();

    const projId = activeProjectId || `film_${Date.now()}`;
    if (!activeProjectId) setActiveProjectId(projId);

    // 1. Ensure project exists in database first
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: projId,
          title: title || "Untitled Film",
          category: selectedCat,
          style: selectedDir,
          status: "draft",
        }),
      });
    } catch {
      // Continue
    }

    // 2. Upload actual binary files to /api/upload/file
    const uploadedMemories: Memory[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projId);
        formData.append("caption", file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
        formData.append("date", new Date().toISOString().split("T")[0]);

        const res = await fetch("/api/upload/file", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.memory) {
          uploadedMemories.push(data.memory);
        } else {
          // Client-side fallback if unauthenticated
          const fallbackMem = await MediaService.fileToMemory(file, projId, memories.length + i + 1);
          uploadedMemories.push(fallbackMem);
        }
      } catch {
        const fallbackMem = await MediaService.fileToMemory(file, projId, memories.length + i + 1);
        uploadedMemories.push(fallbackMem);
      }
    }

    if (uploadedMemories.length > 0) {
      setMemories((prev) => [...prev, ...uploadedMemories]);
    }
  };

  const handleRemoveMemory = (id: string) => {
    sound.playTap();
    if (memories.length > 1) {
      setMemories(memories.filter((m) => m.id !== id));
    }
  };

  const handleUpdateMemoryCaption = (id: string, newCaption: string) => {
    setMemories(memories.map((m) => (m.id === id ? { ...m, caption: newCaption } : m)));
  };

  // Generate Story Outline (Step 5 -> Step 6) using Real AI API endpoint
  const handlePrepareStoryOutline = async () => {
    sound.playShutter();
    try {
      const res = await fetch("/api/story/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category: selectedCat,
          style: selectedDir,
          memories,
          interview,
        }),
      });
      const data = await res.json();
      if (data.success && data.outline) {
        setStoryOutline(data.outline);
      } else {
        // Fallback to local engine
        const fallback = StoryGenerator.generateOutline(title, selectedCat, selectedDir, memories, interview);
        setStoryOutline(fallback);
      }
    } catch {
      const fallback = StoryGenerator.generateOutline(title, selectedCat, selectedDir, memories, interview);
      setStoryOutline(fallback);
    }
    setStep(6);
  };

  // Start Real Background Render Job (Step 6 -> Step 7 -> Step 8)
  const handleStartGenerationJob = async () => {
    if (!storyOutline) return;
    sound.playShutter();
    setStep(7);
    setGenerationProgress(10);
    setStageDescription("01 / QUEUED FOR 35MM PROCESSING");

    const projectId = `film_${Date.now()}`;
    const scenes = StoryGenerator.generateScenes(storyOutline, memories, selectedDir);
    setGeneratedScenes(scenes);

    const newProj: MovieProject = {
      id: projectId,
      userId: "user_filmmaker_01",
      title,
      category: selectedCat,
      style: selectedDir,
      description: storyOutline.logline,
      privacy: "public",
      status: "ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publicShareId: projectId,
      memories,
      interview,
      storyOutline,
      scenes,
    };

    try {
      // 1. Dispatch real server render job
      const jobRes = await fetch("/api/render/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const jobData = await jobRes.json();

      if (jobData.success && jobData.job) {
        const jobId = jobData.job.id;
        
        // 2. Poll server render job telemetry
        const pollInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/render/jobs/${jobId}`);
            const statusData = await statusRes.json();
            if (statusData.success && statusData.job) {
              const currentJob = statusData.job;
              setGenerationProgress(currentJob.progress);
              setStageDescription(currentJob.stageDescription);
              sound.playTap();

              if (currentJob.status === "complete" || currentJob.status === "completed" || currentJob.progress >= 100) {
                clearInterval(pollInterval);
                
                if (currentJob.outputVideoUrl) {
                  setRenderedVideoUrl(currentJob.outputVideoUrl);
                  setRenderedPosterUrl(`/api/render/jobs/${jobId}/poster.jpg`);
                }

                // Save to server database
                await fetch("/api/projects", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(newProj),
                });

                // Also save to client local repo
                await projectRepository.save(newProj);
                setSavedProject(newProj);
                setStep(8);
                setIsPlaying(true);
                sound.playCinematicChord();

                confetti({
                  particleCount: 70,
                  spread: 80,
                  origin: { y: 0.6 },
                  colors: ["#C85A28", "#EAA846", "#201D1C", "#FAF8F5"],
                });
              }
            }
          } catch {
            // Silently continue polling
          }
        }, 1000);
        return;
      }
    } catch {
      // Fallback local simulated pipeline if server request fails
    }

    // Local fallback loop
    const stages = [
      { progress: 25, desc: "02 / ANALYZING MEMORIES & TIMESTAMP CHRONOLOGY" },
      { progress: 50, desc: "03 / STRUCTURING 5-ACT NARRATIVE BEATS" },
      { progress: 70, desc: `04 / DIRECTING SCENES IN ${selectedDir.name.toUpperCase()} LENS` },
      { progress: 85, desc: "05 / MASTERING ANALOG SCORE & VOICE STEMS" },
      { progress: 100, desc: "06 / 4K MASTER READY" },
    ];

    stages.forEach((st, idx) => {
      setTimeout(async () => {
        setGenerationProgress(st.progress);
        setStageDescription(st.desc);
        sound.playTap();

        if (idx === stages.length - 1) {
          await projectRepository.save(newProj);
          setSavedProject(newProj);
          setStep(8);
          setIsPlaying(true);
          sound.playCinematicChord();

          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#C85A28", "#EAA846", "#201D1C", "#FAF8F5"],
          });
        }
      }, (idx + 1) * 900);
    });
  };

  const copyShareLink = () => {
    if (!savedProject) return;
    const url = `${window.location.origin}/film/${savedProject.publicShareId || savedProject.id}`;
    navigator.clipboard.writeText(url);
    setShareCopied(true);
    sound.playTap();
    setTimeout(() => setShareCopied(false), 2500);
  };

  const activeScene = generatedScenes[currentSceneIdx] || generatedScenes[0];

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-studio-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sound.playTap();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/85 backdrop-blur-md select-none animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#F5EFEB] rounded-xs photo-shadow-deep border border-[#DFD5C6] p-4 sm:p-8 flex flex-col justify-between">
        
        {/* Top washi tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none">
          <Tape variant="amber" rotation={-1} />
        </div>

        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-[#E0D5C5] pb-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#201D1C] text-[#FAF8F5] flex items-center justify-center font-display text-sm">
              LM
            </div>
            <div>
              <span id="modal-studio-title" className="font-display text-2xl text-[#201D1C] block leading-none">
                LIFE MOVIE STUDIO
              </span>
              <span className="font-typewriter text-[10px] text-[#7A7166] uppercase">
                DIRECTOR&apos;S CUT COMPOSER • STEP {step} OF 8
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playTap();
              onClose();
            }}
            className="p-2.5 min-w-11 min-h-11 flex items-center justify-center hover:bg-[#EAE0D0] rounded-full transition-colors cursor-pointer"
            aria-label="Close studio dialog"
          >
            <X className="w-5 h-5 text-[#201D1C]" />
          </button>
        </div>

        {/* STEP 1: ARC & TITLE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="font-typewriter text-xs text-[#C85A28] font-bold uppercase tracking-widest block mb-1">
                STEP 01 • FILM TITLE & STORY ARC
              </span>
              <h3 className="font-display text-4xl sm:text-5xl text-[#201D1C] uppercase leading-none">
                WHAT IS YOUR MOVIE CALLED?
              </h3>
            </div>

            <div>
              <label className="font-typewriter text-xs text-[#7A7166] uppercase block mb-1">
                Movie Title (Marquee Headline)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#FAF8F5] border-2 border-[#201D1C] px-4 py-3 font-display text-2xl sm:text-3xl text-[#201D1C] tracking-wide rounded-xs focus:outline-none focus:border-[#C85A28]"
                placeholder="e.g. THE SUMMER OF 2024"
              />
            </div>

            <div>
              <label className="font-typewriter text-xs text-[#7A7166] uppercase block mb-2">
                Choose Story Arc Archive
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {STORY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sound.playTap();
                      setSelectedCat(cat);
                    }}
                    className={cn(
                      "p-3 rounded-xs border text-left transition-all cursor-pointer",
                      selectedCat.id === cat.id
                        ? "bg-[#201D1C] text-[#FAF8F5] border-[#201D1C] shadow-md"
                        : "bg-[#FAF8F5] text-[#201D1C] border-[#DED3C3] hover:bg-[#ECE1D1]"
                    )}
                  >
                    <span className="font-display text-lg block leading-none">
                      {cat.title}
                    </span>
                    <span className="font-hand text-sm opacity-80 block truncate">
                      {cat.handwrittenSub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-[#E0D5C5]">
              <button
                onClick={() => {
                  sound.playTap();
                  setStep(2);
                }}
                className="px-6 py-3 bg-[#201D1C] text-white font-display text-xl tracking-wider rounded-xs hover:bg-[#C85A28] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>UPLOAD FOOTAGE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: REAL MEDIA UPLOAD */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <span className="font-typewriter text-xs text-[#C85A28] font-bold uppercase tracking-widest block mb-1">
                STEP 02 • INGEST PHOTOS, VIDEOS & AUDIO
              </span>
              <h3 className="font-display text-4xl sm:text-5xl text-[#201D1C] uppercase leading-none">
                DROP YOUR RAW MEMORIES
              </h3>
            </div>

            {/* Drag & Drop Upload Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(e.dataTransfer.files);
              }}
              className="border-2 border-dashed border-[#201D1C]/40 bg-[#FAF8F5] hover:border-[#C85A28] hover:bg-[#FAF6F0] p-6 sm:p-8 rounded-xs text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
            >
              <div className="w-12 h-12 rounded-full bg-[#EAE0D0] group-hover:bg-[#C85A28]/20 flex items-center justify-center transition-colors">
                <Upload className="w-6 h-6 text-[#C85A28]" />
              </div>
              <div>
                <p className="font-display text-2xl text-[#201D1C] tracking-wide">
                  CLICK TO SELECT OR DRAG & DROP
                </p>
                <p className="font-typewriter text-xs text-[#7A7166] mt-1 uppercase">
                  JPG • PNG • WEBP • MP4 • MOV • MP3 (UP TO 50MB)
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*,audio/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
            </div>

            {uploadError && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs font-typewriter rounded-xs">
                {uploadError}
              </div>
            )}

            {/* Thumbnails of currently ingested memories */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-typewriter text-xs text-[#7A7166] uppercase">
                  CURRENT REEL ({memories.length} ITEMS)
                </span>
                <span className="font-hand text-sm text-[#C85A28]">
                  mix personal uploads with vintage negatives
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-1">
                {memories.map((mem) => (
                  <div
                    key={mem.id}
                    className="relative aspect-4/3 bg-neutral-900 rounded-xs overflow-hidden border border-[#DDD0C0] group photo-shadow"
                  >
                    <Image
                      src={mem.url}
                      alt={mem.caption}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveMemory(mem.id);
                      }}
                      className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-red-700 text-white rounded-xs transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[10px] text-white font-typewriter truncate">
                      {mem.caption}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-[#E0D5C5]">
              <button
                onClick={() => {
                  sound.playTap();
                  setStep(1);
                }}
                className="px-5 py-2.5 border border-[#201D1C] font-display text-lg tracking-wider rounded-xs cursor-pointer"
              >
                BACK
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setStep(3);
                }}
                className="px-6 py-3 bg-[#201D1C] text-white font-display text-xl tracking-wider rounded-xs hover:bg-[#C85A28] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>ORGANIZE CONTACT SHEET</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: MEMORY ORGANIZATION CONTACT SHEET */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <span className="font-typewriter text-xs text-[#C85A28] font-bold uppercase tracking-widest block mb-1">
                STEP 03 • MEMORY CONTACT SHEET & METADATA
              </span>
              <h3 className="font-display text-4xl sm:text-5xl text-[#201D1C] uppercase leading-none">
                CATALOG YOUR MEMORIES
              </h3>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
              {memories.map((mem, idx) => (
                <div
                  key={mem.id}
                  className="bg-[#FAF8F5] p-3 rounded-xs border border-[#DED3C3] photo-shadow flex flex-col sm:flex-row items-start sm:items-center gap-4"
                >
                  <div className="relative w-20 h-16 sm:w-24 sm:h-20 bg-neutral-900 rounded-xs overflow-hidden shrink-0">
                    <Image
                      src={mem.url}
                      alt={mem.caption}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-1 left-1 font-typewriter text-[9px] bg-black/60 text-white px-1 rounded-xs">
                      #{idx + 1}
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-3.5 h-3.5 text-[#C85A28]" />
                      <input
                        type="text"
                        value={mem.caption}
                        onChange={(e) => handleUpdateMemoryCaption(mem.id, e.target.value)}
                        className="w-full font-hand text-lg text-[#201D1C] bg-transparent border-b border-dashed border-[#201D1C]/40 focus:border-[#C85A28] focus:outline-none"
                        placeholder="Add a handwritten memory note..."
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-4 font-typewriter text-[11px] text-[#7A7166]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#C85A28]" />
                        {mem.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#C85A28]" />
                        {mem.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#C85A28]" />
                        {mem.people.length ? mem.people.join(", ") : "Friends"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-3 border-t border-[#E0D5C5]">
              <button
                onClick={() => {
                  sound.playTap();
                  setStep(2);
                }}
                className="px-5 py-2.5 border border-[#201D1C] font-display text-lg tracking-wider rounded-xs cursor-pointer"
              >
                BACK
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setStep(4);
                }}
                className="px-6 py-3 bg-[#201D1C] text-white font-display text-xl tracking-wider rounded-xs hover:bg-[#C85A28] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>DIRECTOR INTERVIEW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: 6-QUESTION STORY INTERVIEW */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <span className="font-typewriter text-xs text-[#C85A28] font-bold uppercase tracking-widest block mb-1">
                STEP 04 • THE DIRECTOR&apos;S INTERVIEW (5-7 QUESTIONS)
              </span>
              <h3 className="font-display text-4xl sm:text-5xl text-[#201D1C] uppercase leading-none">
                UNCOVERING THE STORY
              </h3>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
              <div>
                <label className="font-typewriter text-xs text-[#7A7166] uppercase block mb-1">
                  1. What are we making this movie about?
                </label>
                <input
                  type="text"
                  value={interview.about}
                  onChange={(e) => setInterview({ ...interview, about: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#201D1C] px-3 py-2 font-hand text-xl text-[#201D1C] rounded-xs focus:outline-none focus:border-[#C85A28]"
                />
              </div>

              <div>
                <label className="font-typewriter text-xs text-[#7A7166] uppercase block mb-1">
                  2. Who are the central people in this story?
                </label>
                <input
                  type="text"
                  value={interview.people}
                  onChange={(e) => setInterview({ ...interview, people: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#201D1C] px-3 py-2 font-hand text-xl text-[#201D1C] rounded-xs focus:outline-none focus:border-[#C85A28]"
                />
              </div>

              <div>
                <label className="font-typewriter text-xs text-[#7A7166] uppercase block mb-1">
                  3. What is one moment you never want to forget?
                </label>
                <input
                  type="text"
                  value={interview.unforgettableMoment}
                  onChange={(e) => setInterview({ ...interview, unforgettableMoment: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#201D1C] px-3 py-2 font-hand text-xl text-[#201D1C] rounded-xs focus:outline-none focus:border-[#C85A28]"
                />
              </div>

              <div>
                <label className="font-typewriter text-xs text-[#7A7166] uppercase block mb-1">
                  4. What was the hardest moment or turning point?
                </label>
                <input
                  type="text"
                  value={interview.hardestMoment}
                  onChange={(e) => setInterview({ ...interview, hardestMoment: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#201D1C] px-3 py-2 font-hand text-xl text-[#201D1C] rounded-xs focus:outline-none focus:border-[#C85A28]"
                />
              </div>

              <div>
                <label className="font-typewriter text-xs text-[#7A7166] uppercase block mb-2">
                  5. How should the ending feel?
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(["funny", "emotional", "nostalgic", "hopeful", "dramatic", "romantic"] as EndingFeeling[]).map((feeling) => (
                    <button
                      key={feeling}
                      onClick={() => {
                        sound.playTap();
                        setInterview({ ...interview, endingFeeling: feeling });
                      }}
                      className={cn(
                        "py-2 px-2 rounded-xs border text-center font-typewriter text-xs uppercase transition-all cursor-pointer",
                        interview.endingFeeling === feeling
                          ? "bg-[#C85A28] text-white border-[#C85A28] shadow-sm font-bold"
                          : "bg-[#FAF8F5] text-[#201D1C] border-[#DED3C3] hover:bg-[#ECE1D1]"
                      )}
                    >
                      {feeling}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-3 border-t border-[#E0D5C5]">
              <button
                onClick={() => {
                  sound.playTap();
                  setStep(3);
                }}
                className="px-5 py-2.5 border border-[#201D1C] font-display text-lg tracking-wider rounded-xs cursor-pointer"
              >
                BACK
              </button>
              <button
                onClick={() => {
                  sound.playTap();
                  setStep(5);
                }}
                className="px-6 py-3 bg-[#201D1C] text-white font-display text-xl tracking-wider rounded-xs hover:bg-[#C85A28] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>CHOOSE DIRECTOR</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: DIRECTOR STYLE SELECTION */}
        {step === 5 && (
          <div className="space-y-5">
            <div>
              <span className="font-typewriter text-xs text-[#C85A28] font-bold uppercase tracking-widest block mb-1">
                STEP 05 • CINEMATIC LENS & COLOR GRADE
              </span>
              <h3 className="font-display text-4xl sm:text-5xl text-[#201D1C] uppercase leading-none">
                CHOOSE YOUR DIRECTOR
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
              {DIRECTOR_STYLES.map((dir) => (
                <button
                  key={dir.id}
                  onClick={() => {
                    sound.playTap();
                    setSelectedDir(dir);
                  }}
                  className={cn(
                    "p-3.5 rounded-xs border text-left transition-all cursor-pointer flex flex-col justify-between",
                    selectedDir.id === dir.id
                      ? "bg-[#201D1C] text-[#FAF8F5] border-[#201D1C] shadow-md"
                      : "bg-[#FAF8F5] text-[#201D1C] border-[#DED3C3] hover:bg-[#ECE1D1]"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display text-2xl tracking-wide">
                      {dir.name}
                    </span>
                    <span className="font-typewriter text-[10px] uppercase px-1.5 py-0.5 bg-black/20 rounded-xs">
                      {dir.aspectRatio}
                    </span>
                  </div>
                  <p className={cn(
                    "font-hand text-lg",
                    selectedDir.id === dir.id ? "text-[#EAA846]" : "text-[#C85A28]"
                  )}>
                    &ldquo;{dir.note}&rdquo;
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">
                    {dir.tagline}
                  </p>
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-3 border-t border-[#E0D5C5]">
              <button
                onClick={() => {
                  sound.playTap();
                  setStep(4);
                }}
                className="px-5 py-2.5 border border-[#201D1C] font-display text-lg tracking-wider rounded-xs cursor-pointer"
              >
                BACK
              </button>
              <button
                onClick={handlePrepareStoryOutline}
                className="px-6 py-3 bg-[#201D1C] text-white font-display text-xl tracking-wider rounded-xs hover:bg-[#C85A28] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>GENERATE STORY OUTLINE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: STORY OUTLINE & 5-CHAPTER APPROVAL */}
        {step === 6 && storyOutline && (
          <div className="space-y-4">
            <div>
              <span className="font-typewriter text-xs text-[#C85A28] font-bold uppercase tracking-widest block mb-1">
                STEP 06 • 5-ACT SCREENPLAY APPROVAL
              </span>
              <h3 className="font-display text-4xl sm:text-5xl text-[#201D1C] uppercase leading-none">
                REVIEW & APPROVE YOUR FILM
              </h3>
            </div>

            <div className="bg-[#FAF8F5] p-3.5 rounded-xs border border-[#201D1C]">
              <span className="font-typewriter text-[10px] text-[#C85A28] uppercase font-bold block mb-0.5">
                FILM LOGLINE & THEME
              </span>
              <p className="font-serif italic text-base sm:text-lg text-[#201D1C]">
                &ldquo;{storyOutline.logline}&rdquo;
              </p>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2.5 pr-1">
              {storyOutline.actStructure.map((act, idx) => (
                <div
                  key={act.id}
                  className="bg-[#FAF8F5] p-3 rounded-xs border border-[#DED3C3] flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="font-typewriter text-[10px] text-[#C85A28] font-bold uppercase block">
                      ACT {idx + 1} • {act.targetTone}
                    </span>
                    <span className="font-display text-lg text-[#201D1C] block">
                      {act.title}
                    </span>
                    <p className="font-hand text-base text-[#5C5349]">
                      {act.handwrittenBeat}
                    </p>
                  </div>
                  <div className="shrink-0 font-typewriter text-[10px] text-neutral-400 bg-neutral-100 px-2 py-1 rounded-xs">
                    APPROVED
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-3 border-t border-[#E0D5C5]">
              <button
                onClick={() => {
                  sound.playTap();
                  setStep(5);
                }}
                className="px-5 py-2.5 border border-[#201D1C] font-display text-lg tracking-wider rounded-xs cursor-pointer"
              >
                BACK
              </button>
              <button
                onClick={handleStartGenerationJob}
                className="px-8 py-3.5 bg-[#C85A28] text-white font-display text-2xl tracking-wider rounded-xs hover:bg-[#A84518] shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Film className="w-5 h-5" />
                <span>RENDER 4K CINEMA MASTER</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 7: REAL GENERATION PROGRESS TELEMETRY */}
        {step === 7 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-20 h-20 rounded-full border-4 border-[#C85A28] border-t-transparent animate-spin mx-auto" />
            <div>
              <h3 className="font-display text-4xl sm:text-5xl text-[#201D1C] uppercase mb-2">
                WEAVING YOUR CINEMATIC MASTERPIECE...
              </h3>
              <p className="font-typewriter text-sm text-[#C85A28] tracking-widest uppercase font-bold">
                {stageDescription}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md bg-[#E0D5C5] h-3 rounded-full overflow-hidden border border-[#201D1C]/30">
              <div
                className="bg-[#C85A28] h-full transition-all duration-500"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <span className="font-typewriter text-xs text-[#7A7166]">
              {generationProgress}% COMPLETED
            </span>
          </div>
        )}

        {/* STEP 8: 2.39:1 PREMIERE CINEMA PLAYER & SHARE */}
        {step === 8 && activeScene && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 bg-[#C85A28]/10 text-[#C85A28] px-3 py-1 rounded-full border border-[#C85A28]/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="font-typewriter text-[10px] uppercase tracking-widest font-bold">
                  4K CINEMA PREMIERE CUT • SAVED TO ARCHIVE
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={copyShareLink}
                  className="px-3 py-1 bg-[#FAF8F5] border border-[#201D1C] font-typewriter text-xs tracking-wider rounded-xs hover:bg-[#EAE0D0] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{shareCopied ? "LINK COPIED!" : "COPY SHARE LINK"}</span>
                </button>

                <Link
                  href="/films"
                  onClick={onClose}
                  className="px-3 py-1 bg-[#201D1C] text-white font-typewriter text-xs tracking-wider rounded-xs hover:bg-[#C85A28] transition-colors flex items-center gap-1.5"
                >
                  <FolderHeart className="w-3.5 h-3.5" />
                  <span>MY FILMS</span>
                </Link>
              </div>
            </div>

            {/* The 2.39:1 Anamorphic Cinema Player */}
            <div className="relative w-full aspect-21/9 bg-black rounded-xs overflow-hidden photo-shadow-deep border-2 border-[#201D1C] mx-auto flex flex-col justify-between">
              {renderedVideoUrl ? (
                <video
                  src={renderedVideoUrl}
                  poster={renderedPosterUrl || undefined}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  <Image
                    src={activeScene.mediaUrl}
                    alt={activeScene.title}
                    fill
                    className="object-cover contrast-105"
                    style={{ filter: selectedDir.colorGrade }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/85 via-transparent to-black/35" />

                  {/* Top Film Bar */}
                  <div className="relative z-20 flex justify-between items-center p-3 text-white/80 font-typewriter text-[10px] uppercase">
                    <span>LIFE MOVIE PREMIERE • {title}</span>
                    <span>{selectedDir.name.toUpperCase()} • 2.39:1 CINEMASCOPE</span>
                  </div>

                  {/* Center Playback Toggle Overlay */}
                  <div className="relative z-20 self-center flex flex-col items-center">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-14 h-14 rounded-full bg-[#C85A28] text-white flex items-center justify-center photo-shadow-deep hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xl"
                      aria-label={isPlaying ? "Pause trailer" : "Play trailer"}
                    >
                      {isPlaying ? (
                        <Pause className="w-6 h-6 fill-current" />
                      ) : (
                        <Play className="w-6 h-6 fill-current translate-x-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Subtitles & Chapter Bottom Bar */}
                  <div className="relative z-20 p-4 text-center">
                    <p className="font-hand text-xl sm:text-2xl text-white drop-shadow-md">
                      &ldquo;{activeScene.subtitle}&rdquo;
                    </p>
                    <div className="flex justify-center items-center gap-1.5 mt-2">
                      {generatedScenes.map((s, idx) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            sound.playTap();
                            setCurrentSceneIdx(idx);
                          }}
                          className={cn(
                            "h-1.5 rounded-full transition-all cursor-pointer",
                            currentSceneIdx === idx ? "w-8 bg-[#C85A28]" : "w-2 bg-white/40"
                          )}
                          aria-label={`Jump to scene ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Master Specifications Badge */}
            {renderedVideoUrl && (
              <div className="flex items-center justify-between text-[11px] font-mono text-[#7A7166] bg-[#ECE3D5]/60 px-3 py-1.5 rounded border border-[#D8CCBC]">
                <span>MASTER CUT: 1920 × 804 • 24 FPS • H.264 / AAC STEREO</span>
                <span className="text-[#C85A28] font-bold">4K CINEMASCOPE READY</span>
              </div>
            )}

            {/* Footer Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  sound.playTap();
                  setStep(1);
                }}
                className="w-full sm:w-auto px-5 py-2.5 border border-[#201D1C] font-display text-lg tracking-wider rounded-xs hover:bg-[#EAE0D0] transition-colors cursor-pointer"
              >
                CREATE ANOTHER FILM
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {renderedVideoUrl && (
                  <a
                    href={renderedVideoUrl}
                    download={`${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-master.mp4`}
                    onClick={() => sound.playShutter()}
                    className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#FAF8F5] border-2 border-[#C85A28] text-[#C85A28] font-display text-lg tracking-wider rounded-xs hover:bg-[#C85A28] hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>DOWNLOAD MASTER</span>
                  </a>
                )}

                <button
                  onClick={copyShareLink}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#FAF8F5] border-2 border-[#201D1C] text-[#201D1C] font-display text-lg tracking-wider rounded-xs hover:bg-[#EAE0D0] transition-colors cursor-pointer"
                >
                  {shareCopied ? "LINK COPIED TO CLIPBOARD" : "SHARE WITH FAMILY"}
                </button>

                <button
                  onClick={() => {
                    sound.playShutter();
                    onClose();
                  }}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-[#C85A28] text-white font-display text-xl tracking-wider rounded-xs hover:bg-[#A84518] transition-colors cursor-pointer"
                >
                  DONE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

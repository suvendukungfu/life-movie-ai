"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PaperBackground } from "@/components/paper/PaperBackground";
import { FilmGrain } from "@/components/paper/FilmGrain";
import { Navbar } from "@/components/navigation/Navbar";
import { Tape } from "@/components/ui/Tape";
import { sound } from "@/lib/audio-synth";
import { MovieProject, MovieScene } from "@/lib/types/domain";
import { projectRepository } from "@/lib/storage/project-repository";
import { Play, Pause, Share2, Clapperboard, Film, ArrowLeft } from "lucide-react";
import { MakeMovieExperienceModal } from "@/components/modal/MakeMovieExperienceModal";
import { cn } from "@/lib/utils";

export default function PublicFilmScreeningRoom() {
  const params = useParams();
  const filmId = (params?.id as string) || "";
  const [project, setProject] = useState<MovieProject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSceneIdx, setCurrentSceneIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMakeMovieOpen, setIsMakeMovieOpen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (!filmId) return;
    fetch(`/api/public/film/${filmId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.film) {
          setProject(data.film);
          setLoading(false);
        } else {
          projectRepository.getByPublicShareId(filmId).then((res) => {
            setProject(res);
            setLoading(false);
          });
        }
      })
      .catch(() => {
        projectRepository.getByPublicShareId(filmId).then((res) => {
          setProject(res);
          setLoading(false);
        });
      });
  }, [filmId]);

  // Handle Playback Interval
  useEffect(() => {
    let timer: NodeJS.Timeout | number | undefined;
    const scenes = project?.scenes || [];
    if (isPlaying && scenes.length > 0) {
      sound.startProjectorGate();
      timer = setInterval(() => {
        setCurrentSceneIdx((prev) => {
          if (prev >= scenes.length - 1) {
            setIsPlaying(false);
            sound.stopProjectorGate();
            return 0;
          }
          sound.playShutter();
          return prev + 1;
        });
      }, 4500);
    } else {
      sound.stopProjectorGate();
    }
    return () => {
      clearInterval(timer);
      sound.stopProjectorGate();
    };
  }, [isPlaying, project?.scenes]);

  const handleShare = () => {
    sound.playTap();
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const scenes = project?.scenes || [];
  const currentScene: MovieScene | undefined = scenes[currentSceneIdx] || scenes[0];

  return (
    <main className="relative min-h-screen w-full bg-[#F5EFEB] overflow-x-hidden text-[#201D1C]">
      <PaperBackground />
      <FilmGrain />
      <Navbar onOpenMakeMovie={() => setIsMakeMovieOpen(true)} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        {/* Navigation back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/films"
            className="inline-flex items-center gap-1.5 font-typewriter text-xs text-[#7A7166] hover:text-[#C85A28] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO ARCHIVE VAULT</span>
          </Link>

          <button
            onClick={handleShare}
            className="px-3.5 py-1.5 bg-[#FAF8F5] border border-[#201D1C] font-typewriter text-xs tracking-wider rounded-xs hover:bg-[#EAE0D0] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#C85A28]" />
            <span>{copied ? "LINK COPIED!" : "SHARE SCREENING ROOM"}</span>
          </button>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-[#C85A28] border-t-transparent animate-spin mx-auto mb-4" />
            <p className="font-typewriter text-xs uppercase tracking-widest text-[#7A7166]">
              LOADING 35MM ARCHIVAL REEL...
            </p>
          </div>
        ) : !project ? (
          <div className="bg-[#FAF8F5] p-12 text-center rounded-xs border border-[#201D1C] photo-shadow max-w-xl mx-auto">
            <Film className="w-12 h-12 text-[#C85A28] mx-auto mb-3" />
            <h2 className="font-display text-4xl text-[#201D1C] uppercase mb-2">
              FILM NOT FOUND
            </h2>
            <p className="font-hand text-2xl text-[#5C5349] mb-6">
              This reel might be private or has been moved from the vault.
            </p>
            <Link
              href="/films"
              className="px-6 py-3 bg-[#201D1C] text-white font-display text-xl rounded-xs hover:bg-[#C85A28] transition-colors inline-block"
            >
              BROWSE ARCHIVE
            </Link>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Header Poster Card */}
            <div className="bg-[#FAF8F5] p-6 sm:p-10 rounded-xs photo-shadow border border-[#E0D8CE] relative">
              {/* Tape */}
              <div className="absolute -top-3 left-12 pointer-events-none">
                <Tape variant="amber" rotation={-1.5} />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#201D1C]/20 pb-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 font-typewriter text-[11px] text-[#C85A28] font-bold uppercase tracking-widest mb-1">
                    <span>{project.category?.title} CHRONICLE</span>
                    <span>•</span>
                    <span>DIRECTED IN {project.style?.name} STYLE</span>
                  </div>
                  <h1 className="font-display text-5xl sm:text-7xl text-[#201D1C] uppercase leading-none">
                    {project.title}
                  </h1>
                </div>

                <div className="shrink-0 bg-[#201D1C] text-[#FAF8F5] font-typewriter text-[11px] px-3 py-1 rounded-xs uppercase tracking-wider">
                  2.39:1 CINEMASCOPE • MASTER CUT
                </div>
              </div>

              <p className="font-serif italic text-xl sm:text-2xl text-[#5C5349] mb-6 max-w-3xl">
                &ldquo;{project.description || project.storyOutline?.logline}&rdquo;
              </p>

              {/* 2.39:1 Anamorphic Cinema Player Box */}
              <div className="relative w-full aspect-21/9 bg-black rounded-xs overflow-hidden photo-shadow-deep border-2 border-[#201D1C] flex flex-col justify-between mb-4">
                {project.outputVideoUrl ? (
                  <video
                    src={project.outputVideoUrl}
                    poster={project.posterUrl || undefined}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {currentScene && (
                      <Image
                        src={currentScene.mediaUrl}
                        alt={currentScene.title}
                        fill
                        className="object-cover contrast-105"
                        style={{ filter: project.style?.colorGrade }}
                      />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/85 via-transparent to-black/35" />

                    {/* Top Info */}
                    <div className="relative z-20 flex justify-between items-center p-3 sm:p-4 text-white/80 font-typewriter text-[10px] sm:text-xs uppercase">
                      <span>{project.title}</span>
                      <span>SCENE {currentSceneIdx + 1} OF {scenes.length || 1}</span>
                    </div>

                    {/* Center Play Button */}
                    <div className="relative z-20 self-center flex flex-col items-center">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C85A28] text-white flex items-center justify-center photo-shadow-deep hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-2xl"
                        aria-label={isPlaying ? "Pause screening" : "Play screening"}
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8 fill-current" />
                        ) : (
                          <Play className="w-8 h-8 fill-current translate-x-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Subtitle & Scrubber */}
                    <div className="relative z-20 p-4 sm:p-6 text-center">
                      {currentScene && (
                        <p className="font-hand text-2xl sm:text-3xl text-white drop-shadow-lg">
                          &ldquo;{currentScene.subtitle}&rdquo;
                        </p>
                      )}

                      <div className="flex justify-center items-center gap-2 mt-3">
                        {scenes.map((s, idx) => (
                          <button
                            key={s.id}
                            onClick={() => {
                              sound.playTap();
                              setCurrentSceneIdx(idx);
                            }}
                            className={cn(
                              "h-2 rounded-full transition-all cursor-pointer",
                              currentSceneIdx === idx ? "w-10 bg-[#C85A28]" : "w-3 bg-white/40"
                            )}
                            aria-label={`Jump to scene ${idx + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Master Specifications Badge & Download */}
              {project.outputVideoUrl && (
                <div className="flex items-center justify-between text-xs font-mono text-[#7A7166] bg-[#ECE3D5]/60 px-4 py-2 rounded border border-[#D8CCBC] mb-4">
                  <span>MASTER CUT: 1920 × 804 • 24 FPS • H.264 / AAC</span>
                  <a
                    href={project.outputVideoUrl}
                    download={`${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-master.mp4`}
                    className="text-[#C85A28] font-bold hover:underline"
                  >
                    DOWNLOAD MASTER MP4
                  </a>
                </div>
              )}

              {/* Bottom Film Director Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#E3DAD0]">
                <div>
                  <span className="font-typewriter text-[10px] text-[#7A7166] uppercase block">
                    DIRECTOR AESTHETIC
                  </span>
                  <span className="font-display text-xl text-[#201D1C]">
                    {project.style?.name}
                  </span>
                </div>
                <div>
                  <span className="font-typewriter text-[10px] text-[#7A7166] uppercase block">
                    SOUNDTRACK TONE
                  </span>
                  <span className="font-display text-xl text-[#201D1C]">
                    {project.style?.soundtrackMood || "Cinematic Strings"}
                  </span>
                </div>
                <div>
                  <span className="font-typewriter text-[10px] text-[#7A7166] uppercase block">
                    PRESERVED ARCHIVE
                  </span>
                  <span className="font-display text-xl text-[#201D1C]">
                    {project.memories?.length || 3} Captured Reels
                  </span>
                </div>
              </div>
            </div>

            {/* 5-Act Screenplay Breakdown */}
            {project.storyOutline && (
              <div className="bg-[#FAF8F5] p-6 sm:p-8 rounded-xs photo-shadow border border-[#E0D8CE] space-y-4">
                <div className="flex items-center gap-2 border-b border-[#201D1C]/20 pb-3">
                  <Clapperboard className="w-5 h-5 text-[#C85A28]" />
                  <h3 className="font-display text-2xl sm:text-3xl text-[#201D1C] uppercase">
                    5-ACT SCREENPLAY STRUCTURE
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {project.storyOutline.actStructure.map((act) => (
                    <div
                      key={act.id}
                      className="bg-[#F5EFEB] p-4 rounded-xs border border-[#DDD3C6]"
                    >
                      <span className="font-typewriter text-[10px] text-[#C85A28] uppercase font-bold block mb-1">
                        ACT {act.chapterNumber} • {act.targetTone}
                      </span>
                      <h4 className="font-display text-xl text-[#201D1C] uppercase mb-1">
                        {act.title}
                      </h4>
                      <p className="font-hand text-lg text-[#5C5349]">
                        &ldquo;{act.handwrittenBeat}&rdquo;
                      </p>
                      <p className="text-xs text-neutral-600 mt-2">
                        {act.synopsis}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call To Action Box */}
            <div className="bg-[#201D1C] text-[#FAF8F5] p-8 sm:p-12 text-center rounded-xs photo-shadow-deep space-y-4">
              <span className="font-typewriter text-xs text-[#EAA846] uppercase tracking-widest font-bold block">
                YOUR LIFE • YOUR STORY • YOUR MOVIE
              </span>
              <h3 className="font-display text-4xl sm:text-6xl uppercase leading-none">
                CREATE YOUR OWN CINEMATIC FILM
              </h3>
              <p className="font-hand text-2xl sm:text-3xl text-[#E0D5C5] max-w-xl mx-auto">
                Transform your raw photos, voice memos, and moments into an archival movie in 3 minutes.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => {
                    sound.playShutter();
                    setIsMakeMovieOpen(true);
                  }}
                  className="px-8 py-4 bg-[#C85A28] text-white font-display text-2xl tracking-wider rounded-xs hover:bg-[#A84518] hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-xl"
                >
                  START MAKING MY MOVIE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <MakeMovieExperienceModal
        isOpen={isMakeMovieOpen}
        onClose={() => setIsMakeMovieOpen(false)}
      />
    </main>
  );
}

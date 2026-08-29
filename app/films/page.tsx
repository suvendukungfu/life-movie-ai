"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PaperBackground } from "@/components/paper/PaperBackground";
import { FilmGrain } from "@/components/paper/FilmGrain";
import { Navbar } from "@/components/navigation/Navbar";
import { Tape } from "@/components/ui/Tape";
import { sound } from "@/lib/audio-synth";
import { MovieProject } from "@/lib/types/domain";
import { projectRepository } from "@/lib/storage/project-repository";
import { Film, Play, Plus, Share2, Trash2, Calendar, Sparkles } from "lucide-react";
import { MakeMovieExperienceModal } from "@/components/modal/MakeMovieExperienceModal";

export default function MyFilmsPage() {
  const [projects, setProjects] = useState<MovieProject[]>([]);
  const [isMakeMovieOpen, setIsMakeMovieOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        } else {
          projectRepository.getAll().then((list) => setProjects(list));
        }
      })
      .catch(() => {
        projectRepository.getAll().then((list) => setProjects(list));
      });
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playTap();
    if (confirm("Are you sure you want to remove this archival film from your collection?")) {
      await projectRepository.delete(id);
      const updated = await projectRepository.getAll();
      setProjects(updated);
    }
  };

  const handleShare = (project: MovieProject, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playTap();
    const url = `${window.location.origin}/film/${project.publicShareId || project.id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(project.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <main className="relative min-h-screen w-full bg-[#F5EFEB] overflow-x-hidden text-[#201D1C]">
      <PaperBackground />
      <FilmGrain />
      <Navbar onOpenMakeMovie={() => setIsMakeMovieOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-24">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#201D1C]/20 pb-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 font-typewriter text-xs text-[#C85A28] font-bold uppercase tracking-widest mb-2">
              <Film className="w-4 h-4" />
              <span>THE ARCHIVE ROOM • PRIVATE VAULT</span>
            </div>
            <h1 className="font-display text-5xl sm:text-7xl text-[#201D1C] uppercase leading-none">
              MY FILMS
            </h1>
            <p className="font-hand text-2xl sm:text-3xl text-[#5C5349] mt-1">
              Your preserved life chronicles, master cuts, and reel archives.
            </p>
          </div>

          <button
            onClick={() => {
              sound.playShutter();
              setIsMakeMovieOpen(true);
            }}
            className="group px-6 py-3.5 bg-[#201D1C] text-[#FAF8F5] font-display text-xl tracking-wider rounded-xs hover:bg-[#C85A28] transition-colors flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span>CREATE NEW MOVIE</span>
          </button>
        </div>

        {/* Films Archive Grid */}
        {projects.length === 0 ? (
          <div className="bg-[#FAF8F5] p-12 text-center rounded-xs border-2 border-dashed border-[#201D1C]/30 photo-shadow max-w-xl mx-auto my-12">
            <Film className="w-12 h-12 text-[#C85A28] mx-auto mb-3" />
            <h3 className="font-display text-3xl text-[#201D1C] uppercase mb-1">
              NO FILMS IN VAULT YET
            </h3>
            <p className="font-hand text-2xl text-[#5C5349] mb-6">
              Drop your first photographs and let the director begin.
            </p>
            <button
              onClick={() => setIsMakeMovieOpen(true)}
              className="px-6 py-3 bg-[#C85A28] text-white font-display text-xl rounded-xs hover:bg-[#A84518] transition-colors cursor-pointer"
            >
              START FIRST FILM
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, idx) => {
              const coverImage =
                project.memories?.[0]?.url ||
                "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1200&auto=format&fit=crop";

              return (
                <div
                  key={project.id}
                  className="group relative bg-[#FAF8F5] p-4 pb-6 rounded-xs photo-shadow border border-[#E0D7CC] transition-all duration-300 hover:photo-shadow-deep hover:-translate-y-1 flex flex-col justify-between"
                >
                  {/* Tape */}
                  <div className="absolute -top-3 left-8 z-20 pointer-events-none">
                    <Tape
                      variant={idx % 2 === 0 ? "neutral" : "amber"}
                      rotation={idx % 2 === 0 ? -2 : 2.5}
                    />
                  </div>

                  <div>
                    {/* Poster Viewport */}
                    <Link
                      href={`/film/${project.publicShareId || project.id}`}
                      className="block relative w-full aspect-16/10 bg-neutral-900 rounded-xs overflow-hidden mb-4 group-hover:scale-[1.01] transition-transform"
                    >
                      <Image
                        src={coverImage}
                        alt={project.title}
                        fill
                        className="object-cover contrast-105"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#C85A28] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        </div>
                      </div>

                      <div className="absolute top-2 left-2 font-typewriter text-[9px] text-white bg-black/60 px-1.5 py-0.5 rounded-xs uppercase">
                        {project.style?.name || "CINEMA"}
                      </div>
                    </Link>

                    {/* Metadata & Title */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-typewriter text-[10px] text-[#C85A28] font-bold uppercase tracking-wider">
                          {project.category?.title || "CHRONICLE"} • {project.memories?.length || 3} REEL ITEMS
                        </span>
                        <span className="font-typewriter text-[10px] text-neutral-400 flex items-center gap-1">
                          <Calendar className="w-2.5 h-2.5" />
                          {new Date(project.createdAt).getFullYear()}
                        </span>
                      </div>

                      <Link href={`/film/${project.publicShareId || project.id}`}>
                        <h2 className="font-display text-3xl text-[#201D1C] uppercase leading-none hover:text-[#C85A28] transition-colors">
                          {project.title}
                        </h2>
                      </Link>

                      <p className="font-hand text-lg text-[#5C5349] line-clamp-2 mt-1">
                        {project.description || project.storyOutline?.logline || "Preserved memories transformed into an archival film."}
                      </p>
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E3DAD0]">
                    <button
                      onClick={(e) => handleShare(project, e)}
                      className="px-3 py-1.5 bg-[#F0E8DC] hover:bg-[#E2D6C6] font-typewriter text-xs rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-[#C85A28]" />
                      <span>{copiedId === project.id ? "LINK COPIED!" : "SHARE"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/film/${project.publicShareId || project.id}`}
                        className="px-4 py-1.5 bg-[#201D1C] text-white hover:bg-[#C85A28] font-display text-sm tracking-wider rounded-xs transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>SCREEN FILM</span>
                      </Link>

                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="p-1.5 text-neutral-400 hover:text-red-700 transition-colors cursor-pointer"
                        aria-label="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <MakeMovieExperienceModal
        isOpen={isMakeMovieOpen}
        onClose={() => {
          setIsMakeMovieOpen(false);
          projectRepository.getAll().then((list) => setProjects(list));
        }}
      />
    </main>
  );
}

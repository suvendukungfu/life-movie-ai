"use client";

import React, { useState } from "react";
import { Stamp } from "@/components/ui/Stamp";
import { Tape } from "@/components/ui/Tape";
import { sound } from "@/lib/audio-synth";
import { Image as ImageIcon, Video, Mic, Heart, Users, Sparkles, Film } from "lucide-react";
import { cn } from "@/lib/utils";

const INPUT_FRAGMENTS = [
  { id: "photos", label: "PHOTOS", desc: "4,200 candid camera roll frames", icon: ImageIcon, color: "#C85A28", rotation: -2 },
  { id: "videos", label: "VIDEOS", desc: "10-second shaky concert clips & laughter", icon: Video, color: "#3B6E58", rotation: 2.5 },
  { id: "voice", label: "VOICE", desc: "WhatsApp voice notes & kitchen chatter", icon: Mic, color: "#8E5A8E", rotation: -1.5 },
  { id: "memories", label: "MEMORIES", desc: "Dates, flight numbers, ticket stubs", icon: Sparkles, color: "#D9822B", rotation: 2 },
  { id: "people", label: "PEOPLE", desc: "Relationships mapped across seasons", icon: Users, color: "#335C67", rotation: -2.5 },
  { id: "moments", label: "MOMENTS", desc: "The quiet pauses between big milestones", icon: Heart, color: "#D45D55", rotation: 1 },
];

export function MemoryConnector() {
  const [activeFragment, setActiveFragment] = useState<string>("photos");

  const handleSelect = (id: string) => {
    sound.playTap();
    setActiveFragment(id);
  };

  return (
    <section className="relative w-full py-20 sm:py-28 px-4 sm:px-8 bg-[#F0EAE1] select-none border-y border-[#DED4C5]">
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        {/* Header Badge */}
        <div className="mb-4">
          <Stamp text="STEP 02" subtext="MEDIA CONNECTOR" color="green" rotation={-1.5} />
        </div>

        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl text-[#1E1B1A] text-center uppercase tracking-tight mb-2">
          RAW MEMORIES IN. <br className="hidden sm:inline" />
          <span className="text-[#C85A28]">CINEMATIC NARRATIVE</span> OUT.
        </h2>
        <p className="font-hand text-2xl sm:text-3xl text-[#524B43] mt-3 text-center">
          not an automated slideshow. a carefully paced, scored, and color-graded movie.
        </p>
      </div>

      {/* Pinboard Canvas */}
      <div className="relative bg-[#FAF7F2] p-5 sm:p-10 rounded-[3px] photo-shadow-deep border border-[#E0D7CB] overflow-hidden">
        {/* Top washi tape */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Tape variant="terracotta" rotation={0.5} />
        </div>

        {/* 1. INPUT FRAGMENTS ROW */}
        <div className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-4 border-b border-[#E6DED2] pb-2">
            <span className="font-typewriter text-[11px] tracking-widest text-[#6E665E] uppercase">
              PHASE 01: RAW MEMORY INGESTION
            </span>
            <span className="font-hand text-lg sm:text-xl text-[#C85A28]">
              click each index card to inspect
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {INPUT_FRAGMENTS.map((frag) => {
              const Icon = frag.icon;
              const isSelected = activeFragment === frag.id;
              return (
                <button
                  key={frag.id}
                  onClick={() => handleSelect(frag.id)}
                  className={cn(
                    "relative p-3.5 sm:p-4 rounded-xs border transition-all duration-300 text-left cursor-pointer group flex flex-col justify-between h-34 sm:h-38 shadow-xs",
                    isSelected
                      ? "bg-[#1E1B1A] text-[#FAF7F2] border-[#1E1B1A] shadow-md -translate-y-1"
                      : "bg-[#F2ECE2] text-[#1E1B1A] border-[#DCD1C2] hover:bg-[#EAE1D2]"
                  )}
                  style={{
                    transform: isSelected ? "translateY(-4px) scale(1.02)" : `rotate(${frag.rotation}deg)`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <Icon
                      className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5",
                        isSelected ? "text-[#EAA846]" : "text-[#6E665E]"
                      )}
                    />
                    <span className="font-typewriter text-[9px] opacity-70 uppercase tracking-wider">
                      #{frag.id}
                    </span>
                  </div>

                  <div>
                    <span className="font-display text-xl sm:text-2xl block tracking-wide leading-none mb-1">
                      {frag.label}
                    </span>
                    <p className={cn(
                      "text-[10px] sm:text-[11px] leading-tight line-clamp-2",
                      isSelected ? "text-neutral-300" : "text-[#5C5349]"
                    )}>
                      {frag.desc}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#1E1B1A] rotate-45" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. THE STORYBOARD ASSEMBLY */}
        <div className="relative py-6 sm:py-8 px-4 sm:px-8 bg-[#EEE5D8] rounded-xs border border-[#D5C7B6] flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-10 sm:w-20 bg-[#C85A28]" />
            <span className="font-hand text-xl sm:text-2xl text-[#C85A28] font-bold">
              THE DIRECTOR&apos;S TREATMENT
            </span>
            <span className="h-px w-10 sm:w-20 bg-[#C85A28]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full max-w-4xl">
            {/* Step A */}
            <div className="bg-[#FAF7F2] p-5 rounded-xs border border-[#DCD2C3] rotate-1 shadow-xs">
              <span className="font-typewriter text-[10px] text-[#C85A28] font-bold tracking-widest block mb-1">
                STEP 01 — CHRONOLOGY
              </span>
              <h4 className="font-display text-2xl text-[#1E1B1A]">THE TIMELINE ARC</h4>
              <p className="font-serif-editorial text-sm text-[#524B43] mt-1">
                Discovers hidden emotional peaks, recurring faces, and milestone beats across years.
              </p>
            </div>

            {/* Step B */}
            <div className="bg-[#FAF7F2] p-5 rounded-xs border border-[#DCD2C3] -rotate-1 shadow-xs">
              <span className="font-typewriter text-[10px] text-[#C85A28] font-bold tracking-widest block mb-1">
                STEP 02 — SCORING
              </span>
              <h4 className="font-display text-2xl text-[#1E1B1A]">ANALOG SCORING</h4>
              <p className="font-serif-editorial text-sm text-[#524B43] mt-1">
                Harmonizes cut rhythms to original compositions tailored to your personal narrative tone.
              </p>
            </div>

            {/* Step C */}
            <div className="bg-[#FAF7F2] p-5 rounded-xs border border-[#DCD2C3] rotate-1.5 shadow-xs">
              <span className="font-typewriter text-[10px] text-[#C85A28] font-bold tracking-widest block mb-1">
                STEP 03 — MASTERING
              </span>
              <h4 className="font-display text-2xl text-[#1E1B1A]">35MM FINISHING</h4>
              <p className="font-serif-editorial text-sm text-[#524B43] mt-1">
                Applies custom film grain, authentic title cards, letterboxing, and seamless cross-fades.
              </p>
            </div>
          </div>

          {/* Final Output Hero Card */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-6 w-full max-w-3xl bg-[#1E1B1A] text-[#FAF7F2] p-6 sm:p-8 rounded-xs shadow-xl">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Film className="w-5 h-5 text-[#EAA846]" />
                <span className="font-typewriter text-xs text-[#EAA846] uppercase tracking-widest">
                  FINAL RESULT
                </span>
              </div>
              <h3 className="font-display text-3xl sm:text-5xl tracking-wide">
                YOUR LIFE. YOUR MOVIE.
              </h3>
              <p className="font-hand text-xl sm:text-2xl text-neutral-300 mt-1">
                A 20-minute mastercut you will keep for the rest of your life.
              </p>
            </div>

            <Stamp text="READY" subtext="4K CINEMA" color="terracotta" rotation={-3} className="bg-white/10 text-[#EAA846] border-[#EAA846]" />
          </div>
        </div>
      </div>
    </section>
  );
}


"use client";

import React, { useState } from "react";
import Image from "next/image";
import { TIMELINE_CHAPTERS } from "@/lib/sample-data";
import { Stamp } from "@/components/ui/Stamp";
import { Tape } from "@/components/ui/Tape";
import { sound } from "@/lib/audio-synth";
import { Clock, Disc } from "lucide-react";
import { cn } from "@/lib/utils";

export function StoryTimeline() {
  const [activeYear, setActiveYear] = useState<string>("2019");

  const handleYearClick = (year: string) => {
    setActiveYear(year);
    sound.playTap();
  };

  const selectedItem = TIMELINE_CHAPTERS.find((c) => c.year === activeYear) || TIMELINE_CHAPTERS[0];

  return (
    <section id="timeline" className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Stamp text="TIMELINE" subtext="CHRONOLOGICAL BEATS" color="charcoal" rotation={2} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl text-[#201D1C] leading-[0.88] uppercase">
            THE CHRONICLE <br />
            <span className="text-[#C85A28]">2019 — 2026</span>
          </h2>
          <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#5C5349] mt-3 max-w-xl">
            Watch how seven years of raw memories weave seamlessly into a five-act feature film.
          </p>
        </div>
      </div>

      {/* Horizontal Timeline Scrubber / Year selector */}
      <div className="relative mb-12 bg-[#FAF6F0] p-4 sm:p-6 rounded-sm photo-shadow border border-[#E0D7CB]">
        <div className="flex items-center justify-between overflow-x-auto pb-2 gap-4">
          {TIMELINE_CHAPTERS.map((item) => {
            const isActive = activeYear === item.year;
            return (
              <button
                key={item.year}
                onClick={() => handleYearClick(item.year)}
                className={cn(
                  "flex-1 min-w-30 p-3 rounded-xs text-left transition-all duration-200 border cursor-pointer relative",
                  isActive
                    ? "bg-[#201D1C] text-[#FAF8F5] border-[#201D1C] shadow-md -translate-y-1"
                    : "bg-[#F0E8DC] text-[#201D1C] border-[#DDD0C0] hover:bg-[#EAE0D0]"
                )}
              >
                <span className="font-typewriter text-[10px] opacity-75 uppercase block mb-1">
                  {item.chapter}
                </span>
                <span className="font-display text-3xl block leading-none">
                  {item.year}
                </span>
                <span className={cn(
                  "font-hand text-base block mt-1 line-clamp-1",
                  isActive ? "text-[#EAA846]" : "text-[#C85A28]"
                )}>
                  &ldquo;{item.handwritten}&rdquo;
                </span>

                {isActive && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#201D1C] rotate-45" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Timeline Scene Display */}
      <div className="relative bg-[#FAF8F5] p-6 sm:p-10 rounded-[3px] photo-shadow-deep border border-[#DDD4C6]">
        {/* Top Tape */}
        <div className="absolute -top-3 left-10">
          <Tape variant="amber" rotation={-1.5} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Photo Preview Column */}
          <div className="lg:col-span-7 relative">
            <div className="relative w-full aspect-16/10 bg-neutral-900 rounded-xs overflow-hidden photo-shadow">
              <Image
                src={selectedItem.photo}
                alt={selectedItem.title}
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover"
              />
              <div className="absolute top-3 left-3 bg-black/60 text-white font-typewriter text-[9px] px-2 py-0.5 uppercase tracking-widest">
                SCENE REEL // {selectedItem.year}
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-typewriter text-xs text-[#C85A28] font-bold uppercase tracking-widest">
                  {selectedItem.chapter} • {selectedItem.year}
                </span>
              </div>

              <h3 className="font-display text-4xl sm:text-5xl text-[#201D1C] uppercase leading-tight mb-2">
                {selectedItem.title}
              </h3>

              <p className="font-hand text-2xl text-[#C85A28] font-semibold mb-4">
                &ldquo;{selectedItem.handwritten}&rdquo;
              </p>

              <p className="font-serif-editorial text-base sm:text-lg text-[#5C5349] leading-relaxed">
                {selectedItem.description}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-[#E8DFD3] grid grid-cols-2 gap-4 font-typewriter text-[11px] text-[#7A7166]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C85A28]" />
                <span>{selectedItem.duration}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Disc className="w-3.5 h-3.5 text-[#C85A28]" />
                <span>{selectedItem.bpm}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

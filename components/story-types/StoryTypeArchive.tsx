"use client";

import React, { useState } from "react";
import Image from "next/image";
import { STORY_CATEGORIES, StoryCategory } from "@/lib/sample-data";
import { Stamp } from "@/components/ui/Stamp";
import { Tape } from "@/components/ui/Tape";
import { sound } from "@/lib/audio-synth";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoryTypeArchiveProps {
  onSelectCategory: (cat: StoryCategory) => void;
}

export function StoryTypeArchive({ onSelectCategory }: StoryTypeArchiveProps) {
  const [activeCategory, setActiveCategory] = useState<StoryCategory>(STORY_CATEGORIES[0]);

  const handleHover = (cat: StoryCategory) => {
    setActiveCategory(cat);
    sound.playTap();
  };

  return (
    <section id="stories" className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto select-none">
      {/* Stamp & Section Headline */}
      <div className="flex items-center gap-4 mb-4">
        <Stamp text="ARCHIVE" subtext="9 STORY ARCS" color="charcoal" rotation={2} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl text-[#201D1C] leading-[0.88] uppercase">
            WHAT STORY <br />
            <span className="text-[#C85A28]">ARE WE TELLING?</span>
          </h2>
          <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#5C5349] mt-3 max-w-xl">
            Choose the chapter of your life you want immortalized on the silver screen.
          </p>
        </div>

        {/* Live quote preview for currently active item */}
        <div className="bg-[#FAF8F5] p-5 rounded-xs border border-[#DFD6C8] photo-shadow max-w-sm rotate-1 transition-all duration-300">
          <span className="font-typewriter text-[10px] text-[#C85A28] tracking-widest uppercase block mb-1">
            SELECTED GENRE: {activeCategory.title}
          </span>
          <p className="font-hand text-2xl text-[#201D1C] leading-snug">
            &ldquo;{activeCategory.quote}&rdquo;
          </p>
          <span className="font-typewriter text-[10px] text-[#7A7166] block mt-2">
            ARCHIVE NO: #{activeCategory.id.toUpperCase()}-2026
          </span>
        </div>
      </div>

      {/* Poster Wall / Contact Sheet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {STORY_CATEGORIES.map((cat, idx) => {
          const isSelected = activeCategory.id === cat.id;
          const rotation = idx % 3 === 0 ? -1.5 : idx % 3 === 1 ? 1.5 : -0.8;
          return (
            <div
              key={cat.id}
              role="button"
              tabIndex={0}
              onMouseEnter={() => handleHover(cat)}
              onClick={() => {
                sound.playShutter();
                onSelectCategory(cat);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  sound.playShutter();
                  onSelectCategory(cat);
                }
              }}
              className={cn(
                "group relative bg-[#FAF8F5] p-3.5 pb-5 rounded-xs photo-shadow border border-[#E3DBD0] transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C85A28]",
                isSelected
                  ? "photo-shadow-deep border-[#C85A28] -translate-y-2 scale-[1.02] z-20"
                  : "hover:border-[#201D1C] hover:-translate-y-1 hover:z-10"
              )}
              style={{
                transform: isSelected ? "translateY(-8px) scale(1.02)" : `rotate(${rotation}deg)`,
              }}
            >
              {/* Top corner tape */}
              <div className="absolute -top-3 left-6 z-30">
                <Tape
                  variant={idx % 2 === 0 ? "neutral" : "amber"}
                  rotation={idx % 2 === 0 ? -3 : 2}
                  className="w-16 h-5"
                />
              </div>

              {/* Poster Image Container */}
              <div className="relative w-full aspect-4/3 bg-neutral-900 rounded-[1px] overflow-hidden">
                <Image
                  src={cat.posterImage}
                  alt={cat.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105 filter contrast-105"
                />
                
                {/* Vintage overlay banner */}
                <div className="absolute top-2 right-2 bg-[#201D1C]/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-xs font-typewriter text-[9px] tracking-wider uppercase">
                  {cat.tag}
                </div>

                {/* Hover button */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-[#FAF8F5] text-[#201D1C] px-4 py-1.5 rounded-full font-display text-sm flex items-center gap-1">
                    <span>SELECT MOVIE</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Title & Handwritten Sub-note */}
              <div className="mt-3.5 px-1 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-3xl text-[#201D1C] tracking-wide group-hover:text-[#C85A28] transition-colors">
                    {cat.title}
                  </h3>
                  <span className="font-typewriter text-[10px] text-[#7A7166]">
                    0{idx + 1}
                  </span>
                </div>
                <p className="font-hand text-xl text-[#5C5349] leading-snug mt-1">
                  &ldquo;{cat.handwrittenSub}&rdquo;
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

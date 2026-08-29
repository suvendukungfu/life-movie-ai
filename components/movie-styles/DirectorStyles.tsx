"use client";

import React, { useState } from "react";
import Image from "next/image";
import { DIRECTOR_STYLES, DirectorStyle } from "@/lib/sample-data";
import { Stamp } from "@/components/ui/Stamp";
import { Tape } from "@/components/ui/Tape";
import { sound } from "@/lib/audio-synth";
import { HandDrawnClapperboard, ScribbleUnderline } from "@/components/paper/Doodles";
import { Music, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DirectorStylesProps {
  onSelectStyle: (style: DirectorStyle) => void;
}

export function DirectorStyles({ onSelectStyle }: DirectorStylesProps) {
  const [selectedStyle, setSelectedStyle] = useState<DirectorStyle>(DIRECTOR_STYLES[0]);

  const handleSelect = (style: DirectorStyle) => {
    setSelectedStyle(style);
    sound.playTap();
    if (style.id === "nostalgia") {
      sound.startProjector();
    } else {
      sound.stopProjector();
    }
  };

  return (
    <section id="directors" className="relative min-h-[90vh] sm:min-h-screen py-20 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto select-none">
      {/* Stamp & Header */}
      <div className="flex items-center gap-4 mb-4">
        <Stamp text="DIRECTOR'S ROOM" subtext="VISION & TONE" color="terracotta" rotation={-2} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 sm:mb-16">
        <div>
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl text-[#1E1B1A] leading-[0.88] uppercase">
            CHOOSE YOUR <br />
            <span className="text-[#C85A28]">DIRECTOR.</span>
          </h2>
          <div className="mt-2">
            <ScribbleUnderline className="w-56 h-6 text-[#C85A28]" />
          </div>
          <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#524B43] mt-3">
            Every memory is shaped by the lens that looks at it. Who will direct yours?
          </p>
        </div>

        <div className="flex items-center gap-3 bg-[#FAF7F2] px-4 py-2 rounded-full border border-[#DCD1C2] self-start md:self-auto shadow-xs">
          <HandDrawnClapperboard className="w-5 h-5 text-[#C85A28]" />
          <span className="font-typewriter text-xs text-[#1E1B1A] uppercase tracking-wider">
            6 DISTINCT ART-DIRECTED TREATMENTS
          </span>
        </div>
      </div>

      {/* Main Interactive Studio Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Style Buttons List */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          {DIRECTOR_STYLES.map((style) => {
            const isCurrent = selectedStyle.id === style.id;
            return (
              <button
                key={style.id}
                onClick={() => handleSelect(style)}
                className={cn(
                  "p-4 sm:p-5 rounded-xs border text-left transition-all duration-200 cursor-pointer flex items-center justify-between group",
                  isCurrent
                    ? "bg-[#1E1B1A] text-[#FAF7F2] border-[#1E1B1A] photo-shadow-deep scale-[1.01]"
                    : "bg-[#FAF7F2] text-[#1E1B1A] border-[#DED4C6] hover:bg-[#F2EAE0] hover:border-[#1E1B1A]"
                )}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display text-3xl sm:text-4xl tracking-wider leading-none">
                      {style.name}
                    </span>
                    {isCurrent && (
                      <span className="w-2 h-2 rounded-full bg-[#EAA846] animate-pulse" />
                    )}
                  </div>
                  <p className={cn(
                    "font-hand text-xl sm:text-2xl",
                    isCurrent ? "text-[#EAA846]" : "text-[#C85A28]"
                  )}>
                    &ldquo;{style.note}&rdquo;
                  </p>
                  <p className={cn(
                    "text-xs mt-1 line-clamp-1",
                    isCurrent ? "text-neutral-300" : "text-[#6E665E]"
                  )}>
                    {style.tagline}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-typewriter text-[10px] uppercase px-2 py-0.5 rounded-xs border",
                    isCurrent
                      ? "border-[#EAA846] text-[#EAA846]"
                      : "border-[#C9BCAF] text-[#6E665E]"
                  )}>
                    {style.aspectRatio}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Dynamic Monitor with selected Treatment */}
        <div className="lg:col-span-7 sticky top-24">
          <div className="bg-[#FAF7F2] p-5 sm:p-7 rounded-xs photo-shadow-deep border border-[#DDD3C4] relative">
            {/* Top Tape */}
            <div className="absolute -top-3 right-8">
              <Tape variant="amber" rotation={1.5} />
            </div>

            {/* Monitor Bezel */}
            <div className="relative w-full aspect-21/9 bg-neutral-900 rounded-xs overflow-hidden photo-shadow-deep border-4 border-[#1E1B1A] flex flex-col justify-between p-3 sm:p-5">
              <Image
                src={selectedStyle.previewImage}
                alt={selectedStyle.name}
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                className="object-cover contrast-105"
                style={{ filter: selectedStyle.colorGrade }}
              />

              {/* Viewfinder HUD Overlays */}
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-2 font-typewriter text-[9px] sm:text-[10px] text-white/90 uppercase tracking-widest drop-shadow-md">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span>REC • 4K PRORES</span>
                </div>
                <div className="font-typewriter text-[9px] sm:text-[10px] text-white/90 uppercase tracking-widest drop-shadow-md">
                  RATIO: {selectedStyle.aspectRatio}
                </div>
              </div>

              {/* Center Crosshair and Frame markings */}
              <div className="relative z-10 flex justify-between items-end">
                <div className="flex justify-between font-typewriter text-[9px] sm:text-[10px] text-white/90 uppercase tracking-widest drop-shadow-md">
                  <span>ISO 800 • 50MM F/1.4</span>
                </div>
                <div className="text-center font-typewriter text-[9px] sm:text-[10px] text-white/80 uppercase tracking-widest drop-shadow-md">
                  + 35MM FRAME ALIGNED +
                </div>
                <div className="flex justify-between font-typewriter text-[9px] sm:text-[10px] text-white/90 uppercase tracking-widest drop-shadow-md">
                  <span>24 FPS CINEMA</span>
                  <span>LUT: {selectedStyle.name}</span>
                </div>
              </div>

              {/* Center Logline Overlay */}
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 bg-black/75 backdrop-blur-xs p-3.5 sm:p-4 rounded-xs border-l-4 border-[#C85A28]">
                <p className="font-serif-editorial italic text-sm sm:text-lg text-white leading-snug">
                  &ldquo;{selectedStyle.sampleLogline}&rdquo;
                </p>
              </div>
            </div>

            {/* Soundtrack & Treatment Breakdown */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#EAE2D7]">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-typewriter text-[#6E665E] uppercase mb-1">
                  <Music className="w-3.5 h-3.5 text-[#C85A28]" />
                  <span>ORIGINAL SCORE MOOD</span>
                </div>
                <p className="font-serif-editorial text-sm text-[#1E1B1A]">
                  {selectedStyle.soundtrackMood}
                </p>
              </div>

              <div className="flex flex-col justify-end items-start sm:items-end">
                <button
                  onClick={() => {
                    sound.playShutter();
                    onSelectStyle(selectedStyle);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#C85A28] text-white font-display text-lg tracking-wider rounded-xs hover:bg-[#A84518] transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>APPLY THIS DIRECTOR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


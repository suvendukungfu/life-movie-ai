"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Tape } from "@/components/ui/Tape";
import { Stamp } from "@/components/ui/Stamp";
import { HandDrawnStar } from "@/components/paper/Doodles";

export function ChapterOne() {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  return (
    <section
      ref={sectionRef}
      id="chapters"
      className="relative min-h-[90vh] sm:min-h-screen py-20 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-center select-none"
    >
      {/* Chapter Index Stamp */}
      <div className="flex items-center gap-4 mb-6">
        <Stamp text="ACT I" subtext="SCENE 01" color="charcoal" rotation={-2} />
        <span className="font-typewriter text-[11px] text-[#6E665E] uppercase tracking-widest">
          THE ESTABLISHING SHOT
        </span>
      </div>

      {/* Chapter Headline */}
      <div className="mb-10 sm:mb-12 max-w-3xl">
        <h2 className="font-display text-4xl sm:text-6xl md:text-7xl text-[#1E1B1A] leading-[0.92] uppercase">
          IT STARTED WITH <br />
          <span className="text-[#C85A28]">A SINGLE MOMENT.</span>
        </h2>
        <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#524B43] mt-3">
          Before the chapters unfolded, there was just an ordinary afternoon that turned out to be the prologue.
        </p>
      </div>

      {/* Large Featured Physical Photograph on Paper */}
      <div className="relative mx-auto w-full max-w-4xl">
        {/* Authentic Jagged Torn Tape on Corners */}
        <div className="absolute -top-3 sm:-top-4 left-6 z-30">
          <Tape variant="amber" rotation={-4} />
        </div>
        <div className="absolute -top-3 sm:-top-4 right-8 z-30">
          <Tape variant="neutral" rotation={3} />
        </div>

        {/* Physical Print Card */}
        <div className="bg-[#FAF7F2] p-4 sm:p-7 rounded-[3px] photo-shadow-deep border border-[#E2DAD0] transform -rotate-0.5 hover:rotate-0 transition-transform duration-500">
          {/* Main 35mm Frame */}
          <div className="relative w-full aspect-16/10 sm:aspect-video bg-[#161413] rounded-xs overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1200&auto=format&fit=crop"
              alt="First day moment photograph"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover contrast-104 brightness-96"
            />
            {/* Film frame edge branding */}
            <div className="absolute top-3 left-4 font-typewriter text-[10px] text-white/80 tracking-widest uppercase bg-black/50 px-2 py-0.5 rounded-xs backdrop-blur-xs">
              PORTRA 400 — REEL #01 • FRAME 14A
            </div>

            {/* Handwritten overlay on photo */}
            <div className="absolute bottom-4 left-4 bg-black/65 backdrop-blur-xs px-3 py-1.5 rounded-xs border-l-2 border-[#C85A28]">
              <span className="font-hand text-xl sm:text-2xl text-[#FAF7F2]">
                &ldquo;first day in the new city.&rdquo;
              </span>
            </div>
          </div>

          {/* Bottom Handwritten Director Annotation */}
          <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#EAE2D8] pt-3">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-[#C85A28]" />
              <p className="font-hand text-xl sm:text-2xl text-[#1E1B1A]">
                September 14, 2019 • 5:42 PM • Platform 4
              </p>
            </div>
            <span className="font-typewriter text-[11px] text-[#6E665E] uppercase tracking-widest">
              DIRECTOR LOG: OPENING SCENE LOCKED
            </span>
          </div>
        </div>

        {/* Hand-drawn Star accent floating near photo */}
        <div className="absolute -bottom-6 -right-4 hidden sm:block">
          <HandDrawnStar className="w-10 h-10 text-[#C85A28] rotate-12" />
        </div>
      </div>
    </section>
  );
}


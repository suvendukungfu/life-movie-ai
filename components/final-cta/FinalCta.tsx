"use client";

import React from "react";
import { sound } from "@/lib/audio-synth";
import { HandDrawnSun, HandDrawnHeart, ScribbleUnderline } from "@/components/paper/Doodles";
import { Stamp } from "@/components/ui/Stamp";
import { ArrowRight, Clapperboard } from "lucide-react";

interface FinalCtaProps {
  onOpenMakeMovie: () => void;
}

export function FinalCta({ onOpenMakeMovie }: FinalCtaProps) {
  return (
    <section className="relative w-full py-28 sm:py-36 px-4 sm:px-8 bg-[#F5EFEB] select-none text-center flex flex-col items-center">
      {/* Hand-drawn Doodles */}
      <div className="absolute top-12 left-10 hidden sm:block pointer-events-none">
        <HandDrawnSun className="w-20 h-20 text-[#201D1C]/60 rotate-12" />
      </div>

      <div className="absolute top-20 right-14 hidden sm:block pointer-events-none">
        <HandDrawnHeart className="w-10 h-10 text-[#D45D55]/80 rotate-12" />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
        <div className="mb-6">
          <Stamp text="THE EPILOGUE" subtext="FINAL SCENE" color="terracotta" rotation={-2} />
        </div>

        <h2 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#201D1C] uppercase leading-[0.88] tracking-tight">
          SOME MEMORIES <br />
          <span className="text-[#C85A28]">DESERVE MORE</span> <br />
          THAN A CAMERA ROLL.
        </h2>

        <div className="my-2">
          <ScribbleUnderline className="w-64 sm:w-80 h-6 text-[#C85A28]" />
        </div>

        <p className="font-hand text-3xl sm:text-4xl md:text-5xl text-[#4A433B] font-medium mt-4 mb-10">
          &ldquo;they deserve a story.&rdquo;
        </p>

        {/* Primary CTA */}
        <button
          onClick={() => {
            sound.playShutter();
            onOpenMakeMovie();
          }}
          className="group px-8 sm:px-12 py-4 sm:py-5 bg-[#201D1C] text-[#FAF8F5] font-display text-2xl sm:text-3xl tracking-wider rounded-xs hover:bg-[#C85A28] hover:shadow-2xl active:scale-95 transition-all duration-300 flex items-center gap-3 cursor-pointer"
        >
          <Clapperboard className="w-6 h-6" />
          <span>MAKE YOUR MOVIE</span>
          <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1.5" />
        </button>

        {/* Footer info */}
        <div className="mt-20 pt-10 border-t border-[#DFD5C6] w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-typewriter text-[#7A7166] uppercase tracking-widest">
          <span>LIFE MOVIE © 2026</span>
          <span className="font-display text-lg tracking-widest text-[#201D1C]">
            YOUR STORY. YOUR MEMORIES. YOUR FILM.
          </span>
          <span>ANALOG SOUL • 35MM CINEMA</span>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  HandDrawnSun,
  HandDrawnStar,
  HandDrawnCurlyArrow,
  HandDrawnBasketball,
  HandDrawnPaperPlane,
  HandDrawnCamera,
  ScribbleUnderline,
  HandDrawnHeart,
} from "@/components/paper/Doodles";
import { sound } from "@/lib/audio-synth";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const emptySubscribe = () => () => {};

interface HeroProps {
  onOpenMakeMovie: () => void;
  onWatchSample: () => void;
}

export function Hero({ onOpenMakeMovie, onWatchSample }: HeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isTouch || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 12;
      targetY = (e.clientY / window.innerHeight - 0.5) * 12;
    };

    const updatePhysics = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      setMouseOffset({ x: Number(currentX.toFixed(2)), y: Number(currentY.toFixed(2)) });
      rafId = requestAnimationFrame(updatePhysics);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    rafId = requestAnimationFrame(updatePhysics);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[92vh] sm:min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden select-none"
    >
      {/* Hand-drawn Doodles matching the visual composition of the reference image */}
      
      {/* 1. Top Left: Hand-drawn Sun with rays */}
      <div
        className={cn(
          "absolute top-16 sm:top-24 left-3 sm:left-12 pointer-events-none transition-opacity duration-1000",
          mounted ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translate(${mouseOffset.x * -0.5}px, ${mouseOffset.y * -0.5}px) rotate(-6deg)`,
        }}
      >
        <HandDrawnSun className="w-18 h-18 sm:w-26 sm:h-26 text-[#1E1B1A]/85" />
        <span className="font-hand text-sm text-[#6E665E] -rotate-12 block mt-1">
          scene 01: dawn
        </span>
      </div>

      {/* 2. Top Right: Hand-drawn dashed swooping curly arrow */}
      <div
        className={cn(
          "absolute top-16 sm:top-24 right-3 sm:right-16 pointer-events-none transition-opacity duration-1000 delay-150",
          mounted ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translate(${mouseOffset.x * 0.7}px, ${mouseOffset.y * 0.7}px) rotate(4deg)`,
        }}
      >
        <HandDrawnCurlyArrow className="w-24 h-14 sm:w-40 sm:h-22 text-[#D9822B]" />
        <div className="absolute top-0 right-3">
          <HandDrawnStar className="w-5 h-5 text-[#1E1B1A]/75 rotate-12" />
        </div>
      </div>

      {/* 3. Mid Left: Paper Airplane */}
      <div
        className={cn(
          "hidden md:block absolute top-1/2 left-8 -translate-y-1/2 pointer-events-none transition-opacity duration-1000 delay-300",
          mounted ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translate(${mouseOffset.x * -0.3}px, ${mouseOffset.y * 0.4}px) rotate(-15deg)`,
        }}
      >
        <HandDrawnPaperPlane className="w-12 h-12 text-[#1E1B1A]/70" />
        <span className="font-hand text-base text-[#C85A28] block -rotate-6 mt-2">
          first flight →
        </span>
      </div>

      {/* 4. Mid Right: Basketball / scribble with motion lines */}
      <div
        className={cn(
          "hidden md:block absolute top-1/2 right-10 -translate-y-1/2 pointer-events-none transition-opacity duration-1000 delay-300",
          mounted ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * -0.3}px) rotate(8deg)`,
        }}
      >
        <HandDrawnBasketball className="w-14 h-14 text-[#1E1B1A]/75" />
        <span className="font-hand text-sm text-[#6E665E] block rotate-3 mt-1">
          summer court
        </span>
      </div>

      {/* 5. Bottom Left: Hand-drawn 35mm Camera & Star */}
      <div
        className={cn(
          "absolute bottom-14 sm:bottom-20 left-4 sm:left-18 pointer-events-none transition-opacity duration-1000 delay-500",
          mounted ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translate(${mouseOffset.x * -0.6}px, ${mouseOffset.y * -0.6}px) rotate(6deg)`,
        }}
      >
        <HandDrawnStar className="w-6 h-6 text-[#1E1B1A]/75 -rotate-12 mb-1" />
        <HandDrawnCamera className="w-14 h-14 text-[#1E1B1A]/80" />
      </div>

      {/* 6. Bottom Right: Heart & Star */}
      <div
        className={cn(
          "absolute bottom-14 sm:bottom-20 right-4 sm:right-20 pointer-events-none transition-opacity duration-1000 delay-500",
          mounted ? "opacity-100" : "opacity-0"
        )}
        style={{
          transform: `translate(${mouseOffset.x * 0.6}px, ${mouseOffset.y * 0.6}px) rotate(-10deg)`,
        }}
      >
        <HandDrawnHeart className="w-6 h-6 text-[#D45D55] rotate-12 mb-1" />
        <HandDrawnStar className="w-7 h-7 text-[#1E1B1A]/75 rotate-45" />
      </div>

      {/* CENTER HERO CONTENT */}
      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        
        {/* Small Handwritten Top Label */}
        <div className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1 bg-[#EBE2D4]/75 rounded-full border border-[#DCD0BE]/90 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#C85A28]" />
          <span className="font-hand text-xl sm:text-2xl text-[#C85A28] font-bold tracking-wide">
            EVERY LIFE HAS A STORY
          </span>
        </div>

        {/* Giant Poster Display Headline */}
        <h1 className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-[#1E1B1A] tracking-tight leading-[0.88] uppercase mb-4">
          <span className="block transform transition-transform hover:scale-[1.01] duration-300">
            YOUR LIFE
          </span>
          <span className="block text-[#C85A28] transform transition-transform hover:scale-[1.01] duration-300">
            DESERVES
          </span>
          <span className="block transform transition-transform hover:scale-[1.01] duration-300">
            A MOVIE.
          </span>
        </h1>

        {/* Scribble underline accent */}
        <div className="my-1 sm:my-2">
          <ScribbleUnderline className="w-48 sm:w-72 h-4 sm:h-6 text-[#C85A28]" />
        </div>

        {/* Emotional Handwritten Sub-sentence */}
        <p className="font-hand text-2xl sm:text-3xl md:text-4xl text-[#423C35] font-medium mt-2 mb-8 sm:mb-10 max-w-xl">
          we remember more than we realize.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5 w-full justify-center">
          {/* Primary CTA */}
          <button
            onClick={() => {
              sound.playShutter();
              onOpenMakeMovie();
            }}
            className="w-full sm:w-auto group px-8 py-4 bg-[#1E1B1A] text-[#FAF7F2] font-display text-xl sm:text-2xl tracking-wider rounded-xs transition-all duration-300 hover:bg-[#C85A28] hover:shadow-xl active:scale-95 flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>MAKE MY MOVIE</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Secondary CTA: Watch Sample */}
          <button
            onClick={() => {
              sound.playTap();
              onWatchSample();
            }}
            className="w-full sm:w-auto px-6 py-4 bg-[#FAF7F2] border-2 border-[#1E1B1A] text-[#1E1B1A] font-display text-xl sm:text-2xl tracking-wider rounded-xs transition-all duration-300 hover:bg-[#ECE4D6] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>WATCH A SAMPLE</span>
          </button>
        </div>

        {/* Director's metadata notes */}
        <div className="mt-8 font-typewriter text-[10px] sm:text-[11px] text-[#6E665E] tracking-widest uppercase flex flex-wrap justify-center items-center gap-2 sm:gap-3">
          <span>ANALOG FILM GRADING</span>
          <span>•</span>
          <span>CURATED BY AI ARCHIVISTS</span>
          <span>•</span>
          <span>4K CINEMA EXPORT</span>
        </div>
      </div>

      {/* Bottom Scroll Indicator */}
      <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none opacity-80 animate-bounce">
        <span className="font-typewriter text-[10px] sm:text-[11px] tracking-widest uppercase text-[#423C35]">
          Scroll
        </span>
        <span className="font-typewriter text-xs text-[#423C35]">↓</span>
      </div>
    </section>
  );
}


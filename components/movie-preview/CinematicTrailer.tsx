"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { sound } from "@/lib/audio-synth";
import { Play, Pause, RotateCcw, Film } from "lucide-react";
import { cn } from "@/lib/utils";

const TRAILER_SCENES = [
  {
    time: "0:00",
    title: "ACT I: THE DEPARTURE",
    quote: "We packed everything we owned into two backpacks and forgot to look back.",
    image: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=1200&auto=format&fit=crop",
    subtitle: "[train whistle sounds in the distance]",
  },
  {
    time: "0:05",
    title: "ACT II: THE MIDNIGHT CREW",
    quote: "The people who taught you that home isn't a place, it's 2 AM chai.",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?q=80&w=1200&auto=format&fit=crop",
    subtitle: "[uncontrollable laughter echo]",
  },
  {
    time: "0:10",
    title: "ACT III: THE TURNING POINT",
    quote: "When the unexpected storm hit, and you discovered what you were made of.",
    image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?q=80&w=1200&auto=format&fit=crop",
    subtitle: "[soft cello crescendo]",
  },
  {
    time: "0:15",
    title: "ACT IV: THE SUNSET PROMISE",
    quote: "And after four years, standing on that rooftop, you knew you'd made it.",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop",
    subtitle: "[orchestral resolve & applause]",
  },
];

export function CinematicTrailer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isPlaying) {
      sound.playCinematicChord();
      sound.startProjector();

      timerRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            sound.stopProjector();
            return 0;
          }
          const nextVal = prev + 1.25;
          const nextScene = Math.min(
            Math.floor((nextVal / 100) * TRAILER_SCENES.length),
            TRAILER_SCENES.length - 1
          );
          setSceneIndex(nextScene);
          return nextVal;
        });
      }, 100);
    } else {
      sound.stopProjector();
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      sound.stopProjector();
    };
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (progress >= 100) setProgress(0);
      setIsPlaying(true);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setSceneIndex(0);
  };

  const currentScene = TRAILER_SCENES[sceneIndex];

  return (
    <section id="trailer" className="relative w-full bg-[#0C0B0A] text-[#FAF7F2] py-24 sm:py-36 px-4 sm:px-8 select-none transition-colors duration-1000">
      <div className="max-w-7xl mx-auto">
        {/* Header inside Cinema Mode */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-12 border-b border-white/15 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Film className="w-5 h-5 text-[#EAA846]" />
              <span className="font-typewriter text-xs text-[#EAA846] uppercase tracking-widest">
                ARCHIVAL SAMPLE TRAILER • 2.39:1 CINEMASCOPE
              </span>
            </div>
            <h2 className="font-display text-5xl sm:text-7xl md:text-8xl text-white tracking-tight uppercase leading-[0.9]">
              THE LAST FOUR YEARS <br />
              <span className="text-[#C85A28]">2019 — 2026</span>
            </h2>
          </div>

          <div className="max-w-md">
            <p className="font-serif-editorial italic text-base sm:text-lg text-neutral-300">
              A sample generated movie created from 312 camera roll photos, 18 audio voice memos, and 4 personal coordinates.
            </p>
          </div>
        </div>

        {/* The 2.39:1 Anamorphic Cinema Player Box */}
        <div className="relative w-full aspect-21/9 bg-black rounded-xs overflow-hidden border border-white/20 shadow-2xl flex flex-col justify-between">
          
          {/* Active Scene Backdrop */}
          <div className="absolute inset-0 z-0">
            <Image
              src={currentScene.image}
              alt={currentScene.title}
              fill
              sizes="(max-width: 1400px) 100vw, 1400px"
              className={cn(
                "object-cover transition-all duration-1000",
                isPlaying ? "scale-105" : "scale-100 filter brightness-75"
              )}
            />
            {/* Cinematic color grade & vignette */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-transparent to-black/45" />
          </div>

          {/* Top Cinema Bar Info */}
          <div className="relative z-10 p-3 sm:p-6 flex items-center justify-between text-[10px] sm:text-xs font-typewriter text-white/80 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2.5 h-2.5 rounded-full",
                isPlaying ? "bg-red-500 animate-ping" : "bg-neutral-500"
              )} />
              <span>LIFE MOVIE ARCHIVAL CUT // 4K 24FPS</span>
            </div>
            <div className="hidden sm:block">
              {currentScene.title}
            </div>
          </div>

          {/* Center Play Button Overlay (when paused) */}
          {!isPlaying && (
            <div className="relative z-20 self-center flex flex-col items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#C85A28] text-white flex items-center justify-center photo-shadow-deep hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer shadow-2xl focus:outline-none focus:ring-4 focus:ring-[#C85A28]/50"
                aria-label="Play sample trailer"
              >
                <Play className="w-8 h-8 fill-current translate-x-0.5" />
              </button>
              <span className="font-display text-xl sm:text-2xl tracking-widest uppercase">
                PLAY SAMPLE TRAILER
              </span>
            </div>
          )}

          {/* Bottom Subtitles & Chapter Overlay (when playing) */}
          <div className="relative z-10 p-3 sm:p-8 flex flex-col items-center text-center">
            {isPlaying && (
              <div className="max-w-2xl bg-black/75 backdrop-blur-xs px-5 py-2.5 sm:px-6 sm:py-3 rounded-xs border border-white/15 mb-3 sm:mb-4 animate-fade-in">
                <p className="font-serif-editorial text-base sm:text-2xl text-white font-medium italic">
                  &ldquo;{currentScene.quote}&rdquo;
                </p>
                <span className="font-typewriter text-[10px] sm:text-[11px] text-[#EAA846] block mt-1">
                  {currentScene.subtitle}
                </span>
              </div>
            )}

            {/* Transport Control Bar */}
            <div className="w-full flex items-center justify-between gap-3 sm:gap-4 bg-black/80 backdrop-blur-md px-3 sm:px-4 py-2 sm:py-3 rounded-xs border border-white/15">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <button
                  onClick={togglePlay}
                  className="p-1 hover:text-[#C85A28] transition-colors cursor-pointer"
                  aria-label={isPlaying ? "Pause trailer" : "Play trailer"}
                >
                  {isPlaying ? <Pause className="w-4 h-4 sm:w-5 sm:h-5" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />}
                </button>
                <button
                  onClick={handleReset}
                  className="p-1 hover:text-[#C85A28] transition-colors cursor-pointer"
                  aria-label="Reset trailer"
                >
                  <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <span className="font-typewriter text-[10px] sm:text-xs text-neutral-400">
                  {Math.floor((progress / 100) * 20)}s / 20s
                </span>
              </div>

              {/* Progress Scrub Bar */}
              <div className="flex-1 mx-2 sm:mx-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#C85A28] transition-all duration-100 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Scene Indicators */}
              <div className="hidden sm:flex items-center gap-2">
                {TRAILER_SCENES.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      sceneIndex === i ? "bg-[#C85A28]" : "bg-white/30"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Callout below trailer */}
        <div className="mt-8 text-center">
          <p className="font-hand text-2xl sm:text-3xl text-neutral-300">
            &ldquo;this could be your memories, your friends, your last ten years.&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}


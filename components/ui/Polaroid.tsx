"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Tape } from "./Tape";
import { sound } from "@/lib/audio-synth";

interface PolaroidProps {
  src: string;
  alt: string;
  caption?: string;
  date?: string;
  location?: string;
  rotation?: number;
  tape?: boolean;
  tapeVariant?: "neutral" | "amber" | "dark" | "terracotta";
  className?: string;
  aspect?: string;
  priority?: boolean;
}

export function Polaroid({
  src,
  alt,
  caption,
  date,
  location,
  rotation = 0,
  tape = true,
  tapeVariant = "neutral",
  className,
  aspect = "aspect-[4/5]",
  priority = false,
}: PolaroidProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playTap();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative group transition-all duration-300 ease-out cursor-pointer",
        className
      )}
      style={{
        transform: `rotate(${isHovered ? 0 : rotation}deg) translateY(${isHovered ? "-6px" : "0px"}) scale(${isHovered ? 1.02 : 1})`,
        zIndex: isHovered ? 30 : 10,
      }}
    >
      {/* Tape on top */}
      {tape && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <Tape variant={tapeVariant} rotation={-1.5} />
        </div>
      )}

      {/* Polaroid Card */}
      <div className="bg-[#FAF8F5] p-3 pb-5 rounded-xs photo-shadow border border-[#E6DFD5] transition-shadow duration-300 group-hover:photo-shadow-deep">
        {/* Photo viewport */}
        <div className={cn("relative overflow-hidden bg-[#24211F] rounded-[1px]", aspect)}>
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter contrast-103 saturate-95"
          />
          {/* Subtle analog film sheen */}
          <div className="absolute inset-0 bg-linear-to-tr from-black/20 via-transparent to-white/10 pointer-events-none mix-blend-overlay" />
          
          {/* Film stamp border top left */}
          <div className="absolute top-1.5 left-2 font-typewriter text-[8px] text-white/70 tracking-widest uppercase">
            35mm — KODAK 400
          </div>
        </div>

        {/* Caption & Metadata */}
        {(caption || date || location) && (
          <div className="mt-3 px-1 flex flex-col gap-0.5">
            {caption && (
              <p className="font-hand text-lg md:text-xl text-[#201D1C] leading-snug font-medium">
                &ldquo;{caption}&rdquo;
              </p>
            )}
            <div className="flex items-center justify-between mt-1 text-[11px] font-typewriter text-[#7A7166] tracking-wider uppercase">
              {location && <span>{location}</span>}
              {date && <span>{date}</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

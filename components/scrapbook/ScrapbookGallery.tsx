"use client";

import React from "react";
import Image from "next/image";
import { Tape } from "@/components/ui/Tape";
import { Stamp } from "@/components/ui/Stamp";
import { sound } from "@/lib/audio-synth";
import { HandDrawnHeart } from "@/components/paper/Doodles";
import { Sparkles, MapPin, Calendar } from "lucide-react";

type TapeVariant = "amber" | "neutral" | "dark" | "terracotta";

interface ScrapbookItem {
  id: string;
  type: string;
  image?: string;
  caption?: string;
  date?: string;
  location?: string;
  rotation: number;
  tape?: string;
  author?: string;
  text?: string;
}

const SCRAPBOOK_ITEMS: ScrapbookItem[] = [
  {
    id: "sc1",
    type: "photo",
    image: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?q=80&w=800&auto=format&fit=crop",
    caption: "3:00 AM celebration after the release",
    date: "OCT 2021",
    location: "Koramangala, BLR",
    rotation: -3,
    tape: "amber",
  },
  {
    id: "sc2",
    type: "negative",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
    caption: "The stadium chorus during the encore",
    date: "AUG 2022",
    location: "Wembley",
    rotation: 2.5,
    tape: "dark",
  },
  {
    id: "sc3",
    type: "note",
    text: "Promise me we'll still take these trains when we're 60 and grumpy.",
    author: "MAYA (HANDWRITTEN POST-IT)",
    rotation: -1.5,
    tape: "terracotta",
  },
  {
    id: "sc4",
    type: "photo",
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=800&auto=format&fit=crop",
    caption: "The night the car broke down on NH44",
    date: "DEC 2023",
    location: "Karnataka",
    rotation: 3,
    tape: "amber",
  },
  {
    id: "sc5",
    type: "photo",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=800&auto=format&fit=crop",
    caption: "Rooftop chai before the 7 AM flight",
    date: "MARCH 2024",
    location: "Indiranagar",
    rotation: -2,
    tape: "amber",
  },
  {
    id: "sc6",
    type: "photo",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop",
    caption: "The mountain thunderstorm in Himachal",
    date: "JULY 2024",
    location: "Spiti Valley",
    rotation: 1.2,
    tape: "neutral",
  },
];

export function ScrapbookGallery() {
  const handleInspect = () => {
    sound.playTap();
  };

  return (
    <section className="relative min-h-screen py-24 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto select-none">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Stamp text="LIGHTBOX" subtext="CONTACT SHEET" color="terracotta" rotation={-3} />
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
        <div>
          <h2 className="font-display text-5xl sm:text-7xl md:text-8xl text-[#201D1C] leading-[0.88] uppercase">
            THE SCRAPBOOK & <br />
            <span className="text-[#C85A28]">CONTACT SHEETS.</span>
          </h2>
          <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#5C5349] mt-3 max-w-xl">
            Every ticket stub, candid polaroid, and hasty voice memo holds a coordinate on your life map.
          </p>
        </div>

        <span className="font-hand text-2xl text-[#C85A28] -rotate-2">
          &ldquo;hover over any print to inspect&rdquo;
        </span>
      </div>

      {/* Lightbox / Scrapbook Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
        {SCRAPBOOK_ITEMS.map((item, idx) => {
          if (item.type === "note") {
            return (
              <div
                key={item.id}
                className="relative bg-[#FAF0DC] p-6 rounded-xs border-2 border-dashed border-[#DAC3A3] photo-shadow flex flex-col justify-between"
                style={{ transform: `rotate(${item.rotation}deg)` }}
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Tape variant="amber" rotation={-2} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#C85A28]" />
                  <span className="font-typewriter text-[10px] text-[#C85A28] tracking-widest uppercase">
                    {item.author}
                  </span>
                </div>
                <p className="font-hand text-2xl sm:text-3xl text-[#201D1C] leading-snug">
                  &ldquo;{item.text}&rdquo;
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-[#DAC3A3] pt-2">
                  <span className="font-typewriter text-[9px] text-[#7A7166]">
                    NOTE #891 — ARCHIVE DESK
                  </span>
                  <HandDrawnHeart className="w-5 h-5 text-[#D45D55]" />
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              onClick={handleInspect}
              className="group relative bg-[#FAF8F5] p-3 pb-5 rounded-xs photo-shadow border border-[#E3DCD1] transition-all duration-300 hover:photo-shadow-deep hover:scale-[1.02] cursor-pointer"
              style={{ transform: `rotate(${item.rotation}deg)` }}
            >
              {/* Tape */}
              <div className="absolute -top-3 left-8 z-20">
                <Tape variant={(item.tape as TapeVariant) || "neutral"} rotation={idx % 2 === 0 ? -2 : 3} />
              </div>

              {/* Photo */}
              <div className="relative w-full aspect-4/3 bg-neutral-900 rounded-[1px] overflow-hidden">
                <Image
                  src={item.image!}
                  alt={item.caption!}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* 35mm film perforations border */}
                <div className="absolute top-2 left-2 bg-black/60 text-white font-typewriter text-[8px] px-1.5 py-0.5 uppercase tracking-widest">
                  EXP. {item.date}
                </div>
              </div>

              {/* Caption */}
              <div className="mt-3 px-1">
                <p className="font-hand text-xl text-[#201D1C] leading-tight">
                  &ldquo;{item.caption}&rdquo;
                </p>
                <div className="flex items-center justify-between mt-2 font-typewriter text-[10px] text-[#7A7166] uppercase">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#C85A28]" />
                    {item.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

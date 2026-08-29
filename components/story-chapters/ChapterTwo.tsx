"use client";

import React from "react";
import Image from "next/image";
import { Polaroid } from "@/components/ui/Polaroid";
import { Stamp } from "@/components/ui/Stamp";
import { DESK_PHOTOS } from "@/lib/sample-data";
import { HandDrawnCurlyArrow, HandDrawnHeart } from "@/components/paper/Doodles";

export function ChapterTwo() {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen py-20 sm:py-32 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col justify-center select-none">
      {/* Chapter 02 Header */}
      <div className="flex items-center gap-4 mb-6">
        <Stamp text="ACT II" subtext="ENSEMBLE" color="terracotta" rotation={3} />
        <span className="font-typewriter text-[11px] text-[#6E665E] uppercase tracking-widest">
          CHARACTER INTRODUCTIONS
        </span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 sm:mb-16">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl text-[#1E1B1A] leading-[0.92] uppercase">
            THEN CAME <br />
            <span className="text-[#C85A28]">THE PEOPLE.</span>
          </h2>
          <p className="font-serif-editorial italic text-xl sm:text-2xl text-[#524B43] mt-3">
            The co-stars who made the mundane scenes feel like award-winning cinema.
          </p>
        </div>

        {/* Director Note badge */}
        <div className="bg-[#E9E0D3] p-4 rounded-xs border border-[#D3C6B4] max-w-xs rotate-1 shadow-xs">
          <p className="font-hand text-xl text-[#1E1B1A] leading-snug">
            &ldquo;Every epic film is only as memorable as the people who share the frame.&rdquo;
          </p>
          <span className="font-typewriter text-[10px] text-[#6E665E] uppercase block mt-1 tracking-wider">
            — DIRECTOR&apos;S CUT LOG
          </span>
        </div>
      </div>

      {/* Scattered Desk Collection Grid with realistic physical depth */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 relative">
        {/* Photo 1: Late Night Diner */}
        <div className="relative">
          <Polaroid
            src={DESK_PHOTOS[1].imageUrl}
            alt={DESK_PHOTOS[1].title}
            caption={DESK_PHOTOS[1].annotation}
            date={DESK_PHOTOS[1].year}
            location={DESK_PHOTOS[1].location}
            rotation={-3.2}
            tapeVariant="amber"
            aspect="aspect-square"
          />
        </div>

        {/* Photo 2: Stalled Road Trip */}
        <div className="relative lg:-mt-6">
          <Polaroid
            src={DESK_PHOTOS[2].imageUrl}
            alt={DESK_PHOTOS[2].title}
            caption={DESK_PHOTOS[2].annotation}
            date={DESK_PHOTOS[2].year}
            location={DESK_PHOTOS[2].location}
            rotation={3.5}
            tapeVariant="dark"
            aspect="aspect-[4/3]"
          />
          {/* Arrow pointing to photo */}
          <div className="hidden lg:block absolute -bottom-10 -right-8 pointer-events-none z-30">
            <HandDrawnCurlyArrow className="w-28 h-16 text-[#C85A28] rotate-45" />
          </div>
        </div>

        {/* Photo 3: Balcony Conversation */}
        <div className="relative">
          <Polaroid
            src={DESK_PHOTOS[3].imageUrl}
            alt={DESK_PHOTOS[3].title}
            caption={DESK_PHOTOS[3].annotation}
            date={DESK_PHOTOS[3].year}
            location={DESK_PHOTOS[3].location}
            rotation={-2.4}
            tapeVariant="neutral"
            aspect="aspect-[3/4]"
          />
        </div>

        {/* Photo 4: Rooftop graduation */}
        <div className="sm:col-span-2 lg:col-span-2 relative mt-2 sm:mt-4">
          <div className="bg-[#FAF7F2] p-4 sm:p-6 rounded-xs photo-shadow-deep border border-[#E0D8CD] rotate-0.5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
              <span className="font-hand text-2xl sm:text-3xl text-[#1E1B1A]">
                &ldquo;summer 2024. we had no idea this would matter so much.&rdquo;
              </span>
              <span className="font-typewriter text-[11px] text-[#C85A28] font-bold uppercase tracking-wider">
                GOLDEN HOUR ARCHIVE • 35MM
              </span>
            </div>
            <div className="relative w-full aspect-21/9 bg-neutral-900 rounded-[1px] overflow-hidden">
              <Image
                src={DESK_PHOTOS[4].imageUrl}
                alt={DESK_PHOTOS[4].title}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover contrast-105"
              />
            </div>
          </div>
        </div>

        {/* Director Audio Notebook Card */}
        <div className="relative flex flex-col justify-center bg-[#EFE7D8] p-6 rounded-xs border-2 border-dashed border-[#CEBFAB] -rotate-1.5 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <HandDrawnHeart className="w-6 h-6 text-[#D45D55]" />
            <span className="font-display text-2xl text-[#1E1B1A] tracking-wide">DIRECTOR&apos;S AUDIO ARCHIVE</span>
          </div>
          <p className="font-serif-editorial italic text-base text-[#423C35]">
            &ldquo;42 unfiltered laughs, 18 background songs, and 1 unforgettable goodbye on the train platform.&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-1.5 border-t border-[#D5C7B5] pt-3">
            <span className="h-4 w-1 bg-[#C85A28] rounded-full animate-pulse" />
            <span className="h-6 w-1 bg-[#C85A28] rounded-full animate-pulse delay-100" />
            <span className="h-3 w-1 bg-[#C85A28] rounded-full animate-pulse delay-200" />
            <span className="h-5 w-1 bg-[#C85A28] rounded-full animate-pulse delay-300" />
            <span className="font-typewriter text-[10px] text-[#6E665E] ml-2 tracking-widest uppercase">
              ROOM TONE: 24-BIT MASTER
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}


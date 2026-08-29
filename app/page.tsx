"use client";

import React, { useState } from "react";
import { PaperBackground } from "@/components/paper/PaperBackground";
import { FilmGrain } from "@/components/paper/FilmGrain";
import { Navbar } from "@/components/navigation/Navbar";
import { Hero } from "@/components/hero/Hero";
import { ChapterOne } from "@/components/story-chapters/ChapterOne";
import { ChapterTwo } from "@/components/story-chapters/ChapterTwo";
import { MemoryConnector } from "@/components/magic-connector/MemoryConnector";
import { StoryTypeArchive } from "@/components/story-types/StoryTypeArchive";
import { DirectorStyles } from "@/components/movie-styles/DirectorStyles";
import { CinematicTrailer } from "@/components/movie-preview/CinematicTrailer";
import { ScrapbookGallery } from "@/components/scrapbook/ScrapbookGallery";
import { StoryTimeline } from "@/components/timeline/StoryTimeline";
import { FinalCta } from "@/components/final-cta/FinalCta";
import { MakeMovieExperienceModal } from "@/components/modal/MakeMovieExperienceModal";
import { StoryCategory, DirectorStyle } from "@/lib/sample-data";

export default function Home() {
  const [isMakeMovieOpen, setIsMakeMovieOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<StoryCategory | undefined>(undefined);
  const [selectedStyle, setSelectedStyle] = useState<DirectorStyle | undefined>(undefined);

  const handleOpenMakeMovie = () => {
    setIsMakeMovieOpen(true);
  };

  const handleSelectCategory = (cat: StoryCategory) => {
    setSelectedCategory(cat);
    setIsMakeMovieOpen(true);
  };

  const handleSelectStyle = (style: DirectorStyle) => {
    setSelectedStyle(style);
    setIsMakeMovieOpen(true);
  };

  const handleWatchSample = () => {
    const el = document.getElementById("trailer");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-[#F5EFEB] overflow-x-hidden text-[#201D1C]">
      {/* Background paper texture & dynamic 24fps film grain */}
      <PaperBackground />
      <FilmGrain />

      {/* Fixed Editorial Navigation */}
      <Navbar onOpenMakeMovie={handleOpenMakeMovie} />

      {/* 1. Full Screen Tactile Hero */}
      <Hero
        onOpenMakeMovie={handleOpenMakeMovie}
        onWatchSample={handleWatchSample}
      />

      {/* 2. Scroll Storytelling — Chapter 01 */}
      <ChapterOne />

      {/* 3. Scroll Storytelling — Chapter 02 */}
      <ChapterTwo />

      {/* 4. The Magic: You Remember, We Connect the Dots */}
      <MemoryConnector />

      {/* 5. Story Type Selection (Poster Wall / Contact Sheet) */}
      <StoryTypeArchive onSelectCategory={handleSelectCategory} />

      {/* 6. Movie Style & Director Switcher */}
      <DirectorStyles onSelectStyle={handleSelectStyle} />

      {/* 7. Full-screen Cinema Trailer Preview (Warm Paper -> Deep Black) */}
      <CinematicTrailer />

      {/* 8. Scrapbook & Lightbox Gallery */}
      <ScrapbookGallery />

      {/* 9. Chronological Story Timeline (2019 — 2026) */}
      <StoryTimeline />

      {/* 10. Final Emotional Epilogue Section */}
      <FinalCta onOpenMakeMovie={handleOpenMakeMovie} />

      {/* Interactive Make Movie Studio Modal */}
      <MakeMovieExperienceModal
        key={`${selectedCategory?.id || "default"}-${selectedStyle?.id || "default"}-${isMakeMovieOpen}`}
        isOpen={isMakeMovieOpen}
        onClose={() => setIsMakeMovieOpen(false)}
        initialCategory={selectedCategory}
        initialStyle={selectedStyle}
      />
    </main>
  );
}

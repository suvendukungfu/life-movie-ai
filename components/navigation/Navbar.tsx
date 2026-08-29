"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { sound } from "@/lib/audio-synth";
import { VolumeX, Clapperboard, FolderHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthUser } from "@/lib/auth/types";
import { AuthModal } from "@/components/auth/AuthModal";

interface NavbarProps {
  onOpenMakeMovie: () => void;
}

export function Navbar({ onOpenMakeMovie }: NavbarProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    // Check user session
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    sound.playTap();
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.reload();
  };

  const toggleSound = () => {
    const newState = sound.toggleMute();
    setSoundEnabled(newState);
  };

  const scrollTo = (id: string) => {
    sound.playTap();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300 px-4 sm:px-8 py-3 md:py-4",
        scrolled
          ? "bg-[#F5EFEB]/90 backdrop-blur-md border-b border-[#E2D8CA]/80 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Logo */}
        <button
          onClick={() => {
            sound.playTap();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full border border-[#201D1C] flex items-center justify-center bg-[#FAF6F0] group-hover:bg-[#C85A28] group-hover:text-white transition-colors duration-200">
            <span className="font-display text-base tracking-tighter">LM</span>
          </div>
          <div>
            <span className="font-display text-xl sm:text-2xl tracking-wider text-[#201D1C] block leading-none">
              LIFE MOVIE
            </span>
            <span className="font-typewriter text-[9px] text-[#7A7166] tracking-widest uppercase block mt-0.5">
              EST. 35MM
            </span>
          </div>
        </button>

        {/* Center: "turn sound on" vintage toggle (Echoing reference image) */}
        <button
          onClick={toggleSound}
          aria-label={soundEnabled ? "Mute ambient cinema audio" : "Unmute ambient cinema audio"}
          className={cn(
            "group relative px-3 py-1.5 rounded-full flex items-center gap-2 transition-all duration-200 border cursor-pointer",
            soundEnabled
              ? "bg-[#C85A28]/10 border-[#C85A28] text-[#C85A28]"
              : "bg-[#ECE3D5]/60 border-[#D8CCBC] text-[#635A4F] hover:border-[#201D1C] hover:text-[#201D1C]"
          )}
        >
          <div className="flex items-center gap-0.5 h-3.5">
            {soundEnabled ? (
              <>
                <span className="w-1 bg-[#C85A28] h-3 animate-pulse rounded-full" />
                <span className="w-1 bg-[#C85A28] h-2 animate-bounce rounded-full delay-75" />
                <span className="w-1 bg-[#C85A28] h-3.5 animate-pulse rounded-full delay-150" />
              </>
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="font-hand text-base md:text-lg font-semibold tracking-wide">
            {soundEnabled ? "sound active" : "turn sound on"}
          </span>
        </button>

        {/* Right: Nav Links & CTA */}
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden md:flex items-center gap-5 text-xs uppercase font-typewriter tracking-widest text-[#4A433B]">
            <button
              onClick={() => scrollTo("chapters")}
              className="relative py-1 hover:text-[#201D1C] transition-colors group cursor-pointer"
            >
              FILM
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C85A28] transition-all duration-200 group-hover:w-full" />
            </button>
            <button
              onClick={() => scrollTo("magic")}
              className="relative py-1 hover:text-[#201D1C] transition-colors group cursor-pointer"
            >
              PROCESS
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C85A28] transition-all duration-200 group-hover:w-full" />
            </button>
            <button
              onClick={() => scrollTo("stories")}
              className="relative py-1 hover:text-[#201D1C] transition-colors group cursor-pointer"
            >
              STORIES
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C85A28] transition-all duration-200 group-hover:w-full" />
            </button>
            <button
              onClick={() => scrollTo("directors")}
              className="relative py-1 hover:text-[#201D1C] transition-colors group cursor-pointer"
            >
              STYLES
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#C85A28] transition-all duration-200 group-hover:w-full" />
            </button>
            <Link
              href="/films"
              onClick={sound.playTap}
              className="relative py-1 text-[#C85A28] font-bold hover:underline transition-colors flex items-center gap-1"
            >
              <FolderHeart className="w-3.5 h-3.5" />
              <span>MY FILMS</span>
            </Link>
          </nav>

          {/* User Auth or Sign In Button */}
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline font-mono text-[10px] uppercase text-[#635A4F] bg-[#ECE3D5]/80 px-2 py-1 rounded">
                {user.email.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="font-mono text-[10px] uppercase tracking-wider text-[#8C827A] hover:text-[#C85A28] transition-colors px-1"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                sound.playTap();
                setAuthModalOpen(true);
              }}
              className="font-mono text-xs uppercase tracking-wider text-[#4A433B] hover:text-[#C85A28] transition-colors py-1 px-2 border border-[#D8CCBC] rounded hover:border-[#C85A28]"
            >
              Sign In
            </button>
          )}

          {/* CTA: MAKE YOUR MOVIE */}
          <button
            onClick={() => {
              sound.playShutter();
              onOpenMakeMovie();
            }}
            className="group relative px-4 sm:px-5 py-2 bg-[#201D1C] text-[#FAF8F5] font-display text-base sm:text-lg tracking-wider rounded-xs transition-all duration-200 hover:bg-[#C85A28] active:scale-95 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
          >
            <Clapperboard className="w-4 h-4 transition-transform group-hover:rotate-12" />
            <span>MAKE YOUR MOVIE</span>
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
        }}
      />
    </header>
  );
}

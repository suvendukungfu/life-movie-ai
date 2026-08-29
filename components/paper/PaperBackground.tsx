"use client";

import React from "react";

export function PaperBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* SVG Filter for organic rough paper texture */}
      <svg className="absolute w-0 h-0">
        <filter id="paper-warp">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* Base warm paper tone with subtle crease gradients */}
      <div 
        className="absolute inset-0 bg-[#F4EFEB]"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at 15% 15%, rgba(246, 238, 228, 0.95) 0%, transparent 60%),
            radial-gradient(ellipse at 85% 85%, rgba(232, 222, 208, 0.75) 0%, transparent 55%),
            radial-gradient(circle at 50% 50%, rgba(255, 252, 247, 0.5) 0%, transparent 80%),
            linear-gradient(135deg, rgba(30, 25, 20, 0.015) 0%, rgba(30, 25, 20, 0.035) 50%, rgba(30, 25, 20, 0.01) 100%)
          `,
        }}
      />

      {/* Scanned paper wrinkles & organic fibers */}
      <div
        className="absolute inset-0 opacity-35 mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.09'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Faint crease lines (film director's folded sheet) */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, transparent 49.8%, rgba(60, 45, 30, 0.15) 50%, transparent 50.2%),
            linear-gradient(to bottom, transparent 49.8%, rgba(60, 45, 30, 0.12) 50%, transparent 50.2%)
          `,
        }}
      />

      {/* Subtle edge vignette */}
      <div 
        className="absolute inset-0"
        style={{
          boxShadow: "inset 0 0 90px rgba(60, 40, 25, 0.06), inset 0 0 180px rgba(60, 40, 25, 0.03)",
        }}
      />
    </div>
  );
}


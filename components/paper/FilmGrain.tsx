"use client";

import React, { useEffect, useRef } from "react";

export function FilmGrain() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let animationFrameId: number;
    const width = (canvas.width = 256);
    const height = (canvas.height = 256);

    // Pre-generate 4 frames of film grain noise for 60fps / 24fps cinema look with minimal CPU
    const frames: ImageData[] = [];
    for (let f = 0; f < 4; f++) {
      const imgData = ctx.createImageData(width, height);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.random() * 255;
        data[i] = val;
        data[i + 1] = val;
        data[i + 2] = val;
        data[i + 3] = Math.random() * 28 + 8; // subtle noise opacity
      }
      frames.push(imgData);
    }

    let frameIndex = 0;
    let lastTime = 0;
    const fpsInterval = 1000 / 24; // 24 frames per second film motion

    const render = (time: number) => {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      animationFrameId = requestAnimationFrame(render);
      const elapsed = time - lastTime;
      if (elapsed > fpsInterval) {
        lastTime = time - (elapsed % fpsInterval);
        ctx.putImageData(frames[frameIndex], 0, 0);
        frameIndex = (frameIndex + 1) % frames.length;
      }
    };

    animationFrameId = requestAnimationFrame(render);

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        lastTime = performance.now();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 w-full h-full pointer-events-none z-50 opacity-[0.045] mix-blend-overlay"
      style={{
        imageRendering: "pixelated",
      }}
    />
  );
}

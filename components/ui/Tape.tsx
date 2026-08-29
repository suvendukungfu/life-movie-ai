import React from "react";
import { cn } from "@/lib/utils";

interface TapeProps {
  className?: string;
  variant?: "neutral" | "amber" | "dark" | "terracotta";
  rotation?: number;
}

export function Tape({
  className,
  variant = "neutral",
  rotation = 0,
}: TapeProps) {
  const variantStyles = {
    neutral: "tape-neutral text-[#4A4036]",
    amber: "tape-amber text-[#5C3B0E]",
    dark: "tape-dark text-[#EBE3D7]",
    terracotta: "tape-terracotta text-[#FBF6EE]",
  };

  return (
    <div
      className={cn(
        "h-6 w-24 tape-torn select-none pointer-events-none z-20 transition-transform duration-200",
        variantStyles[variant],
        className
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    />
  );
}


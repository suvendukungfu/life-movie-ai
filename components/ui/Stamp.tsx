import React from "react";
import { cn } from "@/lib/utils";

interface StampProps {
  text: string;
  subtext?: string;
  className?: string;
  rotation?: number;
  color?: "terracotta" | "charcoal" | "green";
}

export function Stamp({
  text,
  subtext,
  className,
  rotation = -4,
  color = "terracotta",
}: StampProps) {
  const colorMap = {
    terracotta: "border-[#C85A28] text-[#C85A28]",
    charcoal: "border-[#201D1C] text-[#201D1C]",
    green: "border-[#3F6352] text-[#3F6352]",
  };

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center justify-center border-2 border-dashed px-3 py-1.5 rounded-sm uppercase tracking-widest select-none pointer-events-none opacity-85 mix-blend-multiply",
        colorMap[color],
        className
      )}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      <span className="font-display text-sm md:text-base leading-none font-bold">
        {text}
      </span>
      {subtext && (
        <span className="font-typewriter text-[9px] tracking-wider mt-0.5 opacity-80">
          {subtext}
        </span>
      )}
    </div>
  );
}

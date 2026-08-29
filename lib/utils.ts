import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Seeded pseudorandom rotation for stable rendering
export function getRotation(seed: number, min = -4, max = 4): number {
  const x = Math.sin(seed * 9999) * 10000;
  const rand = x - Math.floor(x);
  return Number((min + rand * (max - min)).toFixed(2));
}

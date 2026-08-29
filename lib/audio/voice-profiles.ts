/**
 * Centralized Voice Profiles & Gemini TTS Direction.
 *
 * Directs speech prosody, emotional inflection, and narrator casting
 * for each cinematic director aesthetic.
 */

export interface VoiceProfile {
  id: string;
  name: string;
  geminiVoice: "Puck" | "Charon" | "Kore" | "Fenrir" | "Aoede";
  directionPrompt: string;
  targetPacing: "slow" | "natural" | "brisk";
  speedMultiplier: number;
  emotionalTone: "reflective" | "dramatic" | "neutral" | "hopeful" | "warm";
  description: string;
}

export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  nostalgia: {
    id: "nostalgia",
    name: "Nostalgic Polaroid (Puck)",
    geminiVoice: "Puck",
    directionPrompt: "Speak warmly with gentle, reflective nostalgia, as if recounting a cherished memory with a tender smile.",
    targetPacing: "slow",
    speedMultiplier: 0.95,
    emotionalTone: "reflective",
    description: "Warm, reflective, gentle cadence matching 35mm golden hour cinematography.",
  },
  cinematic: {
    id: "cinematic",
    name: "Theatrical Cinema (Charon)",
    geminiVoice: "Charon",
    directionPrompt: "Speak with deep cinematic gravitas, measured cadence, and theatrical weight.",
    targetPacing: "natural",
    speedMultiplier: 0.92,
    emotionalTone: "dramatic",
    description: "Deep, resonant, dramatic baritone for grand widescreen life sagas.",
  },
  documentary: {
    id: "documentary",
    name: "Archival Chronicle (Fenrir)",
    geminiVoice: "Fenrir",
    directionPrompt: "Speak with clarity, authority, and thoughtful sincerity, like an acclaimed documentary narrator.",
    targetPacing: "natural",
    speedMultiplier: 1.0,
    emotionalTone: "neutral",
    description: "Articulate, grounded, and observant for historical and life-chronicle films.",
  },
  romantic: {
    id: "romantic",
    name: "Intimate Journal (Kore)",
    geminiVoice: "Kore",
    directionPrompt: "Speak intimately and softly, with tender heartfelt affection and poetic cadence.",
    targetPacing: "slow",
    speedMultiplier: 0.95,
    emotionalTone: "warm",
    description: "Soft, heartfelt, and intimate for love stories, weddings, and deep bonds.",
  },
  youthful: {
    id: "youthful",
    name: "Golden Indie (Aoede)",
    geminiVoice: "Aoede",
    directionPrompt: "Speak with vibrant energy, bright optimism, and a playful, rhythmic momentum.",
    targetPacing: "brisk",
    speedMultiplier: 1.05,
    emotionalTone: "hopeful",
    description: "Bright, energetic, and spirited for road trips, college years, and adventures.",
  },
  dramatic: {
    id: "dramatic",
    name: "Film Noir (Charon)",
    geminiVoice: "Charon",
    directionPrompt: "Speak with intense dramatic focus, deliberate pauses, and brooding atmospheric weight.",
    targetPacing: "slow",
    speedMultiplier: 0.9,
    emotionalTone: "dramatic",
    description: "Moody, deliberate, and high-contrast for overcoming obstacles and turning points.",
  },
};

export function getVoiceProfileForStyle(styleIdOrMood?: string): VoiceProfile {
  if (!styleIdOrMood) return VOICE_PROFILES.nostalgia;
  const key = styleIdOrMood.toLowerCase();

  if (key.includes("doc") || key.includes("chronicle")) return VOICE_PROFILES.documentary;
  if (key.includes("noir") || key.includes("dram")) return VOICE_PROFILES.dramatic;
  if (key.includes("romance") || key.includes("french") || key.includes("intimate")) return VOICE_PROFILES.romantic;
  if (key.includes("indie") || key.includes("youth") || key.includes("college")) return VOICE_PROFILES.youthful;
  if (key.includes("cine") || key.includes("blockbuster")) return VOICE_PROFILES.cinematic;

  return VOICE_PROFILES[key] || VOICE_PROFILES.nostalgia;
}

"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "life_movie_gemini_api_key";

export interface ApiKeyInfo {
  apiKey: string | null;
  maskedKey: string | null;
  hasKey: boolean;
  isValidated: boolean;
}

export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const key = localStorage.getItem(STORAGE_KEY);
    return key && key.trim().length > 0 ? key.trim() : null;
  } catch {
    return null;
  }
}

export function setStoredApiKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    if (!key || key.trim().length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, key.trim());
    }
    window.dispatchEvent(new Event("life_movie_api_key_changed"));
  } catch {}
}

export function clearStoredApiKey(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("life_movie_api_key_changed"));
  } catch {}
}

export function formatMaskedKey(key: string | null): string | null {
  if (!key || key.length < 8) return null;
  return `••••${key.slice(-4)}`;
}

export function useApiKey(): ApiKeyInfo & {
  saveKey: (key: string) => void;
  removeKey: () => void;
} {
  const [apiKey, setApiKey] = useState<string | null>(null);

  const refreshKey = useCallback(() => {
    const key = getStoredApiKey();
    setApiKey(key);
  }, []);

  useEffect(() => {
    refreshKey();
    window.addEventListener("life_movie_api_key_changed", refreshKey);
    return () => window.removeEventListener("life_movie_api_key_changed", refreshKey);
  }, [refreshKey]);

  return {
    apiKey,
    maskedKey: formatMaskedKey(apiKey),
    hasKey: !!apiKey,
    isValidated: !!apiKey,
    saveKey: setStoredApiKey,
    removeKey: clearStoredApiKey,
  };
}

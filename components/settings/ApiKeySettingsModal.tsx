"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, CheckCircle2, AlertCircle, ExternalLink, Trash2, Eye, EyeOff, Loader2, X, Sparkles } from "lucide-react";
import { useApiKey } from "@/lib/hooks/useApiKey";
import { sound } from "@/lib/audio-synth";

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeySettingsModal({ isOpen, onClose }: ApiKeySettingsModalProps) {
  const { apiKey, maskedKey, hasKey, saveKey, removeKey } = useApiKey();
  const [inputValue, setInputValue] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue(apiKey || "");
      setStatusMessage(null);
      setShowKey(false);
    }
  }, [isOpen, apiKey]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTestAndSave = async () => {
    if (!inputValue || inputValue.trim().length === 0) {
      setStatusMessage({ text: "Please enter your Google Gemini API key.", type: "error" });
      return;
    }

    sound.playTap();
    setIsVerifying(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/settings/verify-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: inputValue.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        saveKey(inputValue.trim());
        sound.playShutter();
        setStatusMessage({
          text: data.isRateLimited
            ? "Key saved! (Note: Key is currently rate-limited on Google AI Studio free tier)."
            : "Connection verified! Your Gemini key is active and saved in your browser.",
          type: "success",
        });
      } else {
        setStatusMessage({
          text: data.error || "Failed to verify key. Please check that your key is valid in Google AI Studio.",
          type: "error",
        });
      }
    } catch {
      setStatusMessage({
        text: "Network error while connecting to verification server.",
        type: "error",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRemove = () => {
    sound.playTap();
    removeKey();
    setInputValue("");
    setStatusMessage({
      text: "API key removed from browser storage. Using server/demo fallback.",
      type: "info",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#201D1C]/20 shadow-2xl p-6 sm:p-8 rounded-xs text-[#201D1C] overflow-hidden">
        {/* Washi Tape Accent */}
        <div className="washi-tape-accent -top-3 left-1/2 -translate-x-1/2 w-32" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-[#7A7166] hover:text-[#201D1C] transition-colors rounded-xs cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-5 h-5 text-[#C85A28]" />
            <span className="font-typewriter text-xs text-[#C85A28] font-bold uppercase tracking-widest">
              STUDIO SETTINGS • BYOK
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-tight leading-none">
            GOOGLE GEMINI API KEY
          </h2>
          <p className="font-typewriter text-xs text-[#7A7166] mt-1.5 leading-relaxed">
            Bring your own key for unlimited AI screenplay generation & neural voiceover narration.
          </p>
        </div>

        {/* Active Status Badge */}
        <div className="mb-5 p-3.5 bg-[#F0EAE1] border border-[#DED3C3] rounded-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {hasKey ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="font-display text-lg leading-none">
                {hasKey ? `PERSONAL KEY ACTIVE (${maskedKey})` : "DEFAULT / SERVER MODE"}
              </p>
              <p className="font-typewriter text-[11px] text-[#7A7166] mt-0.5">
                {hasKey
                  ? "Stored locally in browser. Sent only for your requests."
                  : "No key set. Using standard server quota / deterministic fallback."}
              </p>
            </div>
          </div>
          {hasKey && (
            <button
              onClick={handleRemove}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded-xs transition-colors cursor-pointer"
              title="Remove Key"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Key Input */}
        <div className="space-y-4">
          <div>
            <label className="font-typewriter text-xs text-[#7A7166] uppercase block mb-1.5">
              Enter Your Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-[#FAF8F5] border border-[#201D1C]/30 focus:border-[#C85A28] focus:ring-1 focus:ring-[#C85A28] px-3.5 py-2.5 pr-10 font-mono text-sm rounded-xs transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A7166] hover:text-[#201D1C] cursor-pointer"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xs text-xs font-typewriter flex items-start gap-2 ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-300 text-emerald-800"
                  : statusMessage.type === "error"
                  ? "bg-red-50 border border-red-300 text-red-800"
                  : "bg-blue-50 border border-blue-300 text-blue-800"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleTestAndSave}
              disabled={isVerifying || !inputValue.trim()}
              className="flex-1 px-5 py-3 bg-[#201D1C] text-[#FAF8F5] hover:bg-[#C85A28] font-display text-xl tracking-wider rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>VERIFYING CONNECTION...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>SAVE & VERIFY KEY</span>
                </>
              )}
            </button>
          </div>

          {/* Helper Link */}
          <div className="pt-3 border-t border-[#E0D5C5] flex items-center justify-between text-xs font-typewriter text-[#7A7166]">
            <span>Don&apos;t have an API key?</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C85A28] hover:underline flex items-center gap-1 font-bold"
            >
              <span>Get Free Key at Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

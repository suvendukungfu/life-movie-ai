"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User, AlertCircle, Loader2 } from "lucide-react";
import { AuthUser } from "@/lib/auth/types";
import { sound } from "@/lib/audio-synth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    sound.playTap();

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const payload = mode === "login" ? { email, password } : { email, password, name };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success || !data.user) {
        setError(data.error || "Authentication failed.");
        setLoading(false);
        return;
      }

      sound.playShutter();
      onSuccess(data.user);
      onClose();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141211]/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#FAF8F5] text-[#201D1C] rounded-sm p-8 shadow-2xl border border-[#D9D2C7]">
        {/* Torn Tape Header Accent */}
        <div className="tape-torn absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#E8E1D5]/90 rotate-1 shadow-sm pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            sound.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 text-[#8C827A] hover:text-[#201D1C] transition-colors p-1"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <span className="font-mono text-[10px] tracking-widest text-[#8C827A] uppercase block mb-1">
            DIRECTOR&apos;S VAULT AUTHENTICATION
          </span>
          <h2 className="font-serif text-2xl font-normal italic tracking-tight text-[#201D1C]">
            {mode === "login" ? "Sign In to Your Studio" : "Open Your Film Archive"}
          </h2>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-[#D9D2C7] mb-6">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`flex-1 pb-2 text-xs font-mono tracking-wider transition-colors ${
              mode === "login"
                ? "border-b-2 border-[#C85A28] text-[#C85A28] font-bold"
                : "text-[#8C827A] hover:text-[#201D1C]"
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError(null);
            }}
            className={`flex-1 pb-2 text-xs font-mono tracking-wider transition-colors ${
              mode === "register"
                ? "border-b-2 border-[#C85A28] text-[#C85A28] font-bold"
                : "text-[#8C827A] hover:text-[#201D1C]"
            }`}
          >
            CREATE ACCOUNT
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-[#C85A28]/10 border border-[#C85A28]/30 rounded text-xs text-[#C85A28] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8C827A] mb-1">
                Director Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Chen"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F4EFEA] border border-[#D9D2C7] rounded px-3 py-2 pl-9 text-sm text-[#201D1C] focus:outline-none focus:border-[#C85A28]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8C827A] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
              <input
                type="email"
                required
                placeholder="director@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#F4EFEA] border border-[#D9D2C7] rounded px-3 py-2 pl-9 text-sm text-[#201D1C] focus:outline-none focus:border-[#C85A28]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-wider text-[#8C827A] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C827A]" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F4EFEA] border border-[#D9D2C7] rounded px-3 py-2 pl-9 text-sm text-[#201D1C] focus:outline-none focus:border-[#C85A28]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3 bg-[#201D1C] text-[#FAF8F5] font-mono text-xs uppercase tracking-widest hover:bg-[#C85A28] transition-colors rounded flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "login" ? "ACCESS VAULT" : "CREATE VAULT ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
};

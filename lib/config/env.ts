/**
 * Server-Side Environment Configuration & Validation Utility.
 *
 * Strict security principles:
 * 1. Read process.env strictly on the server (never exposed to browser bundles).
 * 2. Never log or print API keys, secrets, or credential values in errors or logs.
 * 3. Support deterministic fallback when GEMINI_API_KEY is not configured locally or in CI.
 */

export interface AppEnvConfig {
  databaseUrl: string;
  authSecret: string;
  isGeminiConfigured: boolean;
  port: number;
  nodeEnv: string;
}

export function getServerEnv(): AppEnvConfig {
  const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
  const authSecret = process.env.AUTH_SECRET || "default_dev_secret_change_in_production_32chars!";
  const isGeminiConfigured = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0;
  const port = parseInt(process.env.PORT || "3001", 10);
  const nodeEnv = process.env.NODE_ENV || "development";

  return {
    databaseUrl,
    authSecret,
    isGeminiConfigured,
    port,
    nodeEnv,
  };
}

/**
 * Validates and retrieves the Gemini API key strictly on the server.
 * Throws a clean error message without revealing any secret or environment fragments.
 */
export function getGeminiApiKey(): string {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key.trim().length === 0) {
    throw new Error("GEMINI_API_KEY is required for the live Gemini provider.");
  }
  return key.trim();
}

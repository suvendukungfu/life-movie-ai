import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { AuthUser } from "./types";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "lifemovie_super_secret_jwt_key_2026_production"
);

export const COOKIE_NAME = "lm_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: AuthUser): Promise<string> {
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload || !payload.id || !payload.email) {
      return null;
    }
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: (payload.name as string) || (payload.email as string).split("@")[0],
      avatarUrl: payload.avatarUrl as string | undefined,
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

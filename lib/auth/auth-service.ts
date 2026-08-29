import { AuthUser, SessionContext } from "./types";
import { COOKIE_NAME, verifySessionToken } from "./session";
import { prisma } from "@/lib/db/client";

export class AuthService {
  /**
   * Resolves the authenticated user from the HTTP-only cookie or Authorization Bearer token.
   * Cryptographically verifies the JWT signature against AUTH_SECRET.
   */
  static async getSession(req: Request): Promise<SessionContext> {
    let token: string | null = null;

    // 1. Check Authorization header
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.replace("Bearer ", "").trim();
    }

    // 2. Check HTTP-only cookie
    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
        if (match) {
          token = decodeURIComponent(match[1]);
        }
      }
    }

    if (!token) {
      return { user: null as unknown as AuthUser, isAuthenticated: false };
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return { user: null as unknown as AuthUser, isAuthenticated: false };
    }

    try {
      const { ensureDbSchema } = await import("@/lib/db/client");
      await ensureDbSchema();

      // Check user exists in database
      const dbUser = await prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, name: true, avatarUrl: true, createdAt: true },
      });

      if (!dbUser) {
        return { user: null as unknown as AuthUser, isAuthenticated: false };
      }

      return {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          avatarUrl: dbUser.avatarUrl || undefined,
          createdAt: dbUser.createdAt.toISOString(),
        },
        isAuthenticated: true,
      };
    } catch {
      return { user: null as unknown as AuthUser, isAuthenticated: false };
    }
  }

  /**
   * Strictly enforces project ownership.
   */
  static verifyProjectOwnership(userId: string, projectUserId: string): boolean {
    return userId === projectUserId;
  }
}

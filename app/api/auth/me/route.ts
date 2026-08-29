import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth-service";

export async function GET(req: Request) {
  const session = await AuthService.getSession(req);
  if (!session.isAuthenticated || !session.user) {
    return NextResponse.json({ success: false, authenticated: false, user: null }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    authenticated: true,
    user: session.user,
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/client";
import { hashPassword, createSessionToken, COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ success: false, error: "Email and password are required." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail.includes("@") || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email and password (minimum 6 characters)." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email address already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userName = name && typeof name === "string" ? name.trim() : cleanEmail.split("@")[0];

    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        name: userName,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    const token = await createSessionToken({
      ...newUser,
      createdAt: newUser.createdAt.toISOString(),
      avatarUrl: newUser.avatarUrl || undefined,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt.toISOString(),
      },
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Registration failed.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

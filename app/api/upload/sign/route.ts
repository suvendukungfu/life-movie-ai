import { NextResponse } from "next/server";
import { AuthService } from "@/lib/auth/auth-service";
import { ObjectStorageService, SignedUploadRequest } from "@/lib/storage/object-storage";
import { rateLimiter } from "@/lib/security/rate-limiter";

export async function POST(req: Request) {
  const session = await AuthService.getSession(req);
  const userId = session.isAuthenticated && session.user ? session.user.id : "anonymous";
  const rate = rateLimiter.check(`upload_${userId}`, 40, 60000);
  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, error: "Upload rate limit reached. Please wait before uploading more files." },
      { status: 429 }
    );
  }

  try {
    const body: SignedUploadRequest = await req.json();

    if (!body.fileName || !body.mimeType || !body.projectId) {
      return NextResponse.json(
        { success: false, error: "fileName, mimeType, and projectId are required." },
        { status: 400 }
      );
    }

    const signed = await ObjectStorageService.createSignedUploadUrl(body);
    return NextResponse.json({ success: true, ...signed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to generate upload authorization.";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

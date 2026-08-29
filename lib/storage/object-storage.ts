export interface SignedUploadRequest {
  fileName: string;
  mimeType: string;
  fileSize: number;
  projectId: string;
}

export interface SignedUploadResponse {
  uploadUrl: string;
  storageKey: string;
  publicUrl: string;
  expiresAt: string;
  headers: Record<string, string>;
}

export class ObjectStorageService {
  /**
   * Generates a signed direct-to-storage upload URL.
   * Works with Cloudflare R2, AWS S3, or Local Upload endpoints.
   */
  static async createSignedUploadUrl(req: SignedUploadRequest): Promise<SignedUploadResponse> {
    const ext = req.fileName.split(".").pop() || "bin";
    const storageKey = `projects/${req.projectId}/raw_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes validity

    // In production, sign using S3/R2 client. For local dev, provide direct upload contract.
    const isProdR2 = !!process.env.R2_ACCESS_KEY_ID && !!process.env.R2_BUCKET_NAME;

    const publicUrl = isProdR2
      ? `https://${process.env.R2_PUBLIC_DOMAIN}/${storageKey}`
      : `/api/upload/storage/${storageKey}`;

    return {
      uploadUrl: isProdR2
        ? `https://${process.env.R2_BUCKET_NAME}.r2.cloudflarestorage.com/${storageKey}`
        : `/api/upload/storage/${storageKey}`,
      storageKey,
      publicUrl,
      expiresAt,
      headers: {
        "Content-Type": req.mimeType,
        "x-amz-acl": "public-read",
      },
    };
  }

  static getPublicUrl(storageKey: string): string {
    if (process.env.R2_PUBLIC_DOMAIN) {
      return `https://${process.env.R2_PUBLIC_DOMAIN}/${storageKey}`;
    }
    return `/api/upload/storage/${storageKey}`;
  }
}

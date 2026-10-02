import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
  getCloudinary,
  isCloudinaryConfigured,
  optimizeCloudinaryUrl,
} from "@/lib/cloudinary";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const VIDEO_TYPES = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

function storefrontPublicRoot() {
  if (process.env.METMA_DE_PUBLIC_DIR?.trim()) {
    return path.resolve(process.env.METMA_DE_PUBLIC_DIR.trim());
  }
  return path.resolve(process.cwd(), "..", "metma-de", "public");
}

function mediaBaseUrl(site: string) {
  if (site === "Bg") {
    return (
      process.env.NEXT_PUBLIC_SITE_BG_URL?.replace(/\/$/, "") ||
      "http://localhost:3000"
    );
  }
  if (site === "Usa") {
    return (
      process.env.NEXT_PUBLIC_SITE_USA_URL?.replace(/\/$/, "") ||
      "http://localhost:3002"
    );
  }
  return (
    process.env.NEXT_PUBLIC_SITE_DE_URL?.replace(/\/$/, "") ||
    "http://localhost:3001"
  );
}

function mimeExt(type: string) {
  switch (type) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/svg+xml":
      return ".svg";
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    case "video/quicktime":
      return ".mov";
    default:
      return ".bin";
  }
}

export const maxDuration = 300;

/** Primary: Cloudinary (one free place for all sites). Fallback: local public. */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const site = String(form.get("site") ?? "De");
    const altText = String(form.get("altText") ?? "");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Липсва файл" }, { status: 400 });
    }

    const isImage = IMAGE_TYPES.has(file.type);
    const isVideo = VIDEO_TYPES.has(file.type);
    if (!isImage && !isVideo) {
      return NextResponse.json(
        {
          error:
            "Разрешени са изображения (jpeg, png, webp, gif, svg) и видео (mp4, webm, mov).",
        },
        { status: 400 },
      );
    }

    const max = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
    if (file.size > max) {
      return NextResponse.json(
        {
          error: isVideo
            ? "Видеото е твърде голямо (макс. 200 MB)."
            : "Файлът е твърде голям (макс. 8 MB).",
        },
        { status: 400 },
      );
    }

    const safeSite = site.replace(/[^a-zA-Z0-9_-]/g, "") || "De";
    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || mimeExt(file.type);
    const base = path
      .basename(file.name, path.extname(file.name))
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);
    const kind = isVideo ? "video" : "image";
    const fileName = `${base || kind}-${randomUUID().slice(0, 8)}${ext}`;

    if (isCloudinaryConfigured()) {
      const cld = getCloudinary();
      const resourceType = isVideo ? "video" : "image";
      const uploaded = await new Promise<{
        secure_url: string;
        public_id: string;
        bytes: number;
        format?: string;
      }>((resolve, reject) => {
        const upload = isVideo
          ? cld.uploader.upload_chunked_stream.bind(cld.uploader)
          : cld.uploader.upload_stream.bind(cld.uploader);
        const stream = upload(
          {
            folder: `metma/${safeSite}`,
            public_id: `${base || kind}-${randomUUID().slice(0, 8)}`,
            resource_type: resourceType,
            overwrite: false,
            // Images: max 1600px. Videos: chunked so files over 100 MB can upload.
            ...(isImage
              ? {
                  transformation: [
                    { width: 1600, height: 1600, crop: "limit" },
                    { quality: "auto:good", fetch_format: "auto" },
                  ],
                }
              : { chunk_size: 20_000_000 }),
          },
          (err, result) => {
            if (err || !result) reject(err ?? new Error("Cloudinary fail"));
            else
              resolve({
                secure_url: result.secure_url!,
                public_id: result.public_id!,
                bytes: result.bytes ?? file.size,
                format: result.format,
              });
          },
        );
        stream.end(buffer);
      });

      return NextResponse.json({
        fileName: file.name,
        contentType: file.type,
        sizeBytes: uploaded.bytes,
        publicUrl: optimizeCloudinaryUrl(uploaded.secure_url),
        altText: altText || null,
        r2Key: uploaded.public_id,
        storagePath: uploaded.public_id,
        kind: isVideo ? "video" : "image",
        provider: "cloudinary",
      });
    }

    // Fallback — local storefront public (no Cloudinary yet)
    const relWeb = `/images/uploads/${safeSite}/${fileName}`;
    const absDir = path.join(
      storefrontPublicRoot(),
      "images",
      "uploads",
      safeSite,
    );
    await mkdir(absDir, { recursive: true });
    await writeFile(path.join(absDir, fileName), buffer);

    try {
      const adminDir = path.join(process.cwd(), "public", "uploads", safeSite);
      await mkdir(adminDir, { recursive: true });
      await writeFile(path.join(adminDir, fileName), buffer);
    } catch {
      /* optional */
    }

    return NextResponse.json({
      fileName,
      contentType: file.type,
      sizeBytes: file.size,
      publicUrl: `${mediaBaseUrl(safeSite)}${relWeb}`,
      altText: altText || null,
      r2Key: `images/uploads/${safeSite}/${fileName}`,
      storagePath: relWeb,
      kind: isVideo ? "video" : "image",
      provider: "local",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Неуспешно качване";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function getCloudinary() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary не е конфигуриран");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  return cloudinary;
}

/**
 * Delivery URL with auto format (webp/avif) + quality + max width.
 * Works for any res.cloudinary.com URL already in Firestore.
 */
export function optimizeCloudinaryUrl(
  url: string,
  opts?: { width?: number; quality?: string },
) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  if (url.includes("/video/upload/")) return url;
  // Already transformed
  if (/\/upload\/[^/]*f_auto/.test(url)) return url;

  const width = opts?.width ?? 1600;
  const quality = opts?.quality ?? "auto:good";
  const transform = `f_auto,q_${quality},c_limit,w_${width}`;
  return url.replace("/upload/", `/upload/${transform}/`);
}

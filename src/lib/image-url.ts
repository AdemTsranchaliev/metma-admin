/**
 * Square Cloudinary thumbnail. Rewrites an existing delivery transform
 * so list views do not download the full 1600px asset.
 */
export function thumbUrl(url: string | null | undefined, width = 96) {
  if (!url) return "";
  const marker = "/image/upload/";
  const at = url.indexOf(marker);
  if (!url.includes("res.cloudinary.com") || at < 0) return url;

  const rest = url.slice(at + marker.length);
  const slash = rest.indexOf("/");
  const first = slash === -1 ? rest : rest.slice(0, slash);
  const isTransform =
    first.includes(",") || /^(f_|q_|c_|w_|h_|g_|e_)/.test(first);
  const publicId = isTransform && slash !== -1 ? rest.slice(slash + 1) : rest;
  const transform = `f_auto,q_auto,c_fill,g_auto,w_${width},h_${width}`;
  return `${url.slice(0, at)}${marker}${transform}/${publicId}`;
}

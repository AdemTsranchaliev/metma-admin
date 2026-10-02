import { thumbUrl } from "@/lib/image-url";

export function AdminThumb({
  src,
  alt = "",
  className,
  width = 96,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  width?: number;
}) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={thumbUrl(src, width)}
      alt={alt}
      width={width}
      height={width}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      className={className}
    />
  );
}

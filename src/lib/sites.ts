export type SiteCode = "Bg" | "De" | "Usa";

export const SITE_OPTIONS: { code: SiteCode; label: string }[] = [
  { code: "De", label: "Германия (DE)" },
  { code: "Bg", label: "България (BG)" },
  { code: "Usa", label: "САЩ (USA)" },
];

export const COOKIE_SITE = "metma-admin-site";

const LOCAL_ORIGINS: Record<SiteCode, string> = {
  De: "http://localhost:3001",
  Bg: "http://localhost:3000",
  Usa: "http://localhost:3002",
};

const LIVE_ORIGINS: Record<SiteCode, string> = {
  De: "https://metma-de.com",
  Bg: "https://metma-bg.com",
  Usa: "https://metma-usa.com",
};

/** True when admin runs on localhost / 127.0.0.1 */
export function isLocalRuntime() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1";
  }
  return process.env.NODE_ENV === "development";
}

/** Local Next storefront (admin “open site”) */
export function siteLocalOrigin(site: SiteCode) {
  return LOCAL_ORIGINS[site];
}

/**
 * Public site origin for product / QR redirects:
 * - localhost → local storefront ports
 * - deployed → live domain (or NEXT_PUBLIC_SITE_*_URL override)
 */
export function sitePublicOrigin(site: SiteCode) {
  const envKey =
    site === "De"
      ? process.env.NEXT_PUBLIC_SITE_DE_URL
      : site === "Bg"
        ? process.env.NEXT_PUBLIC_SITE_BG_URL
        : process.env.NEXT_PUBLIC_SITE_USA_URL;

  if (envKey?.trim()) {
    return envKey.replace(/\/$/, "");
  }

  return isLocalRuntime() ? LOCAL_ORIGINS[site] : LIVE_ORIGINS[site];
}

/**
 * Product URL path as on the live site:
 * https://metma-de.com/{slug}/  (or localhost:3001/{slug}/ when local)
 */
export function productPublicUrl(site: SiteCode, productSlug: string) {
  const slug = productSlug.replace(/^\/+|\/+$/g, "");
  return `${sitePublicOrigin(site)}/${slug}/`;
}

/**
 * Unique shareable QR short-link (admin /go/…).
 */
export function qrPublicUrl(site: SiteCode, code: string, origin?: string) {
  const base =
    origin ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3003");
  const root = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, "") ?? "";
  return `${base}${root}/go/?c=${encodeURIComponent(code)}&site=${site}`;
}

/**
 * The new German catalog. metma-de.com still serves the old WordPress
 * pages, which have a title and no product content.
 */
const DE_CATALOG_ORIGIN = "https://metma-de.com";

/**
 * Final URL after scanning /go/…
 * Prefer optional forwardUrl; otherwise redirectUrl (with DE legacy rewrite).
 */
export function resolveQrDestination(link: {
  redirectUrl?: string | null;
  forwardUrl?: string | null;
  productSlug?: string | null;
}) {
  const override = link.forwardUrl?.trim() ?? "";
  if (override) return override;

  const target = link.redirectUrl?.trim() ?? "";
  const slug = (link.productSlug ?? "").replace(/^\/+|\/+$/g, "");
  if (!target || !slug) return target;

  try {
    const url = new URL(target);
    const host = url.hostname.replace(/^www\./, "");
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, "");
    const legacyRoot =
      host === "metma-de.com" &&
      path.length > 1 &&
      !path.startsWith("/produkte");
    if (legacyRoot) {
      return `${DE_CATALOG_ORIGIN}/produkte/${slug}/`;
    }
  } catch {
    return target;
  }

  return target;
}

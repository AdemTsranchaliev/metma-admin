import type {
  BlogPost,
  MediaAsset,
  Page,
  Product,
  ProductCategory,
  QrLink,
  Site,
  SiteCode,
} from "./types";
import { DEFAULT_PRODUCT_CATEGORIES } from "./types";
import { productPublicUrl } from "./sites";

export const MOCK_SITES: (Site & { code: SiteCode })[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    code: "Bg",
    name: "METMA Bulgaria",
    domain: "metma.bg",
    defaultLocale: "bg-BG",
    isActive: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    code: "De",
    name: "METMA Germany",
    domain: "metma-de.com",
    defaultLocale: "de-DE",
    isActive: true,
  },
  {
    id: "11111111-1111-1111-1111-111111111103",
    code: "Usa",
    name: "METMA USA",
    domain: "metma-usa.com",
    defaultLocale: "en-US",
    isActive: true,
  },
];

const siteId = (code: SiteCode) =>
  MOCK_SITES.find((s) => s.code === code)!.id;

export function mockCategories(siteCode: SiteCode): ProductCategory[] {
  const sid = siteId(siteCode);
  return DEFAULT_PRODUCT_CATEGORIES.map((c, i) => ({
    id: `cat-${siteCode.toLowerCase()}-${c.slug}`,
    siteId: sid,
    ...c,
    sortOrder: c.sortOrder || i + 1,
  }));
}

/** Absolute URL so admin can preview site assets while designing */
const siteImage = (path: string) => `http://localhost:3001${path}`;

/** Catalog mirrored from metma-de `data/home.ts` — no prices */
const SITE_PRODUCTS: Omit<Product, "siteId">[] = [
  {
    id: "B597",
    sku: "B597",
    category: "dekorationen",
    name: "Ostern Dekoration Marker 5 Stück (B597)",
    slug: "ostern-dekoration-marker-5-stuck-b597",
    shortDescription:
      "5 Dekorationsmarker für kreative Muster und Details auf Ostereiern.",
    description:
      "Mit den METMA Dekorationsmarkern lassen sich Ostereier einfach verzieren — für feine Linien, Muster und persönliche Botschaften.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/markers.png"),
    imageUrls: [siteImage("/images/products/markers.png")],
    videoUrl: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "B571",
    sku: "B571",
    category: "sets",
    name: "Häschen-Set 5 Farben von Tabletten + Etiketten + Aufkleber",
    slug: "haschen-set-5-farben",
    shortDescription:
      "Fröhliches Häschen-Set mit 5 Farbtabletten, Etiketten und Aufklebern.",
    description:
      "Das Häschen-Set bringt Farbe und Spielspaß zusammen: fünf Farbtabletten plus Etiketten und Aufkleber.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/haeschen.png"),
    imageUrls: [siteImage("/images/products/haeschen.png")],
    videoUrl: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "B558",
    sku: "B558",
    category: "sets",
    name: "Eierfarben Komplekt Tabletten + Schalen (B558)",
    slug: "eierfarben-komplekt-tabletten-schalen-b558",
    shortDescription:
      "Komplettset mit Farbtabletten und Schalen — alles fürs Färben bereit.",
    description:
      "Praktisches Komplettset für den Start: Farbtabletten und Schalen in einer Packung.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/schalen.png"),
    imageUrls: [siteImage("/images/products/schalen.png")],
    videoUrl: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "P101",
    sku: "P101",
    category: "sets",
    name: "Komplekt Magie (Р101)",
    slug: "komplekt-magie-p101",
    shortDescription:
      "Magisches Osterset für besondere Effekte und leuchtende Farben.",
    description:
      "Das Magie-Set ist für alle, die Ostereier mit besonderen Effekten gestalten möchten.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/magie.png"),
    imageUrls: [siteImage("/images/products/magie.png")],
    videoUrl: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 4,
  },
  {
    id: "P112",
    sku: "P112",
    category: "dekorationen",
    name: "Osterei Maler 3 Stück (Р112)",
    slug: "osterei-maler-3-stuck-p112",
    shortDescription:
      "3 Malstifte für individuelle Motive und bunte Details auf Eiern.",
    description:
      "Mit den Osterei-Malern entstehen persönliche Motive und feine Verzierungen.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/maler.png"),
    imageUrls: [siteImage("/images/products/maler.png")],
    videoUrl: null,
    isFeatured: false,
    isActive: true,
    sortOrder: 5,
  },
  {
    id: "B599",
    sku: "B599",
    category: "farbstoffe",
    name: "Eierfarben 5 Farben Marmor (B599)",
    slug: "eierfarben-5-farben-marmor-b599",
    shortDescription:
      "5 Marmor-Farben für einzigartige, marmorierte Ostereier.",
    description:
      "Die Marmor-Serie erzeugt lebendige, gemaserte Effekte auf dem Ei.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/marmor.png"),
    imageUrls: [siteImage("/images/products/marmor.png")],
    videoUrl: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 6,
  },
  {
    id: "B603",
    sku: "B603",
    category: "farbstoffe",
    name: "Eierfarben 5 Farben Pastell (B603)",
    slug: "eierfarben-5-farben-pastell-b603",
    shortDescription:
      "5 zarte Pastellfarben für weiche, elegante Oster-Looks.",
    description:
      "Pastell bringt ruhige, moderne Töne aufs Ei.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/pastell.png"),
    imageUrls: [siteImage("/images/products/pastell.png")],
    videoUrl: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 7,
  },
  {
    id: "B600",
    sku: "B600",
    category: "farbstoffe",
    name: "Eierfarben 5 Farben Brilant (B600)",
    slug: "eierfarben-5-farben-brilant-b600",
    shortDescription:
      "5 brillante Farben für kräftige, leuchtende Ostereier.",
    description:
      "Brilant steht für sattes, leuchtendes Farbergebnis.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/brilant.png"),
    imageUrls: [siteImage("/images/products/brilant.png")],
    videoUrl: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 8,
  },
  {
    id: "B601",
    sku: "B601",
    category: "farbstoffe",
    name: "Eierfarben 5 Farben Flüssig + Schnellack (B601)",
    slug: "eierfarben-5-farben-flussig-schnellack-b601",
    shortDescription:
      "5 Flüssigfarben plus Schnellack für Glanz und schnelles Ergebnis.",
    description:
      "Flüssigfarbe mit Schnellack kombiniert Farbe und Finish.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/fluessig.png"),
    imageUrls: [siteImage("/images/products/fluessig.png")],
    videoUrl: null,
    isFeatured: false,
    isActive: true,
    sortOrder: 9,
  },
  {
    id: "B604",
    sku: "B604",
    category: "farbstoffe",
    name: "Eierfarben 5 Farben Tabletten + Kristall (B604)",
    slug: "eierfarben-5-farben-tabletten-kristall-b604",
    shortDescription:
      "5 Farbtabletten mit Kristall-Effekt für glitzernde Ostereier.",
    description:
      "Tabletten plus Kristall-Effekt sorgen für Farbe und Funkeln.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/kristall.png"),
    imageUrls: [siteImage("/images/products/kristall.png")],
    videoUrl: null,
    isFeatured: false,
    isActive: true,
    sortOrder: 10,
  },
  {
    id: "B598",
    sku: "B598",
    category: "farbstoffe",
    name: "Eierfarben 5 Farben Flüssig für kaltes Wasser",
    slug: "eierfarben-5-farben-flussig-kaltes-wasser",
    shortDescription:
      "5 Flüssigfarben speziell für die Anwendung in kaltem Wasser.",
    description:
      "Diese Flüssigserie ist für kaltes Wasser ausgelegt.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/kalt.png"),
    imageUrls: [siteImage("/images/products/kalt.png")],
    videoUrl: null,
    isFeatured: false,
    isActive: true,
    sortOrder: 11,
  },
  {
    id: "B593",
    sku: "B593",
    category: "farbstoffe",
    name: "Eierfarben 5 Farben Eierglanz + Goldglitter (B593)",
    slug: "eierfarben-5-farben-eierglanz-goldglitter-b593",
    shortDescription:
      "5 Farben mit Eierglanz und Goldglitter für festlichen Schimmer.",
    description:
      "Eierglanz plus Goldglitter verleihen Ostereiern festlichen Glanz.",
    currency: "EUR",
    imageUrl: siteImage("/images/products/gold.png"),
    imageUrls: [siteImage("/images/products/gold.png")],
    videoUrl: null,
    isFeatured: true,
    isActive: true,
    sortOrder: 12,
  },
];

export function mockProducts(siteCode: SiteCode): Product[] {
  const sid = siteId(siteCode);
  return SITE_PRODUCTS.map((p) => ({ ...p, siteId: sid }));
}

export function mockPages(siteCode: SiteCode): Page[] {
  const sid = siteId(siteCode);
  return [
    {
      id: "pg-1",
      siteId: sid,
      title: "Home",
      slug: "home",
      heroTitle: "METMA",
      heroSubtitle: "Neue Art, Ostern zu färben",
      isPublished: true,
    },
    {
      id: "pg-2",
      siteId: sid,
      title: "Über uns",
      slug: "uber-uns",
      heroTitle: "Über uns",
      heroSubtitle: "Seit 1999 in Bulgarien",
      isPublished: true,
    },
    {
      id: "pg-3",
      siteId: sid,
      title: "Kontakt",
      slug: "kontakt",
      heroTitle: "Kontakt",
      isPublished: true,
    },
  ];
}

export function mockBlogPosts(siteCode: SiteCode): BlogPost[] {
  const sid = siteId(siteCode);
  return [
    {
      id: "b-1",
      siteId: sid,
      title: "Geschichte des Osterfestes",
      slug: "history-of-the-easter-holiday",
      excerpt: "Kurze Geschichte, große Farbe.",
      isPublished: true,
      publishedAtUtc: "2024-03-15T10:00:00Z",
    },
    {
      id: "b-2",
      siteId: sid,
      title: "So färbst du Ostereier richtig",
      slug: "so-faerbst-du-ostereier-richtig",
      excerpt: "Tipps von der Vorbereitung bis zum fertigen Ei.",
      isPublished: true,
      publishedAtUtc: "2024-03-22T10:00:00Z",
    },
    {
      id: "b-3",
      siteId: sid,
      title: "Pastell, Brillant oder Marmor?",
      slug: "pastell-brilant-marmor",
      excerpt: "Welche Farbserie passt zu dir?",
      isPublished: false,
      publishedAtUtc: null,
    },
  ];
}

export function mockMedia(siteCode: SiteCode): MediaAsset[] {
  const sid = siteId(siteCode);
  return [
    {
      id: "m-1",
      siteId: sid,
      fileName: "haeschen.png",
      contentType: "image/png",
      sizeBytes: 180_000,
      publicUrl: siteImage("/images/products/haeschen.png"),
      altText: "Häschen-Set",
    },
    {
      id: "m-2",
      siteId: sid,
      fileName: "marmor.png",
      contentType: "image/png",
      sizeBytes: 160_000,
      publicUrl: siteImage("/images/products/marmor.png"),
      altText: "Marmor Farben",
    },
  ];
}

export function mockQrLinks(siteCode: SiteCode): QrLink[] {
  const sid = siteId(siteCode);
  const products = mockProducts(siteCode).slice(0, 2);

  return products.map((p, i) => ({
    id: `qr-${siteCode.toLowerCase()}-${i + 1}`,
    siteId: sid,
    code: i === 0 ? "disp-b558" : "promo-marmor",
    redirectUrl: productPublicUrl(siteCode, p.slug),
    productId: p.id,
    productName: p.name,
    productSlug: p.slug,
    createdAtUtc: "2026-03-01T10:00:00Z",
  }));
}

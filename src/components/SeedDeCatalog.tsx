"use client";

import { useState } from "react";
import {
  fbSaveProduct,
  fbSaveQrLink,
  fbSaveMedia,
  siteIdFor,
} from "@/lib/firebase/store";
import { uploadFile } from "@/lib/api";
import { useFirebase } from "@/lib/api";
import { useAuth } from "@/lib/firebase/auth";
import type { SiteCode } from "@/lib/types";

const SITE: SiteCode = "De";

type SeedItem = {
  sku: string;
  nameDe: string;
  nameEn: string;
  category: "farbstoffe" | "sets" | "dekorationen";
  slug: string;
  redirectUrl: string;
  qrCode: string;
  imageFile: string;
  sortOrder: number;
  featured?: boolean;
};

/** Catalog + live shop URLs for DE */
const ITEMS: SeedItem[] = [
  {
    sku: "B-567",
    nameEn: "Egg dye 5 colors tablets for cold water",
    nameDe: "Eierfarben Tabletten zum Kaltfärben – 5 Farben",
    category: "farbstoffe",
    slug: "b-567-egg-dye-5-colors-tablets-for-cold-water",
    redirectUrl:
      "https://metma-de.com/б-567-egg-dye-5-colors-tablets-for-cold-water/",
    qrCode: "b-567",
    imageFile: "b-567.jpg",
    sortOrder: 1,
    featured: true,
  },
  {
    sku: "B-566",
    nameEn: "Egg dye 5 colors tablets for hot water",
    nameDe: "Eierfarben Tabletten zum Heißfärben – 5 Farben",
    category: "farbstoffe",
    slug: "b-566-egg-dye-5-colors-tablets-for-hot-water",
    redirectUrl:
      "https://metma-de.com/б-566-egg-dye-5-colors-tablets-for-hot-water/",
    qrCode: "b-566",
    imageFile: "b-566.jpg",
    sortOrder: 2,
    featured: true,
  },
  {
    sku: "B-568",
    nameEn: "Egg dye 5 colors liquid for cold water",
    nameDe: "Eierfarben Kraftvoll – 5 Farben flüssig",
    category: "farbstoffe",
    slug: "b-568-egg-dye-5-colors-liquid-for-cold-water",
    redirectUrl:
      "https://metma-de.com/б-568-egg-dye-5-colors-liquid-for-cold-water/",
    qrCode: "b-568",
    imageFile: "b-568.jpg",
    sortOrder: 3,
    featured: true,
  },
  {
    sku: "B-569",
    nameEn: "Egg dye 5 colors gelly egg dye",
    nameDe: "Eierfarben Marmoreffekt – 5 Farben",
    category: "farbstoffe",
    slug: "b-569-egg-dye-5-colors-gelly-egg-dye",
    redirectUrl: "https://metma-de.com/б-569-egg-dye-5-colors-gelly-egg-dye/",
    qrCode: "b-569",
    imageFile: "b-569.jpg",
    sortOrder: 4,
  },
  {
    sku: "B-577",
    nameEn: "Set 5 colors liquid + 5 bags",
    nameDe: "Eierfarben Einfach & Schnell – Set mit Beuteln",
    category: "sets",
    slug: "b-577-set-5-colors-liquid-5-bags",
    redirectUrl: "https://metma-de.com/б-577-set-5-colors-liquid-5-bags/",
    qrCode: "b-577",
    imageFile: "b-577.jpg",
    sortOrder: 5,
    featured: true,
  },
  {
    sku: "B-574",
    nameEn: "Egg dye 5 colors pearl",
    nameDe: "Eierfarben Brillant – 5 Farben",
    category: "farbstoffe",
    slug: "b-574-egg-dye-5-colors-pearl",
    redirectUrl: "https://metma-de.com/б-574-egg-dye-5-colors-pearl/",
    qrCode: "b-574",
    imageFile: "b-574.jpg",
    sortOrder: 6,
    featured: true,
  },
  {
    sku: "B-583",
    nameEn: "Easter pens for decoration - 5 pcs",
    nameDe: "Ostereier Malstifte – 5 Farben",
    category: "dekorationen",
    slug: "b-583-easter-pens-for-decoration-5-pcs",
    redirectUrl:
      "https://metma-de.com/б-583-easter-pens-for-decoration-5-pcs/",
    qrCode: "b-583",
    imageFile: "b-583.jpg",
    sortOrder: 7,
  },
  {
    sku: "B-576",
    nameEn: "Egg dye 3 colors liquid + lacquer + gold foil",
    nameDe: "Eierfarben Goldeffekt – 3 Farben",
    category: "farbstoffe",
    slug: "b-576-egg-dye-3-colors-liquid-laquer-gold-foil",
    redirectUrl:
      "https://metma-de.com/б-576-egg-dye-3-colors-liquid-laquer-gold-foil/",
    qrCode: "b-576",
    imageFile: "b-576.jpg",
    sortOrder: 8,
  },
  {
    sku: "B-575",
    nameEn: "Egg dye 3 colors liquid + lacquer + silver foil",
    nameDe: "Eierfarben Silbereffekt – 3 Farben",
    category: "farbstoffe",
    slug: "b-575-egg-dye-3-colors-liquid-laquer-silver-foil",
    redirectUrl:
      "https://metma-de.com/б-575-egg-dye-3-colors-liquid-laquer-silver-foil/",
    qrCode: "b-575",
    imageFile: "b-575.jpg",
    sortOrder: 9,
  },
  {
    sku: "P-130",
    nameEn: "Set Heroes",
    nameDe: "Set Superhelden – Osterhelden",
    category: "sets",
    slug: "set-heroes",
    redirectUrl: "https://metma-de.com/set-heroes/",
    qrCode: "p-130",
    imageFile: "p-130.jpg",
    sortOrder: 10,
    featured: true,
  },
  {
    sku: "P-133",
    nameEn: "Set Galaxy",
    nameDe: "Set Galaxie – Planeteneier",
    category: "sets",
    slug: "set-galaxy",
    redirectUrl: "https://metma-de.com/set-galaxy/",
    qrCode: "p-133",
    imageFile: "p-133.jpg",
    sortOrder: 11,
    featured: true,
  },
  {
    sku: "B-622-A",
    nameEn: "Decorative thermal stickers 6 pcs",
    nameDe: "Zauberkleidung – Dekorative Thermo-Banderole (6 St.)",
    category: "dekorationen",
    slug: "b-622-a-decorative-thermal-stickers-6-pcs",
    redirectUrl:
      "https://metma-de.com/b-622-а-decorative-thermal-stickers-6-pcs/",
    qrCode: "b-622-a",
    imageFile: "b-622-a.jpg",
    sortOrder: 12,
  },
  {
    sku: "B-622-B",
    nameEn: "Decorative thermal stickers 6 pcs – Unicorns",
    nameDe: "Zauberkleidung Einhörner – Thermo-Banderole (6 St.)",
    category: "dekorationen",
    slug: "b-622-b-decorative-thermal-stickers-6-pcs",
    redirectUrl:
      "https://metma-de.com/b-622-b-decorative-thermal-stickers-6-pcs-2/",
    qrCode: "b-622-b",
    imageFile: "b-622-b.jpg",
    sortOrder: 13,
  },
  {
    sku: "B-622-C",
    nameEn: "Decorative thermal stickers 6 pcs – Folk",
    nameDe: "Zauberkleidung Folklore – Thermo-Banderole (6 St.)",
    category: "dekorationen",
    slug: "b-622-c-decorative-thermal-stickers-6-pcs",
    redirectUrl:
      "https://metma-de.com/b-622-c-decorative-thermal-stickers-6-pcs-3/",
    qrCode: "b-622-c",
    imageFile: "b-622-c.jpg",
    sortOrder: 14,
  },
];

export function SeedDeCatalog() {
  const { user } = useAuth();
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  function push(msg: string) {
    setLog((prev) => [...prev, msg]);
  }

  async function run() {
    if (!useFirebase || !user) {
      push("Трябва Firebase login.");
      return;
    }
    setBusy(true);
    setDone(false);
    setLog([]);
    push(`Старт: ${ITEMS.length} продукта за site=De…`);

    for (const item of ITEMS) {
      try {
        const res = await fetch(`/images/products/catalog/${item.imageFile}`);
        if (!res.ok) throw new Error(`Липсва снимка ${item.imageFile}`);
        const blob = await res.blob();
        const file = new File([blob], item.imageFile, {
          type: blob.type || "image/jpeg",
        });

        let imageUrl = `/images/products/catalog/${item.imageFile}`;
        try {
          const upload = await uploadFile(SITE, file, item.nameDe);
          await fbSaveMedia(SITE, {
            fileName: upload.fileName,
            contentType: upload.contentType,
            sizeBytes: upload.sizeBytes,
            publicUrl: upload.publicUrl,
            altText: item.nameDe,
            storagePath: upload.storagePath ?? upload.r2Key,
          });
          imageUrl = upload.publicUrl;
          push(`↑ Host ${item.sku}`);
        } catch (err) {
          push(
            `⚠ Upload fail ${item.sku}, catalog path: ${
              err instanceof Error ? err.message : err
            }`,
          );
        }

        const product = await fbSaveProduct(SITE, {
          categoryId: null,
          category: item.category,
          sku: item.sku,
          name: item.nameDe,
          slug: item.slug,
          shortDescription: item.nameEn,
          description: `${item.nameDe}. ${item.nameEn}. Art.-Nr. ${item.sku}.`,
          price: null,
          currency: "EUR",
          imageUrl,
          imageUrls: [imageUrl],
          videoUrl: null,
          isFeatured: Boolean(item.featured),
          isActive: true,
          sortOrder: item.sortOrder,
        });

        await fbSaveQrLink(SITE, {
          code: item.qrCode,
          redirectUrl: item.redirectUrl,
          productId: product.id,
          productName: item.nameDe,
          productSlug: item.slug,
        });

        push(`✓ ${item.sku} → QR ${item.qrCode}`);
      } catch (err) {
        push(
          `✗ ${item.sku}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    push(`Готово. siteId=${siteIdFor(SITE)}`);
    setBusy(false);
    setDone(true);
  }

  if (!useFirebase) {
    return (
      <p className="text-sm text-red-600">
        Firebase не е включен (USE_FIREBASE).
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--admin-mute)]">
        Импортва {ITEMS.length} DE продукта със снимки + QR към metma-de.com
        линковете. Изисква логнат админ.
      </p>
      <button
        type="button"
        disabled={busy || !user}
        onClick={() => void run()}
        className="rounded-lg bg-[var(--admin-ink)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {busy ? "Импортиране…" : "Импортирай DE каталог + QR"}
      </button>
      {done ? (
        <p className="text-sm font-semibold text-green-700">
          Готово — провери Продукти / QR и http://localhost:3001/produkte
        </p>
      ) : null}
      <pre className="max-h-96 overflow-auto rounded-lg border border-[var(--admin-line)] bg-[var(--admin-sand)] p-3 text-xs leading-5">
        {log.length ? log.join("\n") : "Логът ще се появи тук…"}
      </pre>
    </div>
  );
}

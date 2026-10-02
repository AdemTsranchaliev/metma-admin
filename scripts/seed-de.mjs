/**
 * One-shot seed — run: node scripts/seed-de.mjs
 * Uses env or argv; does not write secrets to disk permanently.
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const CATALOG = resolve(ROOT, "public/images/products/catalog");

const email = process.env.SEED_EMAIL || process.argv[2];
const password = process.env.SEED_PASSWORD || process.argv[3];

if (!email || !password) {
  console.error("Usage: SEED_EMAIL=... SEED_PASSWORD=... node scripts/seed-de.mjs");
  process.exit(1);
}

const app = initializeApp({
  apiKey: "AIzaSyB7lyONAEf7mazRUPQEYWzvW_oeEjPsNkg",
  authDomain: "metma-d78fd.firebaseapp.com",
  projectId: "metma-d78fd",
  storageBucket: "metma-d78fd.firebasestorage.app",
  messagingSenderId: "549679796172",
  appId: "1:549679796172:web:c05c4fc96b931cb8eb1769",
});

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const SITE = "De";
const SITE_ID = "11111111-1111-1111-1111-111111111102";

const ITEMS = [
  {
    sku: "B-567",
    nameDe: "Eierfarben Tabletten zum Kaltfärben – 5 Farben",
    nameEn: "Egg dye 5 colors tablets for cold water",
    category: "farbstoffe",
    slug: "b-567-egg-dye-5-colors-tablets-for-cold-water",
    redirectUrl:
      "https://metma-de.com/\u0431-567-egg-dye-5-colors-tablets-for-cold-water/",
    qrCode: "b-567",
    imageFile: "b-567.jpg",
    sortOrder: 1,
    featured: true,
  },
  {
    sku: "B-566",
    nameDe: "Eierfarben Tabletten zum Heißfärben – 5 Farben",
    nameEn: "Egg dye 5 colors tablets for hot water",
    category: "farbstoffe",
    slug: "b-566-egg-dye-5-colors-tablets-for-hot-water",
    redirectUrl:
      "https://metma-de.com/\u0431-566-egg-dye-5-colors-tablets-for-hot-water/",
    qrCode: "b-566",
    imageFile: "b-566.jpg",
    sortOrder: 2,
    featured: true,
  },
  {
    sku: "B-568",
    nameDe: "Eierfarben Kraftvoll – 5 Farben flüssig",
    nameEn: "Egg dye 5 colors liquid for cold water",
    category: "farbstoffe",
    slug: "b-568-egg-dye-5-colors-liquid-for-cold-water",
    redirectUrl:
      "https://metma-de.com/\u0431-568-egg-dye-5-colors-liquid-for-cold-water/",
    qrCode: "b-568",
    imageFile: "b-568.jpg",
    sortOrder: 3,
    featured: true,
  },
  {
    sku: "B-569",
    nameDe: "Eierfarben Marmoreffekt – 5 Farben",
    nameEn: "Egg dye 5 colors gelly egg dye",
    category: "farbstoffe",
    slug: "b-569-egg-dye-5-colors-gelly-egg-dye",
    redirectUrl:
      "https://metma-de.com/\u0431-569-egg-dye-5-colors-gelly-egg-dye/",
    qrCode: "b-569",
    imageFile: "b-569.jpg",
    sortOrder: 4,
    featured: false,
  },
  {
    sku: "B-577",
    nameDe: "Eierfarben Einfach & Schnell – Set mit Beuteln",
    nameEn: "Set 5 colors liquid + 5 bags",
    category: "sets",
    slug: "b-577-set-5-colors-liquid-5-bags",
    redirectUrl:
      "https://metma-de.com/\u0431-577-set-5-colors-liquid-5-bags/",
    qrCode: "b-577",
    imageFile: "b-577.jpg",
    sortOrder: 5,
    featured: true,
  },
  {
    sku: "B-574",
    nameDe: "Eierfarben Brillant – 5 Farben",
    nameEn: "Egg dye 5 colors pearl",
    category: "farbstoffe",
    slug: "b-574-egg-dye-5-colors-pearl",
    redirectUrl: "https://metma-de.com/\u0431-574-egg-dye-5-colors-pearl/",
    qrCode: "b-574",
    imageFile: "b-574.jpg",
    sortOrder: 6,
    featured: true,
  },
  {
    sku: "B-583",
    nameDe: "Ostereier Malstifte – 5 Farben",
    nameEn: "Easter pens for decoration - 5 pcs",
    category: "dekorationen",
    slug: "b-583-easter-pens-for-decoration-5-pcs",
    redirectUrl:
      "https://metma-de.com/\u0431-583-easter-pens-for-decoration-5-pcs/",
    qrCode: "b-583",
    imageFile: "b-583.jpg",
    sortOrder: 7,
    featured: false,
  },
  {
    sku: "B-576",
    nameDe: "Eierfarben Goldeffekt – 3 Farben",
    nameEn: "Egg dye 3 colors liquid + lacquer + gold foil",
    category: "farbstoffe",
    slug: "b-576-egg-dye-3-colors-liquid-laquer-gold-foil",
    redirectUrl:
      "https://metma-de.com/\u0431-576-egg-dye-3-colors-liquid-laquer-gold-foil/",
    qrCode: "b-576",
    imageFile: "b-576.jpg",
    sortOrder: 8,
    featured: false,
  },
  {
    sku: "B-575",
    nameDe: "Eierfarben Silbereffekt – 3 Farben",
    nameEn: "Egg dye 3 colors liquid + lacquer + silver foil",
    category: "farbstoffe",
    slug: "b-575-egg-dye-3-colors-liquid-laquer-silver-foil",
    redirectUrl:
      "https://metma-de.com/\u0431-575-egg-dye-3-colors-liquid-laquer-silver-foil/",
    qrCode: "b-575",
    imageFile: "b-575.jpg",
    sortOrder: 9,
    featured: false,
  },
  {
    sku: "P-130",
    nameDe: "Set Superhelden – Osterhelden",
    nameEn: "Set Heroes",
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
    nameDe: "Set Galaxie – Planeteneier",
    nameEn: "Set Galaxy",
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
    nameDe: "Zauberkleidung – Dekorative Thermo-Banderole (6 St.)",
    nameEn: "Decorative thermal stickers 6 pcs",
    category: "dekorationen",
    slug: "b-622-a-decorative-thermal-stickers-6-pcs",
    redirectUrl:
      "https://metma-de.com/b-622-\u0430-decorative-thermal-stickers-6-pcs/",
    qrCode: "b-622-a",
    imageFile: "b-622-a.jpg",
    sortOrder: 12,
    featured: false,
  },
  {
    sku: "B-622-B",
    nameDe: "Zauberkleidung Einhörner – Thermo-Banderole (6 St.)",
    nameEn: "Decorative thermal stickers 6 pcs – Unicorns",
    category: "dekorationen",
    slug: "b-622-b-decorative-thermal-stickers-6-pcs",
    redirectUrl:
      "https://metma-de.com/b-622-b-decorative-thermal-stickers-6-pcs-2/",
    qrCode: "b-622-b",
    imageFile: "b-622-b.jpg",
    sortOrder: 13,
    featured: false,
  },
  {
    sku: "B-622-C",
    nameDe: "Zauberkleidung Folklore – Thermo-Banderole (6 St.)",
    nameEn: "Decorative thermal stickers 6 pcs – Folk",
    category: "dekorationen",
    slug: "b-622-c-decorative-thermal-stickers-6-pcs",
    redirectUrl:
      "https://metma-de.com/b-622-c-decorative-thermal-stickers-6-pcs-3/",
    qrCode: "b-622-c",
    imageFile: "b-622-c.jpg",
    sortOrder: 14,
    featured: false,
  },
];

async function uploadImage(fileName) {
  const buf = readFileSync(resolve(CATALOG, fileName));
  const path = `sites/${SITE}/${Date.now()}-${fileName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, buf, { contentType: "image/jpeg" });
  const publicUrl = await getDownloadURL(storageRef);
  return { publicUrl, storagePath: path };
}

async function main() {
  console.log("Signing in…");
  await signInWithEmailAndPassword(auth, email, password);
  console.log("OK as", auth.currentUser?.email);

  for (const item of ITEMS) {
    let imageUrl = `/images/products/catalog/${item.imageFile}`;
    let storagePath = null;
    try {
      const up = await uploadImage(item.imageFile);
      imageUrl = up.publicUrl;
      storagePath = up.storagePath;
      console.log("↑", item.sku, "storage");
    } catch (e) {
      console.log("⚠ storage", item.sku, e.message || e);
    }

    if (storagePath) {
      await addDoc(collection(db, "media"), {
        site: SITE,
        siteId: SITE_ID,
        fileName: item.imageFile,
        contentType: "image/jpeg",
        sizeBytes: readFileSync(resolve(CATALOG, item.imageFile)).length,
        publicUrl: imageUrl,
        altText: item.nameDe,
        storagePath,
        updatedAt: serverTimestamp(),
      });
    }

    const productRef = await addDoc(collection(db, "products"), {
      site: SITE,
      siteId: SITE_ID,
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await addDoc(collection(db, "qrLinks"), {
      site: SITE,
      siteId: SITE_ID,
      code: item.qrCode,
      redirectUrl: item.redirectUrl,
      productId: productRef.id,
      productName: item.nameDe,
      productSlug: item.slug,
      createdAtUtc: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    });

    console.log("✓", item.sku, "→", item.qrCode, productRef.id);
  }

  console.log("DONE", ITEMS.length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

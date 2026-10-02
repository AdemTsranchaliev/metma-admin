/**
 * Seed the Bulgarian catalog into Firestore and Cloudinary.
 * SEED_EMAIL and SEED_PASSWORD come from the environment.
 * Cloudinary keys are read from metma-admin/.env.local.
 */
import { existsSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { v2 as cloudinary } from "cloudinary";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  setDoc,
  where,
  doc,
} from "firebase/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ADMIN = resolve(__dirname, "..");
const PUBLIC = resolve(ADMIN, "../metma-bg/public");
const DATA = "/tmp/bg-seed.json";

function loadEnv(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

loadEnv(resolve(ADMIN, ".env.local"));

const email = process.env.SEED_EMAIL;
const password = process.env.SEED_PASSWORD;
if (!email || !password) {
  console.error("Set SEED_EMAIL and SEED_PASSWORD");
  process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

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
const SITE = "Bg";
const SITE_ID = "11111111-1111-1111-1111-111111111101";

const CATEGORIES = [
  { slug: "boi", name: "Бои", description: "Таблетки, капсули и течни", sortOrder: 1 },
  { slug: "komplekti", name: "Комплекти", description: "Всичко за боядисване", sortOrder: 2 },
  { slug: "ukrasi", name: "Украси", description: "Стикери, трева и яйца", sortOrder: 3 },
  { slug: "displei", name: "Рекламни дисплеи", description: "Рекламни стойки", sortOrder: 4 },
];

const uploaded = new Map();

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function blocksToHtml(blocks) {
  return (blocks ?? [])
    .map((block) => {
      if (block.type === "h2") return `<h2>${escapeHtml(block.text)}</h2>`;
      if (block.type === "ul") {
        return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
      }
      return `<p>${escapeHtml(block.text)}</p>`;
    })
    .join("");
}

async function uploadImage(rel) {
  if (!rel) return rel;
  if (rel.startsWith("http")) return rel;
  if (uploaded.has(rel)) return uploaded.get(rel);
  const file = resolve(PUBLIC, rel.replace(/^\//, ""));
  if (!existsSync(file)) {
    console.warn("missing file", rel);
    uploaded.set(rel, rel);
    return rel;
  }
  const publicId =
    "metma-bg/" +
    rel
      .replace(/^\/images\//, "")
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^a-zA-Z0-9/_-]+/g, "-");
  const result = await cloudinary.uploader.upload(file, {
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
    unique_filename: false,
  });
  uploaded.set(rel, result.secure_url);
  return result.secure_url;
}

const { products, blogPosts } = JSON.parse(readFileSync(DATA, "utf8"));

await signInWithEmailAndPassword(auth, email, password);

const existing = await getDocs(query(collection(db, "products"), where("site", "==", SITE)));
if (existing.size > 0) {
  console.log("Bg products already present:", existing.size);
  process.exit(0);
}

for (const category of CATEGORIES) {
  await setDoc(doc(db, "categories", `cat-bg-${category.slug}`), {
    site: SITE,
    siteId: SITE_ID,
    name: category.name,
    slug: category.slug,
    description: category.description,
    sortOrder: category.sortOrder,
    isActive: true,
    updatedAt: serverTimestamp(),
  });
}
console.log("categories", CATEGORIES.length);

let index = 0;
for (const product of products) {
  index += 1;
  const images = [];
  for (const image of product.images?.length ? product.images : [product.image]) {
    images.push(await uploadImage(image));
  }
  await addDoc(collection(db, "products"), {
    site: SITE,
    siteId: SITE_ID,
    categoryId: `cat-bg-${product.category}`,
    category: product.category,
    brand: product.brand || "metma",
    sku: product.id,
    name: product.name,
    slug: product.slug,
    shortDescription: product.shortDescription || "",
    description: product.description || product.shortDescription || "",
    price: null,
    currency: "BGN",
    imageUrl: images[0] ?? null,
    imageUrls: images,
    videoUrl: null,
    isFeatured: Boolean(product.isFeatured),
    isActive: true,
    sortOrder: index,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  if (index % 10 === 0) console.log("products", index);
}
console.log("products", index);

for (const post of blogPosts) {
  const cover = await uploadImage(post.image);
  const images = [];
  for (const image of post.images ?? []) images.push(await uploadImage(image));
  await addDoc(collection(db, "blogPosts"), {
    site: SITE,
    siteId: SITE_ID,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || "",
    bodyHtml: blocksToHtml(post.content),
    coverImageUrl: cover,
    images,
    imagePosition: post.imagePosition || null,
    category: post.category || "Блог",
    kind: post.kind === "declaration" ? "declaration" : "story",
    isPublished: true,
    publishedAtUtc: post.date,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
console.log("posts", blogPosts.length);
console.log("images", uploaded.size);
process.exit(0);

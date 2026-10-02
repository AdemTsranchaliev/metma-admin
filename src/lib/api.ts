import { MOCK_SITES } from "./mock-data";
import {
  mockDeleteBlog,
  mockDeleteCategory,
  mockDeleteMedia,
  mockDeletePage,
  mockDeleteProduct,
  mockDeleteQrLink,
  mockGetBlog,
  mockGetCategories,
  mockGetMedia,
  mockGetPageBySlug,
  mockGetPages,
  mockGetProducts,
  mockGetQrLinkByCode,
  mockGetQrLinks,
  mockSaveBlog,
  mockSaveCategory,
  mockSaveMedia,
  mockSavePage,
  mockSaveProduct,
  mockSaveQrLink,
} from "./mock-store";
import { useFirebase, useMockData } from "./data-mode";
import { invalidateSite, readCached } from "./read-cache";
import {
  fbDashboardCounts,
  fbDeleteBlog,
  fbDeleteCategory,
  fbDeleteMedia,
  fbDeletePage,
  fbDeleteProduct,
  fbDeleteQrLink,
  fbGetBlog,
  fbGetCategories,
  fbGetMedia,
  fbGetPageBySlug,
  fbGetPages,
  fbGetProducts,
  fbGetQrLinkByCode,
  fbGetQrLinks,
  fbSaveBlog,
  fbSaveCategory,
  fbSaveMedia,
  fbSavePage,
  fbSaveProduct,
  fbSaveQrLink,
  fbUploadFile,
  siteIdFor,
} from "./firebase/store";
import type {
  BlogPost,
  MediaAsset,
  Page,
  Product,
  ProductCategory,
  ProductCategorySlug,
  QrLink,
  Site,
  SiteCode,
} from "./types";
import { DEFAULT_PRODUCT_CATEGORIES } from "./types";
import { newId } from "./utils";

export type {
  BlogPost,
  MediaAsset,
  Page,
  Product,
  ProductCategory,
  ProductCategorySlug,
  QrLink,
  Site,
  SiteCode,
} from "./types";
export { DEFAULT_PRODUCT_CATEGORIES, PRODUCT_CATEGORIES } from "./types";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5080";

export { useFirebase, useMockData };

function normalizeSiteCode(code: Site["code"]): SiteCode | null {
  if (code === "Bg" || code === 1 || code === "1") return "Bg";
  if (code === "De" || code === 2 || code === "2") return "De";
  if (code === "Usa" || code === 3 || code === "3") return "Usa";
  if (typeof code === "string") {
    const c = code.toLowerCase();
    if (c === "bg") return "Bg";
    if (c === "de") return "De";
    if (c === "usa") return "Usa";
  }
  return null;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `${response.status} ${response.statusText} — ${path}${text ? `: ${text}` : ""}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export async function getSites() {
  if (useFirebase || useMockData) return MOCK_SITES;

  const sites = await apiFetch<Site[]>("/api/sites");
  return sites.map((s) => ({
    ...s,
    code: normalizeSiteCode(s.code) ?? "De",
  })) as (Site & { code: SiteCode })[];
}

export async function resolveSiteId(siteCode: SiteCode) {
  if (useFirebase) return siteIdFor(siteCode);
  const sites = await getSites();
  const match = sites.find((s) => s.code === siteCode);
  if (!match) throw new Error(`Site not found: ${siteCode}`);
  return match.id;
}

export async function getDashboardCounts(siteCode: SiteCode) {
  return readCached(`counts:${siteCode}`, async () => {
    if (useFirebase) return fbDashboardCounts(siteCode);
    const [products, pages, posts, categories] = await Promise.all([
      getProducts(siteCode),
      getPages(siteCode),
      getBlogPosts(siteCode, false),
      getCategories(siteCode),
    ]);
    return {
      products: products.length,
      categories: categories.length,
      pages: pages.length,
      posts: posts.length,
    };
  });
}

export async function getProducts(siteCode: SiteCode, featuredOnly = false) {
  return readCached(`products:${siteCode}:${featuredOnly}`, () =>
    loadProducts(siteCode, featuredOnly),
  );
}

async function loadProducts(siteCode: SiteCode, featuredOnly = false) {
  if (useFirebase) return fbGetProducts(siteCode, featuredOnly);

  if (useMockData) {
    const list =
      typeof window === "undefined"
        ? (await import("./mock-data")).mockProducts(siteCode)
        : mockGetProducts(siteCode);
    return featuredOnly ? list.filter((p) => p.isFeatured) : list;
  }

  const params = new URLSearchParams({
    siteCode,
    featuredOnly: String(featuredOnly),
  });
  return apiFetch<Product[]>(`/api/products?${params}`);
}

export async function getPages(siteCode: SiteCode) {
  return readCached(`pages:${siteCode}`, () => loadPages(siteCode));
}

async function loadPages(siteCode: SiteCode) {
  if (useFirebase) return fbGetPages(siteCode);
  if (useMockData) {
    return typeof window === "undefined"
      ? (await import("./mock-data")).mockPages(siteCode)
      : mockGetPages(siteCode);
  }
  const siteId = await resolveSiteId(siteCode);
  return apiFetch<Page[]>(`/api/pages?siteId=${siteId}`);
}

export async function getPageBySlug(siteCode: SiteCode, slug: string) {
  if (useFirebase) return fbGetPageBySlug(siteCode, slug);
  if (useMockData) {
    if (typeof window === "undefined") {
      const pages = (await import("./mock-data")).mockPages(siteCode);
      return pages.find((p) => p.slug === slug && p.isPublished) ?? null;
    }
    return mockGetPageBySlug(siteCode, slug);
  }
  try {
    return await apiFetch<Page>(
      `/api/pages/by-slug?siteCode=${siteCode}&slug=${encodeURIComponent(slug)}`,
    );
  } catch {
    return null;
  }
}

export async function getBlogPosts(siteCode: SiteCode, publishedOnly = false) {
  return readCached(`blog:${siteCode}:${publishedOnly}`, () =>
    loadBlogPosts(siteCode, publishedOnly),
  );
}

async function loadBlogPosts(siteCode: SiteCode, publishedOnly = false) {
  if (useFirebase) return fbGetBlog(siteCode, publishedOnly);
  if (useMockData) {
    const list =
      typeof window === "undefined"
        ? (await import("./mock-data")).mockBlogPosts(siteCode)
        : mockGetBlog(siteCode);
    return publishedOnly ? list.filter((p) => p.isPublished) : list;
  }

  const siteId = await resolveSiteId(siteCode);
  const params = new URLSearchParams({
    siteId,
    publishedOnly: String(publishedOnly),
  });
  return apiFetch<BlogPost[]>(`/api/blogposts?${params}`);
}

export async function getMedia(siteCode: SiteCode) {
  return readCached(`media:${siteCode}`, () => loadMedia(siteCode));
}

async function loadMedia(siteCode: SiteCode) {
  if (useFirebase) return fbGetMedia(siteCode);
  if (useMockData) {
    return typeof window === "undefined"
      ? (await import("./mock-data")).mockMedia(siteCode)
      : mockGetMedia(siteCode);
  }
  const siteId = await resolveSiteId(siteCode);
  return apiFetch<MediaAsset[]>(`/api/media?siteId=${siteId}`);
}

export async function getCategories(siteCode: SiteCode) {
  return readCached(`categories:${siteCode}`, () => loadCategories(siteCode));
}

async function loadCategories(siteCode: SiteCode) {
  if (useFirebase) return fbGetCategories(siteCode);
  if (useMockData) {
    return typeof window === "undefined"
      ? (await import("./mock-data")).mockCategories(siteCode)
      : mockGetCategories(siteCode);
  }
  const siteId = await resolveSiteId(siteCode);
  return DEFAULT_PRODUCT_CATEGORIES.map((c, i) => ({
    id: `default-${c.slug}`,
    siteId,
    ...c,
    sortOrder: c.sortOrder || i + 1,
  }));
}

export type CategoryInput = {
  name: string;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export async function saveCategory(
  siteCode: SiteCode,
  input: CategoryInput,
  id?: string,
) {
  if (useFirebase) {
    const saved = await fbSaveCategory(siteCode, input, id);
    invalidateSite(siteCode);
    return saved;
  }

  const siteId = await resolveSiteId(siteCode);
  if (useMockData) {
    const category: ProductCategory = {
      id: id ?? newId(),
      siteId,
      ...input,
    };
    const saved = mockSaveCategory(siteCode, category);
    invalidateSite(siteCode);
    return saved;
  }
  throw new Error("Категориите през API още не са налични.");
}

export async function deleteCategory(siteCode: SiteCode, id: string) {
  if (useFirebase) {
    await fbDeleteCategory(id);
    invalidateSite(siteCode);
    return;
  }
  if (useMockData) {
    mockDeleteCategory(siteCode, id);
    invalidateSite(siteCode);
    return;
  }
  throw new Error("Категориите през API още не са налични.");
}

export type ProductInput = {
  sku: string;
  name: string;
  slug: string;
  category?: ProductCategorySlug | null;
  brand?: string | null;
  shortDescription?: string | null;
  description?: string | null;
  price?: number | null;
  currency: string;
  imageUrl?: string | null;
  imageUrls?: string[];
  videoUrl?: string | null;
  videoIsInstruction?: boolean;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
};

export async function saveProduct(
  siteCode: SiteCode,
  input: ProductInput,
  id?: string,
) {
  const imageUrls = input.imageUrls?.length
    ? input.imageUrls
    : input.imageUrl
      ? [input.imageUrl]
      : [];
  const imageUrl = imageUrls[0] ?? null;
  const normalized = {
    ...input,
    imageUrls,
    imageUrl,
    videoUrl: input.videoUrl ?? null,
    videoIsInstruction: Boolean(input.videoUrl && input.videoIsInstruction),
    price: null as number | null,
  };

  if (useFirebase) {
    const saved = await fbSaveProduct(siteCode, normalized, id);
    invalidateSite(siteCode);
    return saved;
  }

  const siteId = await resolveSiteId(siteCode);

  if (useMockData) {
    const product: Product = {
      id: id ?? newId(),
      siteId,
      ...normalized,
    };
    const saved = mockSaveProduct(siteCode, product);
    invalidateSite(siteCode);
    return saved;
  }

  if (id) {
    const saved = await apiFetch<Product>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        categoryId: null,
        sku: normalized.sku,
        name: normalized.name,
        slug: normalized.slug,
        shortDescription: normalized.shortDescription,
        description: normalized.description,
        price: null,
        currency: "EUR",
        imageUrl: normalized.imageUrl,
        isFeatured: normalized.isFeatured,
        isActive: normalized.isActive,
        sortOrder: normalized.sortOrder,
      }),
    });
    invalidateSite(siteCode);
    return saved;
  }

  const created = await apiFetch<Product>("/api/products", {
    method: "POST",
    body: JSON.stringify({
      siteId,
      categoryId: null,
      sku: normalized.sku,
      name: normalized.name,
      slug: normalized.slug,
      shortDescription: normalized.shortDescription,
      description: normalized.description,
      price: null,
      currency: "EUR",
      imageUrl: normalized.imageUrl,
      isFeatured: normalized.isFeatured,
      sortOrder: normalized.sortOrder,
    }),
  });
  invalidateSite(siteCode);
  return created;
}

export async function deleteProduct(siteCode: SiteCode, id: string) {
  if (useFirebase) {
    await fbDeleteProduct(id);
    invalidateSite(siteCode);
    return;
  }
  if (useMockData) {
    mockDeleteProduct(siteCode, id);
    invalidateSite(siteCode);
    return;
  }
  await apiFetch(`/api/products/${id}`, { method: "DELETE" });
  invalidateSite(siteCode);
}

export type PageInput = {
  title: string;
  slug: string;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  bodyHtml?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  isPublished: boolean;
};

export async function savePage(
  siteCode: SiteCode,
  input: PageInput,
  id?: string,
) {
  if (useFirebase) {
    const saved = await fbSavePage(siteCode, input, id);
    invalidateSite(siteCode);
    return saved;
  }

  const siteId = await resolveSiteId(siteCode);

  if (useMockData) {
    const page: Page = { id: id ?? newId(), siteId, ...input };
    const saved = mockSavePage(siteCode, page);
    invalidateSite(siteCode);
    return saved;
  }

  if (id) {
    const saved = await apiFetch<Page>(`/api/pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    invalidateSite(siteCode);
    return saved;
  }

  const created = await apiFetch<Page>("/api/pages", {
    method: "POST",
    body: JSON.stringify({ siteId, ...input }),
  });
  invalidateSite(siteCode);
  return created;
}

export async function deletePage(siteCode: SiteCode, id: string) {
  if (useFirebase) {
    await fbDeletePage(id);
    invalidateSite(siteCode);
    return;
  }
  if (useMockData) {
    mockDeletePage(siteCode, id);
    invalidateSite(siteCode);
    return;
  }
  throw new Error("Изтриването на страници все още не се поддържа от API.");
}

export type QrLinkInput = {
  code: string;
  redirectUrl: string;
  forwardUrl?: string | null;
  productId?: string | null;
  productName?: string | null;
  productSlug?: string | null;
};

export async function getQrLinks(siteCode: SiteCode) {
  return readCached(`qr:${siteCode}`, () => loadQrLinks(siteCode));
}

async function loadQrLinks(siteCode: SiteCode) {
  if (useFirebase) return fbGetQrLinks(siteCode);
  if (useMockData) {
    return typeof window === "undefined"
      ? (await import("./mock-data")).mockQrLinks(siteCode)
      : mockGetQrLinks(siteCode);
  }
  throw new Error("QR API все още не е налично — включете Firebase или mock.");
}

export async function getQrLinkByCode(siteCode: SiteCode, code: string) {
  if (useFirebase) return fbGetQrLinkByCode(siteCode, code);
  if (useMockData) {
    if (typeof window === "undefined") {
      const list = (await import("./mock-data")).mockQrLinks(siteCode);
      return list.find((q) => q.code === code) ?? null;
    }
    return mockGetQrLinkByCode(siteCode, code);
  }
  throw new Error("QR API все още не е налично — включете Firebase или mock.");
}

export async function saveQrLink(
  siteCode: SiteCode,
  input: QrLinkInput,
  id?: string,
) {
  if (useFirebase) {
    const existing = id
      ? (await fbGetQrLinks(siteCode)).find((q) => q.id === id)
      : null;
    const saved = await fbSaveQrLink(
      siteCode,
      {
        ...input,
        createdAtUtc: existing?.createdAtUtc,
      },
      id,
    );
    invalidateSite(siteCode);
    return saved;
  }

  const siteId = await resolveSiteId(siteCode);
  if (useMockData) {
    const existing = id
      ? mockGetQrLinks(siteCode).find((q) => q.id === id)
      : null;
    const link: QrLink = {
      id: id ?? newId(),
      siteId,
      code: input.code,
      redirectUrl: input.redirectUrl.trim(),
      forwardUrl: input.forwardUrl?.trim() || null,
      productId: input.productId || null,
      productName: input.productName || null,
      productSlug: input.productSlug || null,
      createdAtUtc: existing?.createdAtUtc ?? new Date().toISOString(),
    };
    const saved = mockSaveQrLink(siteCode, link);
    invalidateSite(siteCode);
    return saved;
  }
  throw new Error("QR API все още не е налично — включете Firebase или mock.");
}

export async function deleteQrLink(siteCode: SiteCode, id: string) {
  if (useFirebase) {
    await fbDeleteQrLink(id);
    invalidateSite(siteCode);
    return;
  }
  if (useMockData) {
    mockDeleteQrLink(siteCode, id);
    invalidateSite(siteCode);
    return;
  }
  throw new Error("QR API все още не е налично — включете Firebase или mock.");
}

export type BlogInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  bodyHtml?: string | null;
  coverImageUrl?: string | null;
  isPublished: boolean;
};

export async function saveBlogPost(
  siteCode: SiteCode,
  input: BlogInput,
  id?: string,
) {
  if (useFirebase) {
    const saved = await fbSaveBlog(
      siteCode,
      {
        ...input,
        publishedAtUtc: input.isPublished ? new Date().toISOString() : null,
      },
      id,
    );
    invalidateSite(siteCode);
    return saved;
  }

  const siteId = await resolveSiteId(siteCode);

  if (useMockData) {
    const post: BlogPost = {
      id: id ?? newId(),
      siteId,
      ...input,
      publishedAtUtc: input.isPublished ? new Date().toISOString() : null,
    };
    const saved = mockSaveBlog(siteCode, post);
    invalidateSite(siteCode);
    return saved;
  }

  if (id) {
    const saved = await apiFetch<BlogPost>(`/api/blogposts/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
    invalidateSite(siteCode);
    return saved;
  }

  const created = await apiFetch<BlogPost>("/api/blogposts", {
    method: "POST",
    body: JSON.stringify({ siteId, ...input }),
  });
  invalidateSite(siteCode);
  return created;
}

export async function deleteBlogPost(siteCode: SiteCode, id: string) {
  if (useFirebase) {
    await fbDeleteBlog(id);
    invalidateSite(siteCode);
    return;
  }
  if (useMockData) {
    mockDeleteBlog(siteCode, id);
    invalidateSite(siteCode);
    return;
  }
  throw new Error(
    "Изтриването на блог публикации все още не се поддържа от API.",
  );
}

export type UploadResult = {
  fileName: string;
  contentType: string;
  sizeBytes: number;
  publicUrl: string;
  altText?: string | null;
  r2Key: string;
  storagePath?: string;
};

export async function uploadFile(
  siteCode: SiteCode,
  file: File,
  altText?: string,
): Promise<UploadResult> {
  // Static GitHub Pages / Firebase: upload from the browser
  if (useFirebase) {
    return fbUploadFile(siteCode, file, altText);
  }

  // Local dev fallback (Cloudinary / disk via API route)
  const form = new FormData();
  form.append("file", file);
  form.append("site", siteCode);
  if (altText) form.append("altText", altText);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(data.error ?? "Неуспешно качване");
  }

  return response.json();
}

export async function registerMedia(
  siteCode: SiteCode,
  upload: UploadResult,
): Promise<MediaAsset> {
  if (useFirebase) {
    const saved = await fbSaveMedia(siteCode, {
      fileName: upload.fileName,
      contentType: upload.contentType,
      sizeBytes: upload.sizeBytes,
      publicUrl: upload.publicUrl,
      altText: upload.altText ?? null,
      storagePath: upload.storagePath ?? upload.r2Key,
    });
    invalidateSite(siteCode);
    return saved;
  }

  const siteId = await resolveSiteId(siteCode);

  if (useMockData) {
    const asset: MediaAsset = {
      id: newId(),
      siteId,
      fileName: upload.fileName,
      contentType: upload.contentType,
      sizeBytes: upload.sizeBytes,
      publicUrl: upload.publicUrl,
      altText: upload.altText ?? null,
    };
    const saved = mockSaveMedia(siteCode, asset);
    invalidateSite(siteCode);
    return saved;
  }

  const created = await apiFetch<MediaAsset>("/api/media/register", {
    method: "POST",
    body: JSON.stringify({
      siteId,
      fileName: upload.fileName,
      contentType: upload.contentType,
      sizeBytes: upload.sizeBytes,
      r2Key: upload.r2Key,
      publicUrl: upload.publicUrl,
      altText: upload.altText ?? null,
    }),
  });
  invalidateSite(siteCode);
  return created;
}

export async function uploadAndRegister(
  siteCode: SiteCode,
  file: File,
  altText?: string,
) {
  const upload = await uploadFile(siteCode, file, altText);
  return registerMedia(siteCode, upload);
}

export async function deleteMedia(siteCode: SiteCode, id: string) {
  if (useFirebase) {
    await fbDeleteMedia(id);
    invalidateSite(siteCode);
    return;
  }
  if (useMockData) {
    mockDeleteMedia(siteCode, id);
    invalidateSite(siteCode);
    return;
  }
  await apiFetch(`/api/media/${id}`, { method: "DELETE" });
  invalidateSite(siteCode);
}

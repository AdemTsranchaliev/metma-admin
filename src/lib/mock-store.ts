import {
  MOCK_SITES,
  mockBlogPosts,
  mockCategories,
  mockMedia,
  mockPages,
  mockProducts,
  mockQrLinks,
} from "./mock-data";
import type {
  BlogPost,
  MediaAsset,
  Page,
  Product,
  ProductCategory,
  QrLink,
  SiteCode,
} from "./types";

const KEY = "metma-admin-mock-v10";

type Bucket = {
  products: Product[];
  pages: Page[];
  blog: BlogPost[];
  media: MediaAsset[];
  categories: ProductCategory[];
  qrLinks: QrLink[];
};

type Store = Record<SiteCode, Bucket>;

function emptyBucket(code: SiteCode): Bucket {
  return {
    products: mockProducts(code),
    pages: mockPages(code),
    blog: mockBlogPosts(code),
    media: mockMedia(code),
    categories: mockCategories(code),
    qrLinks: mockQrLinks(code),
  };
}

function seed(): Store {
  return {
    Bg: emptyBucket("Bg"),
    De: emptyBucket("De"),
    Usa: emptyBucket("Usa"),
  };
}

function normalizeBucket(code: SiteCode, raw: Partial<Bucket> | undefined): Bucket {
  const base = emptyBucket(code);
  if (!raw) return base;
  return {
    products: raw.products ?? base.products,
    pages: raw.pages ?? base.pages,
    blog: raw.blog ?? base.blog,
    media: raw.media ?? base.media,
    categories:
      raw.categories && raw.categories.length > 0
        ? raw.categories
        : base.categories,
    qrLinks: raw.qrLinks ?? base.qrLinks,
  };
}

function read(): Store {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    const parsed = JSON.parse(raw) as Partial<Record<SiteCode, Partial<Bucket>>>;
    return {
      Bg: normalizeBucket("Bg", parsed.Bg),
      De: normalizeBucket("De", parsed.De),
      Usa: normalizeBucket("Usa", parsed.Usa),
    };
  } catch {
    const s = seed();
    localStorage.setItem(KEY, JSON.stringify(s));
    return s;
  }
}

function write(store: Store) {
  localStorage.setItem(KEY, JSON.stringify(store));
}

function mutate(site: SiteCode, fn: (bucket: Bucket) => Bucket) {
  const store = read();
  store[site] = fn(normalizeBucket(site, store[site]));
  write(store);
  return store[site];
}

export function mockGetSites() {
  return MOCK_SITES;
}

export function mockGetCategories(site: SiteCode) {
  return read()[site]?.categories ?? [];
}

export function mockSaveCategory(site: SiteCode, category: ProductCategory) {
  mutate(site, (b) => {
    const i = b.categories.findIndex((c) => c.id === category.id);
    const categories = [...b.categories];
    if (i >= 0) categories[i] = category;
    else categories.push(category);
    categories.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    return { ...b, categories };
  });
  return category;
}

export function mockDeleteCategory(site: SiteCode, id: string) {
  mutate(site, (b) => ({
    ...b,
    categories: b.categories.filter((c) => c.id !== id),
  }));
}

export function mockGetProducts(site: SiteCode) {
  return read()[site]?.products ?? [];
}

export function mockSaveProduct(site: SiteCode, product: Product) {
  mutate(site, (b) => {
    const i = b.products.findIndex((p) => p.id === product.id);
    const products = [...b.products];
    if (i >= 0) products[i] = product;
    else products.unshift(product);
    return { ...b, products };
  });
  return product;
}

export function mockDeleteProduct(site: SiteCode, id: string) {
  mutate(site, (b) => ({
    ...b,
    products: b.products.filter((p) => p.id !== id),
  }));
}

export function mockGetPages(site: SiteCode) {
  return read()[site]?.pages ?? [];
}

export function mockGetPageBySlug(site: SiteCode, slug: string) {
  return (
    read()[site]?.pages.find((p) => p.slug === slug && p.isPublished) ?? null
  );
}

export function mockSavePage(site: SiteCode, page: Page) {
  mutate(site, (b) => {
    const i = b.pages.findIndex((p) => p.id === page.id);
    const pages = [...b.pages];
    if (i >= 0) pages[i] = page;
    else pages.unshift(page);
    return { ...b, pages };
  });
  return page;
}

export function mockDeletePage(site: SiteCode, id: string) {
  mutate(site, (b) => ({
    ...b,
    pages: b.pages.filter((p) => p.id !== id),
  }));
}

export function mockGetQrLinks(site: SiteCode) {
  return read()[site]?.qrLinks ?? [];
}

export function mockGetQrLinkByCode(site: SiteCode, code: string) {
  return read()[site]?.qrLinks.find((q) => q.code === code) ?? null;
}

export function mockSaveQrLink(site: SiteCode, link: QrLink) {
  mutate(site, (b) => {
    const i = b.qrLinks.findIndex((q) => q.id === link.id);
    const qrLinks = [...b.qrLinks];
    if (i >= 0) qrLinks[i] = link;
    else qrLinks.unshift(link);
    return { ...b, qrLinks };
  });
  return link;
}

export function mockDeleteQrLink(site: SiteCode, id: string) {
  mutate(site, (b) => ({
    ...b,
    qrLinks: b.qrLinks.filter((q) => q.id !== id),
  }));
}

export function mockGetBlog(site: SiteCode) {
  return read()[site]?.blog ?? [];
}

export function mockSaveBlog(site: SiteCode, post: BlogPost) {
  mutate(site, (b) => {
    const i = b.blog.findIndex((p) => p.id === post.id);
    const blog = [...b.blog];
    if (i >= 0) blog[i] = post;
    else blog.unshift(post);
    return { ...b, blog };
  });
  return post;
}

export function mockDeleteBlog(site: SiteCode, id: string) {
  mutate(site, (b) => ({
    ...b,
    blog: b.blog.filter((p) => p.id !== id),
  }));
}

export function mockGetMedia(site: SiteCode) {
  return read()[site]?.media ?? [];
}

export function mockSaveMedia(site: SiteCode, asset: MediaAsset) {
  mutate(site, (b) => ({
    ...b,
    media: [asset, ...b.media.filter((m) => m.id !== asset.id)],
  }));
  return asset;
}

export function mockDeleteMedia(site: SiteCode, id: string) {
  mutate(site, (b) => ({
    ...b,
    media: b.media.filter((m) => m.id !== id),
  }));
}

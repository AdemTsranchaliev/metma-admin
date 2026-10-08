"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteProduct,
  getCategories,
  getProducts,
  saveProduct,
  type Product,
  type ProductCategory,
  type ProductInput,
} from "@/lib/api";
import type { ProductCategorySlug, SiteCode } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { useListLayout } from "@/lib/use-list-layout";
import { AdminThumb } from "@/components/AdminThumb";
import { Badge, EmptyState } from "@/components/ui";
import { Button, Field, FormSection, Modal, RowActions, ToggleCard, inputClass, textareaClass } from "@/components/forms";
import { ProductMediaAttach } from "@/components/ProductMediaAttach";
import { Plus, Save } from "lucide-react";
import { ListToolbar, SearchField, matchesQuery } from "@/components/SearchField";

const empty: ProductInput = {
  sku: "",
  name: "",
  slug: "",
  category: "farbstoffe",
  brand: "metma",
  shortDescription: "",
  description: "",
  price: null,
  currency: "EUR",
  imageUrl: null,
  imageUrls: [],
  videoUrl: null,
  videoIsInstruction: false,
  isFeatured: false,
  isActive: true,
  sortOrder: 0,
};

export function ProductsManager({ site }: { site: SiteCode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [filter, setFilter] = useState<"alle" | ProductCategorySlug>("alle");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<ProductInput>(empty);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const layout = useListLayout();

  const categoryLabel = useCallback(
    (slug?: ProductCategorySlug | null) =>
      categories.find((c) => c.slug === slug)?.name ?? slug ?? "—",
    [categories],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [products, cats] = await Promise.all([
        getProducts(site),
        getCategories(site),
      ]);
      setItems(products);
      setCategories(cats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неуспешно зареждане");
    } finally {
      setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function openCreate() {
    setEditing(null);
    const defaultCat = categories[0]?.slug ?? "farbstoffe";
    setForm({ ...empty, category: defaultCat, sortOrder: items.length + 1 });
    setSlugManual(false);
    setCreating(true);
  }

  const openEdit = useCallback((p: Product) => {
    setCreating(false);
    setEditing(p);
    setForm({
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      category: p.category ?? "farbstoffe",
      brand: p.brand ?? "metma",
      shortDescription: p.shortDescription ?? "",
      description: p.description ?? "",
      price: null,
      currency: "EUR",
      imageUrl: p.imageUrl ?? null,
      imageUrls: p.imageUrls?.length
        ? p.imageUrls
        : p.imageUrl
          ? [p.imageUrl]
          : [],
      videoUrl: p.videoUrl ?? null,
      videoIsInstruction: Boolean(p.videoUrl) && p.videoIsInstruction !== false,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
      sortOrder: p.sortOrder,
    });
    setSlugManual(true);
  }, []);

  function close() {
    setCreating(false);
    setEditing(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await saveProduct(site, form, editing?.id);
      close();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно записване");
    } finally {
      setSaving(false);
    }
  }

  const onDelete = useCallback(async (id: string) => {
    if (!confirm("Изтриване на този продукт?")) return;
    try {
      await deleteProduct(site, id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно изтриване");
    }
  }, [reload, site]);

  const open = creating || editing;
  const visible = useMemo(
    () =>
      items.filter((p) => {
        if (filter !== "alle" && p.category !== filter) return false;
        return matchesQuery(
          query,
          p.name,
          p.sku,
          p.slug,
          p.shortDescription,
          p.category,
          categoryLabel(p.category),
        );
      }),
    [items, filter, query, categoryLabel],
  );

  return (
    <>
      <ListToolbar
        search={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Търсене по име, SKU, slug…"
          />
        }
      >
        <Button onClick={openCreate}><Plus className="h-4 w-4" strokeWidth={2} />Нов продукт</Button>
      </ListToolbar>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <button
          type="button"
          onClick={() => setFilter("alle")}
          className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
            filter === "alle"
              ? "bg-[var(--admin-rose)] text-white"
              : "bg-white text-[var(--admin-mute)] ring-1 ring-[var(--admin-line)] hover:text-[var(--admin-ink)]"
          }`}
        >
          Alle
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setFilter(cat.slug)}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              filter === cat.slug
                ? "bg-[var(--admin-rose)] text-white"
                : "bg-white text-[var(--admin-mute)] ring-1 ring-[var(--admin-line)] hover:text-[var(--admin-ink)]"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {error ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading || layout === "pending" ? (
        <p className="text-sm text-[var(--admin-mute)]">Зареждане…</p>
      ) : visible.length === 0 ? (
        <EmptyState
          message={
            query.trim()
              ? "Няма резултати за това търсене."
              : "Няма продукти в тази категория."
          }
        />
      ) : (
        <ProductCatalogList
          layout={layout}
          items={visible}
          categoryLabel={categoryLabel}
          onEdit={openEdit}
          onDelete={onDelete}
        />
      )}

      {open ? (
        <Modal
          title={editing ? "Редакция на продукт" : "Нов продукт"}
          description="Данни за каталога и публичната страница."
          onClose={close}
          wide
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Отказ
              </Button>
              <Button type="submit" form="product-form" disabled={saving}>
                {saving ? (
                  "Запис…"
                ) : (
                  <>
                    <Save className="h-4 w-4" strokeWidth={2} />
                    Запази
                  </>
                )}
              </Button>
            </>
          }
        >
          <form id="product-form" className="grid gap-6" onSubmit={onSubmit}>
            {error ? (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <FormSection title="Продукт">
              <Field label="Име">
                <input
                  className={inputClass}
                  required
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      slug: slugManual ? f.slug : slugify(name),
                    }));
                  }}
                  placeholder="напр. Magie Flüssig"
                />
              </Field>
              <div className="grid gap-3.5 sm:grid-cols-3">
                <Field label="SKU">
                  <input
                    className={`${inputClass} font-mono`}
                    required
                    value={form.sku}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, sku: e.target.value }))
                    }
                    placeholder="SKU-001"
                  />
                </Field>
                <Field label="Slug" hint="URL">
                  <input
                    className={`${inputClass} font-mono`}
                    required
                    value={form.slug}
                    onChange={(e) => {
                      setSlugManual(true);
                      setForm((f) => ({ ...f, slug: e.target.value }));
                    }}
                  />
                </Field>
                <Field label="Ред" hint="ред в списъка">
                  <input
                    className={inputClass}
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        sortOrder: Number(e.target.value) || 0,
                      }))
                    }
                  />
                </Field>
              </div>
              <div
                className={`grid gap-3.5 ${site === "Bg" ? "sm:grid-cols-2" : ""}`}
              >
                <Field label="Категория">
                  <select
                    className={inputClass}
                    value={form.category ?? categories[0]?.slug ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        category: e.target.value,
                      }))
                    }
                  >
                    {categories.length === 0 ? (
                      <option value="">Няма категории — създайте от менюто</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </Field>
                {site === "Bg" ? (
                  <Field label="Марка">
                    <select
                      className={inputClass}
                      value={form.brand ?? "metma"}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, brand: e.target.value }))
                      }
                    >
                      <option value="metma">METMA</option>
                      <option value="vesache">Весаче</option>
                      <option value="ino">Ино</option>
                      <option value="pet">Пет</option>
                    </select>
                  </Field>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <ToggleCard
                  checked={form.isActive}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, isActive: value }))
                  }
                  title="Активен"
                  description="Видим в каталога."
                />
                <ToggleCard
                  checked={form.isFeatured}
                  onChange={(value) =>
                    setForm((f) => ({ ...f, isFeatured: value }))
                  }
                  title="Акцент"
                  description="На началната страница."
                />
              </div>
            </FormSection>

            <FormSection
              title="Описание"
              hint="Кратко за картичките, пълно за страницата."
            >
              <Field label="Кратко">
                <input
                  className={inputClass}
                  value={form.shortDescription ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      shortDescription: e.target.value,
                    }))
                  }
                  placeholder="1–2 изречения"
                />
              </Field>
              <Field label="Пълно">
                <textarea
                  className={`${textareaClass} min-h-[96px]`}
                  value={form.description ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Характеристики, употреба…"
                />
              </Field>
            </FormSection>

            <FormSection title="Медия">
              <ProductMediaAttach
                site={site}
                imageUrls={form.imageUrls ?? []}
                videoUrl={form.videoUrl}
                isInstruction={form.videoIsInstruction}
                onImagesChange={(urls) =>
                  setForm((f) => ({
                    ...f,
                    imageUrls: urls,
                    imageUrl: urls[0] ?? null,
                  }))
                }
                onVideoChange={(url) =>
                  setForm((f) => ({
                    ...f,
                    videoUrl: url,
                    videoIsInstruction: url
                      ? f.videoUrl
                        ? Boolean(f.videoIsInstruction)
                        : true
                      : false,
                  }))
                }
                onInstructionChange={(value) =>
                  setForm((f) => ({ ...f, videoIsInstruction: value }))
                }
              />
            </FormSection>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

const ProductCatalogList = memo(function ProductCatalogList({
  layout,
  items,
  categoryLabel,
  onEdit,
  onDelete,
}: {
  layout: "mobile" | "desktop";
  items: Product[];
  categoryLabel: (slug?: ProductCategorySlug | null) => string;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}) {
  if (layout === "mobile") {
    return (
      <div className="admin-mobile-list grid">
        {items.map((p) => {
          const src = p.imageUrl || p.imageUrls?.[0];
          return (
            <div key={p.id} className="admin-mobile-card">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--admin-sand)]">
                <AdminThumb src={src} width={112} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-snug">{p.name}</p>
                <p className="mt-0.5 font-mono text-[0.7rem] text-[var(--admin-mute)]">
                  {p.sku}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge>{categoryLabel(p.category)}</Badge>
                  {p.isFeatured ? <Badge tone="good">Акцент</Badge> : null}
                  {p.isActive ? (
                    <Badge>Активен</Badge>
                  ) : (
                    <Badge tone="warn">Неактивен</Badge>
                  )}
                </div>
              </div>
              <RowActions onEdit={() => onEdit(p)} onDelete={() => onDelete(p.id)} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="admin-panel admin-panel-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Снимка</th>
            <th>SKU</th>
            <th>Име</th>
            <th>Категория</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => {
            const src = p.imageUrl || p.imageUrls?.[0];
            const imageCount = p.imageUrls?.length ?? (p.imageUrl ? 1 : 0);
            return (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  {src ? (
                    <AdminThumb
                      src={src}
                      width={80}
                      className="h-10 w-10 rounded object-cover"
                    />
                  ) : (
                    <span className="text-xs text-[var(--admin-mute)]">—</span>
                  )}
                  {imageCount > 1 || p.videoUrl ? (
                    <p className="mt-1 text-[0.65rem] text-[var(--admin-mute)]">
                      {[
                        imageCount > 0 ? `${imageCount} сн.` : null,
                        p.videoUrl
                          ? p.videoIsInstruction
                            ? "инструкция"
                            : "видео"
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">
                  <Badge>{categoryLabel(p.category)}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {p.isFeatured ? <Badge tone="good">Акцент</Badge> : null}
                    {p.isActive ? <Badge>Активен</Badge> : <Badge tone="warn">Неактивен</Badge>}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RowActions onEdit={() => onEdit(p)} onDelete={() => onDelete(p.id)} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});

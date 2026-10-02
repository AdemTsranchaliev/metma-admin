"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteCategory,
  getCategories,
  getProducts,
  saveCategory,
  type CategoryInput,
  type ProductCategory,
} from "@/lib/api";
import type { SiteCode } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/ui";
import { Button, Field, Modal, RowActions, inputClass, textareaClass } from "@/components/forms";
import { ListToolbar, SearchField, matchesQuery } from "@/components/SearchField";
import { Plus, Save } from "lucide-react";

const empty: CategoryInput = {
  name: "",
  slug: "",
  description: "",
  sortOrder: 0,
  isActive: true,
};

export function CategoriesManager({ site }: { site: SiteCode }) {
  const [items, setItems] = useState<ProductCategory[]>([]);
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<CategoryInput>(empty);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, products] = await Promise.all([
        getCategories(site),
        getProducts(site),
      ]);
      setItems(cats);
      const counts: Record<string, number> = {};
      for (const p of products) {
        if (!p.category) continue;
        counts[p.category] = (counts[p.category] ?? 0) + 1;
      }
      setUsage(counts);
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
    setForm({ ...empty, sortOrder: items.length + 1 });
    setSlugManual(false);
    setCreating(true);
  }

  function openEdit(cat: ProductCategory) {
    setCreating(false);
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? "",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
    });
    setSlugManual(true);
  }

  function close() {
    setCreating(false);
    setEditing(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const slug = form.slug.trim().toLowerCase();
      const duplicate = items.find(
        (c) => c.slug === slug && c.id !== editing?.id,
      );
      if (duplicate) {
        throw new Error("Вече има категория с този slug.");
      }
      await saveCategory(site, { ...form, slug }, editing?.id);
      close();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно записване");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(cat: ProductCategory) {
    const count = usage[cat.slug] ?? 0;
    const msg =
      count > 0
        ? `Изтриване на „${cat.name}“? ${count} продукт(а) ще останат без категория.`
        : `Изтриване на „${cat.name}“?`;
    if (!confirm(msg)) return;
    try {
      await deleteCategory(site, cat.id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно изтриване");
    }
  }

  const open = creating || editing;
  const visible = items.filter((cat) =>
    matchesQuery(query, cat.name, cat.slug, cat.description),
  );

  return (
    <>
      <ListToolbar
        search={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Търсене по име или slug…"
          />
        }
      >
        <Button onClick={openCreate}><Plus className="h-4 w-4" strokeWidth={2} />Нова категория</Button>
      </ListToolbar>

      {error ? (
        <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--admin-mute)]">Зареждане…</p>
      ) : visible.length === 0 ? (
        <EmptyState
          message={
            query.trim()
              ? "Няма резултати за това търсене."
              : "Все още няма категории. Добавете първата."
          }
        />
      ) : (
        <>
          <div className="admin-mobile-list grid md:hidden">
            {visible.map((cat) => (
              <div key={cat.id} className="admin-mobile-card">
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{cat.name}</p>
                  <p className="mt-0.5 font-mono text-[0.7rem] text-[var(--admin-mute)]">
                    /produkte/{cat.slug}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge>{usage[cat.slug] ?? 0} продукта</Badge>
                    {cat.isActive ? (
                      <Badge tone="good">Активна</Badge>
                    ) : (
                      <Badge tone="warn">Скрита</Badge>
                    )}
                  </div>
                </div>
                <RowActions
                  onEdit={() => openEdit(cat)}
                  onDelete={() => onDelete(cat)}
                />
              </div>
            ))}
          </div>

          <div className="admin-panel admin-panel-scroll hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Име</th>
                  <th>Slug</th>
                  <th>Продукти</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((cat) => (
                  <tr key={cat.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{cat.name}</p>
                      {cat.description ? (
                        <p className="mt-0.5 text-xs text-[var(--admin-mute)]">
                          {cat.description}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-[var(--admin-mute)]">
                      /produkte/{cat.slug}
                    </td>
                    <td className="px-4 py-3 text-sm">{usage[cat.slug] ?? 0}</td>
                    <td className="px-4 py-3">
                      {cat.isActive ? (
                        <Badge tone="good">Активна</Badge>
                      ) : (
                        <Badge tone="warn">Скрита</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        onEdit={() => openEdit(cat)}
                        onDelete={() => onDelete(cat)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {open ? (
        <Modal
          title={editing ? "Редакция на категория" : "Нова категория"}
          description="Име и slug за навигацията в каталога."
          onClose={close}
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Отказ
              </Button>
              <Button type="submit" form="category-form" disabled={saving}>
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
          <form id="category-form" className="grid gap-4" onSubmit={onSubmit}>
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
                placeholder="напр. Zubehör"
              />
            </Field>
            <Field
              label="Slug"
              hint="URL: /produkte/[slug] — латински букви, тирета"
            >
              <input
                className={inputClass}
                required
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setForm((f) => ({ ...f, slug: e.target.value }));
                }}
              />
            </Field>
            <Field label="Описание">
              <textarea
                className={textareaClass}
                value={form.description ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Кратък текст за менюто"
              />
            </Field>
            <Field label="Ред">
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
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
              />
              Активна (видима на сайта)
            </label>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

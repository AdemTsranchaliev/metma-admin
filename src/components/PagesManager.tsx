"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deletePage,
  getPages,
  savePage,
  type Page,
  type PageInput,
} from "@/lib/api";
import type { SiteCode } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { Badge, EmptyState } from "@/components/ui";
import {
  Button,
  Field,
  Modal,
  RowActions,
  inputClass,
  textareaClass,
} from "@/components/forms";
import { ListToolbar, SearchField, matchesQuery } from "@/components/SearchField";
import { Plus, Save } from "lucide-react";

const empty: PageInput = {
  title: "",
  slug: "",
  heroTitle: "",
  heroSubtitle: "",
  bodyHtml: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: true,
};

export function PagesManager({ site }: { site: SiteCode }) {
  const [items, setItems] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Page | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<PageInput>(empty);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getPages(site));
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
    setForm(empty);
    setSlugManual(false);
    setCreating(true);
  }

  function openEdit(p: Page) {
    setCreating(false);
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      heroTitle: p.heroTitle ?? "",
      heroSubtitle: p.heroSubtitle ?? "",
      bodyHtml: p.bodyHtml ?? "",
      metaTitle: p.metaTitle ?? "",
      metaDescription: p.metaDescription ?? "",
      isPublished: p.isPublished,
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
      await savePage(site, form, editing?.id);
      close();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно записване");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Изтриване на тази страница?")) return;
    try {
      await deletePage(site, id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно изтриване");
    }
  }

  const open = creating || editing;
  const visible = useMemo(
    () =>
      items.filter((page) =>
        matchesQuery(
          query,
          page.title,
          page.slug,
          page.heroTitle,
          page.heroSubtitle,
          page.metaTitle,
        ),
      ),
    [items, query],
  );

  return (
    <>
      <ListToolbar
        search={
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="Търсене по заглавие или slug…"
          />
        }
      >
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Нова страница
        </Button>
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
              : "Все още няма страници за този сайт."
          }
        />
      ) : (
        <>
          <div className="admin-mobile-list grid md:hidden">
            {visible.map((page) => (
              <div key={page.id} className="admin-mobile-card">
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{page.title}</p>
                  <p className="mt-0.5 text-xs text-[var(--admin-mute)]">
                    /{page.slug}
                  </p>
                  <div className="mt-2">
                    {page.isPublished ? (
                      <Badge tone="good">Публикувана</Badge>
                    ) : (
                      <Badge tone="warn">Чернова</Badge>
                    )}
                  </div>
                </div>
                <RowActions
                  onEdit={() => openEdit(page)}
                  onDelete={() => onDelete(page.id)}
                />
              </div>
            ))}
          </div>

          <div className="admin-panel admin-panel-scroll hidden md:block">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Заглавие</th>
                  <th>Slug</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((page) => (
                  <tr key={page.id}>
                    <td className="px-4 py-3 font-medium">{page.title}</td>
                    <td className="px-4 py-3 text-[var(--admin-mute)]">
                      /{page.slug}
                    </td>
                    <td className="px-4 py-3">
                      {page.isPublished ? (
                        <Badge tone="good">Публикувана</Badge>
                      ) : (
                        <Badge tone="warn">Чернова</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        onEdit={() => openEdit(page)}
                        onDelete={() => onDelete(page.id)}
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
          title={editing ? "Редакция на страница" : "Нова страница"}
          description="Hero блок, съдържание и SEO полета за статична страница."
          onClose={close}
          wide
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Отказ
              </Button>
              <Button type="submit" form="page-form" disabled={saving}>
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
          <form id="page-form" className="grid gap-4" onSubmit={onSubmit}>
            <Field label="Заглавие">
              <input
                className={inputClass}
                required
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({
                    ...f,
                    title,
                    slug: slugManual ? f.slug : slugify(title),
                  }));
                }}
              />
            </Field>
            <Field label="Slug">
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hero заглавие">
                <input
                  className={inputClass}
                  value={form.heroTitle ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, heroTitle: e.target.value }))
                  }
                />
              </Field>
              <Field label="Hero подзаглавие">
                <input
                  className={inputClass}
                  value={form.heroSubtitle ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, heroSubtitle: e.target.value }))
                  }
                />
              </Field>
            </div>
            <Field label="Съдържание (HTML)">
              <textarea
                className={textareaClass}
                value={form.bodyHtml ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bodyHtml: e.target.value }))
                }
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Meta заглавие">
                <input
                  className={inputClass}
                  value={form.metaTitle ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, metaTitle: e.target.value }))
                  }
                />
              </Field>
              <Field label="Meta описание">
                <input
                  className={inputClass}
                  value={form.metaDescription ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, metaDescription: e.target.value }))
                  }
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isPublished: e.target.checked }))
                }
              />
              Публикувана
            </label>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

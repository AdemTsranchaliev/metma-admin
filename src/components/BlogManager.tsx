"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteBlogPost,
  getBlogPosts,
  saveBlogPost,
  type BlogInput,
  type BlogPost,
} from "@/lib/api";
import type { SiteCode } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { useListLayout } from "@/lib/use-list-layout";
import { AdminThumb } from "@/components/AdminThumb";
import { Badge, EmptyState } from "@/components/ui";
import { Button, Field, Modal, RowActions, inputClass, textareaClass } from "@/components/forms";
import { ImageAttach } from "@/components/ImageAttach";
import { ListToolbar, SearchField, matchesQuery } from "@/components/SearchField";
import { Plus, Save } from "lucide-react";

const empty: BlogInput = {
  title: "",
  slug: "",
  excerpt: "",
  bodyHtml: "",
  coverImageUrl: null,
  isPublished: false,
};

export function BlogManager({ site }: { site: SiteCode }) {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<BlogInput>(empty);
  const [slugManual, setSlugManual] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const layout = useListLayout();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getBlogPosts(site, false));
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

  function openEdit(p: BlogPost) {
    setCreating(false);
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt ?? "",
      bodyHtml: p.bodyHtml ?? "",
      coverImageUrl: p.coverImageUrl ?? null,
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
      await saveBlogPost(site, form, editing?.id);
      close();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно записване");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Изтриване на тази публикация?")) return;
    try {
      await deleteBlogPost(site, id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно изтриване");
    }
  }

  const open = creating || editing;
  const visible = useMemo(
    () => items.filter((post) => matchesQuery(query, post.title, post.slug, post.excerpt)),
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
        <Button onClick={openCreate}><Plus className="h-4 w-4" strokeWidth={2} />Нова публикация</Button>
      </ListToolbar>

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
              : "Все още няма публикации за този сайт."
          }
        />
      ) : (
        <>
          {layout === "mobile" ? (
          <div className="admin-mobile-list grid">
            {visible.map((post) => (
              <div key={post.id} className="admin-mobile-card">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--admin-sand)]">
                  <AdminThumb
                    src={post.coverImageUrl}
                    width={112}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium leading-snug">{post.title}</p>
                  <p className="mt-0.5 truncate text-xs text-[var(--admin-mute)]">
                    {post.slug}
                  </p>
                  <div className="mt-2">
                    {post.isPublished ? (
                      <Badge tone="good">Публикувана</Badge>
                    ) : (
                      <Badge tone="warn">Чернова</Badge>
                    )}
                  </div>
                </div>
                <RowActions
                  onEdit={() => openEdit(post)}
                  onDelete={() => onDelete(post.id)}
                />
              </div>
            ))}
          </div>
          ) : (
          <div className="admin-panel admin-panel-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Корица</th>
                  <th>Заглавие</th>
                  <th>Slug</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((post) => (
                  <tr key={post.id}>
                    <td className="px-4 py-3">
                      {post.coverImageUrl ? (
                        <AdminThumb
                          src={post.coverImageUrl}
                          width={80}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <span className="text-xs text-[var(--admin-mute)]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{post.title}</td>
                    <td className="px-4 py-3 text-[var(--admin-mute)]">
                      {post.slug}
                    </td>
                    <td className="px-4 py-3">
                      {post.isPublished ? (
                        <Badge tone="good">Публикувана</Badge>
                      ) : (
                        <Badge tone="warn">Чернова</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        onEdit={() => openEdit(post)}
                        onDelete={() => onDelete(post.id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </>
      )}

      {open ? (
        <Modal
          title={editing ? "Редакция на публикация" : "Нова публикация"}
          description="Заглавие, slug, корица и HTML съдържание за блога."
          onClose={close}
          wide
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Отказ
              </Button>
              <Button type="submit" form="blog-form" disabled={saving}>
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
          <form id="blog-form" className="grid gap-4" onSubmit={onSubmit}>
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
            <Field label="Откъс">
              <input
                className={inputClass}
                value={form.excerpt ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, excerpt: e.target.value }))
                }
              />
            </Field>
            <Field label="Съдържание (HTML)">
              <textarea
                className={textareaClass}
                value={form.bodyHtml ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bodyHtml: e.target.value }))
                }
              />
            </Field>
            <ImageAttach
              site={site}
              label="Корица"
              value={form.coverImageUrl}
              onChange={(url) => setForm((f) => ({ ...f, coverImageUrl: url }))}
              registerMedia
            />
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

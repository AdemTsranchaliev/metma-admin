"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  deleteMedia,
  getMedia,
  uploadAndRegister,
  type MediaAsset,
} from "@/lib/api";
import type { SiteCode } from "@/lib/types";
import { EmptyState } from "@/components/ui";
import { Button, Field, inputClass } from "@/components/forms";
import { SearchField, matchesQuery } from "@/components/SearchField";
import { AdminThumb } from "@/components/AdminThumb";
import { Trash2, Upload } from "lucide-react";

export function MediaManager({ site }: { site: SiteCode }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [altText, setAltText] = useState("");
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getMedia(site));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неуспешно зареждане");
    } finally {
      setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    void reload();
  }, [reload]);

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      await uploadAndRegister(site, file, altText || undefined);
      setAltText("");
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неуспешно качване");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const visible = useMemo(
    () =>
      items.filter((asset) =>
        matchesQuery(
          query,
          asset.fileName,
          asset.contentType,
          asset.altText,
          asset.publicUrl,
        ),
      ),
    [items, query],
  );

  async function onDelete(id: string) {
    if (!confirm("Премахване на този медиен файл?")) return;
    try {
      await deleteMedia(site, id);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неуспешно изтриване");
    }
  }

  return (
    <>
      <div className="mb-4">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Търсене по име на файл, тип, alt…"
        />
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-[var(--admin-radius)] border border-[var(--admin-line)] bg-[var(--admin-paper)] p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <p className="mb-2 text-xs text-[var(--admin-mute)]">
            Общо място за файлове: Cloudinary (виж MEDIA.md). Без Blaze.
          </p>
          <Field label="Alt текст (по избор)">
            <input
              className={inputClass}
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Опишете файла"
            />
          </Field>
        </div>
        <div className="w-full sm:w-auto">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <Button
            className="w-full sm:w-auto"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Качване…" : (<><Upload className="h-4 w-4" strokeWidth={2} />Качи файл</>)}
          </Button>
        </div>
      </div>

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
              : "Все още няма медия. Качете снимка или видео по-горе."
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((asset) => (
            <li
              key={asset.id}
              className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-line)] bg-[var(--admin-paper)] shadow-[0_1px_0_rgba(28,25,23,0.03)] transition hover:border-[color-mix(in_srgb,var(--admin-rose)_30%,var(--admin-line))]"
            >
              <div className="aspect-[4/3] bg-[var(--admin-sand)]">
                {asset.contentType.startsWith("video/") ? (
                  <video
                    src={asset.publicUrl}
                    className="h-full w-full object-cover"
                    muted
                    preload="metadata"
                  />
                ) : (
                  <AdminThumb
                    src={asset.publicUrl}
                    alt={asset.altText ?? asset.fileName}
                    width={640}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="p-4">
                <p className="truncate text-sm font-semibold">{asset.fileName}</p>
                <p className="mt-1 truncate text-xs text-[var(--admin-mute)]">
                  {asset.contentType} · {Math.round(asset.sizeBytes / 1024)} KB
                </p>
                <div className="mt-3 flex flex-nowrap items-center gap-2">
                  <a
                    href={asset.publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg border border-stone-400 bg-white px-3.5 text-sm font-semibold text-[var(--admin-ink)] hover:border-[var(--admin-ink)]"
                  >
                    Отвори
                  </a>
                  <button
                    type="button"
                    onClick={() => onDelete(asset.id)}
                    className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-red-300 bg-white px-3.5 text-sm font-semibold text-red-700 hover:border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} />
                    Изтрий
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

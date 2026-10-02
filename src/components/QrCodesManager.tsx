"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteQrLink,
  getQrLinks,
  saveQrLink,
  type QrLink,
} from "@/lib/api";
import { downloadQrPng } from "@/lib/qr";
import { qrPublicUrl, resolveQrDestination, type SiteCode } from "@/lib/sites";
import { uniquePageCode } from "@/lib/utils";
import { useListLayout } from "@/lib/use-list-layout";
import { EmptyState } from "@/components/ui";
import { QrPreview } from "@/components/QrPreview";
import {
  Button,
  Field,
  FormSection,
  Modal,
  inputClass,
} from "@/components/forms";
import { ListToolbar, SearchField, matchesQuery } from "@/components/SearchField";
import {
  Check,
  Copy,
  Download,
  ExternalLink,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

export function QrCodesManager({ site }: { site: SiteCode }) {
  const [items, setItems] = useState<QrLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<QrLink | null>(null);
  const [creating, setCreating] = useState(false);
  const [code, setCode] = useState("");
  const [pageUrl, setPageUrl] = useState("");
  const [forwardUrl, setForwardUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [qrBusy, setQrBusy] = useState<string | null>(null);
  const layout = useListLayout();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await getQrLinks(site));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неуспешно зареждане");
    } finally {
      setLoading(false);
    }
  }, [site]);

  useEffect(() => {
    void reload();
  }, [reload]);

  function goUrl(c: string) {
    return qrPublicUrl(site, c);
  }

  function destinationOf(page: string, forward: string) {
    const p = page.trim();
    const f = forward.trim();
    return resolveQrDestination({
      redirectUrl: p || f,
      forwardUrl: p && f ? f : null,
    });
  }

  function openCreate() {
    setEditing(null);
    setCode(uniquePageCode());
    setPageUrl("");
    setForwardUrl("");
    setCreating(true);
  }

  function openEdit(item: QrLink) {
    setCreating(false);
    setEditing(item);
    setCode(item.code);
    setPageUrl(item.redirectUrl);
    setForwardUrl(item.forwardUrl ?? "");
  }

  function close() {
    setCreating(false);
    setEditing(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const page = pageUrl.trim();
    const forward = forwardUrl.trim();
    if (!page && !forward) {
      setError("Попълнете URL и/или пренасочване.");
      return;
    }
    const linkCode = (editing ? code : code || uniquePageCode()).trim();
    if (!linkCode) {
      setError("Неуспешно генериране на линк.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await saveQrLink(
        site,
        {
          code: linkCode,
          redirectUrl: page || forward,
          forwardUrl: page && forward ? forward : null,
          productId: null,
          productName: null,
          productSlug: null,
        },
        editing?.id,
      );
      close();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно записване");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Изтриване на този QR код?")) return;
    try {
      await deleteQrLink(site, id);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неуспешно изтриване");
    }
  }

  async function copyLink(item: QrLink) {
    try {
      await navigator.clipboard.writeText(goUrl(item.code));
      setCopiedId(item.id);
      window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      setError("Копирането не бе успешно");
    }
  }

  async function downloadQr(item: QrLink) {
    setQrBusy(item.id);
    setError(null);
    try {
      await downloadQrPng(
        goUrl(item.code),
        `metma-qr-${site.toLowerCase()}-${item.code}.png`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "QR кодът не бе генериран");
    } finally {
      setQrBusy(null);
    }
  }

  const open = creating || Boolean(editing);
  const shortUrl = code ? goUrl(code) : "";
  const destination = destinationOf(pageUrl, forwardUrl);
  const visible = useMemo(
    () =>
      items.filter((item) =>
        matchesQuery(query, item.code, item.redirectUrl, item.forwardUrl),
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
            placeholder="Търсене по код или URL…"
          />
        }
      >
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" strokeWidth={2} />
          Нов QR код
        </Button>
      </ListToolbar>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
              : "Все още няма QR кодове. Създайте първия."
          }
        />
      ) : layout === "mobile" ? (
        <div className="admin-mobile-list grid">
          {visible.map((item) => (
            <QrCard
              key={item.id}
              item={item}
              shortUrl={goUrl(item.code)}
              destination={resolveQrDestination(item)}
              copied={copiedId === item.id}
              busy={qrBusy === item.id}
              onCopy={() => copyLink(item)}
              onDownload={() => downloadQr(item)}
              onEdit={() => openEdit(item)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((item) => (
            <QrRow
              key={item.id}
              item={item}
              shortUrl={goUrl(item.code)}
              destination={resolveQrDestination(item)}
              copied={copiedId === item.id}
              busy={qrBusy === item.id}
              onCopy={() => copyLink(item)}
              onDownload={() => downloadQr(item)}
              onEdit={() => openEdit(item)}
              onDelete={() => onDelete(item.id)}
            />
          ))}
        </div>
      )}

      {open ? (
        <Modal
          title={editing ? "Редакция на QR код" : "Нов QR код"}
          description="Напишете URL. Ако попълните пренасочване — при сканиране води там."
          onClose={close}
          footer={
            <>
              <Button variant="secondary" onClick={close}>
                Отказ
              </Button>
              <Button
                type="submit"
                form="qr-form"
                disabled={
                  saving || (!pageUrl.trim() && !forwardUrl.trim())
                }
              >
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
          <form id="qr-form" className="grid gap-6" onSubmit={onSubmit}>
            <FormSection title="Адреси">
              <Field
                label="URL"
                hint="напр. https://metma-de.com/b-622-…/"
              >
                <input
                  className={`${inputClass} font-mono text-xs sm:text-sm`}
                  type="url"
                  autoFocus={!editing}
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  placeholder="https://metma-de.com/b-622-…/"
                />
              </Field>

              <Field
                label="Пренасочи към"
                hint="ако е попълнено — сканирането води тук"
              >
                <input
                  className={`${inputClass} font-mono text-xs sm:text-sm`}
                  type="url"
                  value={forwardUrl}
                  onChange={(e) => setForwardUrl(e.target.value)}
                  placeholder="https://ugc.bg/"
                />
              </Field>

              {destination ? (
                <p className="rounded-xl border border-[var(--admin-line)] bg-white px-3.5 py-2.5 text-xs leading-relaxed">
                  <span className="font-semibold text-[var(--admin-ink)]">
                    При сканиране →{" "}
                  </span>
                  <a
                    href={destination}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all font-mono text-[var(--admin-rose)] hover:underline"
                  >
                    {destination}
                  </a>
                </p>
              ) : null}
            </FormSection>

            <FormSection title="Preview">
              {shortUrl && destination ? (
                <QrPreview
                  value={shortUrl}
                  destination={destination}
                  testable={Boolean(editing)}
                  downloading={qrBusy === (editing?.id ?? "__form__")}
                  onDownload={() => {
                    const id = editing?.id ?? "__form__";
                    setQrBusy(id);
                    void downloadQrPng(
                      shortUrl,
                      `metma-qr-${site.toLowerCase()}-${code}.png`,
                    )
                      .catch((err) =>
                        setError(
                          err instanceof Error
                            ? err.message
                            : "QR кодът не бе генериран",
                        ),
                      )
                      .finally(() => setQrBusy(null));
                  }}
                />
              ) : (
                <p className="rounded-xl border border-dashed border-stone-300 bg-white px-3.5 py-3 text-xs text-[var(--admin-mute)]">
                  Попълнете поне един URL.
                </p>
              )}
            </FormSection>
          </form>
        </Modal>
      ) : null}
    </>
  );
}

function QrCard({
  item,
  shortUrl,
  destination,
  copied,
  busy,
  onCopy,
  onDownload,
  onEdit,
  onDelete,
}: {
  item: QrLink;
  shortUrl: string;
  destination: string;
  copied: boolean;
  busy: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-[var(--admin-radius)] border border-[var(--admin-line)] bg-[var(--admin-paper)] shadow-[0_1px_0_rgba(28,25,23,0.03)]">
      <div className="flex items-start gap-3 border-b border-[var(--admin-line)] px-4 py-3">
        <QrPreview value={shortUrl} compact />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm font-semibold text-[var(--admin-ink)]">
            {item.code}
          </p>
        </div>
      </div>

      <div className="space-y-2 px-4 py-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--admin-mute)]">
          Води към
        </p>
        <a
          href={destination}
          target="_blank"
          rel="noreferrer"
          className="block break-all font-mono text-[0.78rem] leading-relaxed text-[var(--admin-rose)] hover:underline"
        >
          {destination}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-[var(--admin-line)] bg-[color-mix(in_srgb,var(--admin-sand)_40%,white)] p-3">
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[var(--admin-rose-deep)] bg-[var(--admin-rose)] px-2 text-xs font-semibold text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
          Тествай
        </a>
        <Button
          variant="secondary"
          className="!h-10 !text-xs"
          disabled={busy}
          onClick={onDownload}
        >
          <Download className="h-3.5 w-3.5" strokeWidth={2} />
          PNG
        </Button>
        <Button variant="secondary" className="!h-10 !text-xs" onClick={onCopy}>
          {copied ? (
            <Check className="h-3.5 w-3.5" strokeWidth={2} />
          ) : (
            <Copy className="h-3.5 w-3.5" strokeWidth={2} />
          )}
          Копирай
        </Button>
        <Button variant="secondary" className="!h-10 !text-xs" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
          Редакция
        </Button>
        <Button
          variant="danger"
          className="col-span-2 !h-10 !text-xs"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
          Изтрий
        </Button>
      </div>
    </article>
  );
}

function QrRow({
  item,
  shortUrl,
  destination,
  copied,
  busy,
  onCopy,
  onDownload,
  onEdit,
  onDelete,
}: {
  item: QrLink;
  shortUrl: string;
  destination: string;
  copied: boolean;
  busy: boolean;
  onCopy: () => void;
  onDownload: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[var(--admin-radius)] border border-[var(--admin-line)] bg-[var(--admin-paper)] px-4 py-3.5 shadow-[0_1px_0_rgba(28,25,23,0.03)] transition hover:border-[color-mix(in_srgb,var(--admin-rose)_28%,var(--admin-line))]">
      <QrPreview value={shortUrl} compact />

      <div className="min-w-0">
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-[var(--admin-ink)] hover:text-[var(--admin-rose)]"
        >
          /go/?c={item.code}
          <ExternalLink className="h-3 w-3 opacity-45" strokeWidth={2} />
        </a>
        <a
          href={destination}
          target="_blank"
          rel="noreferrer"
          className="mt-1.5 block truncate font-mono text-xs text-[var(--admin-rose)] hover:underline"
          title={destination}
        >
          → {destination}
        </a>
      </div>

      <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
        <a
          href={shortUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[var(--admin-rose-deep)] bg-[var(--admin-rose)] px-3 text-xs font-semibold text-white"
        >
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
          Тествай
        </a>
        <Button
          variant="ghost"
          className="!h-9 !px-2.5"
          onClick={onCopy}
          aria-label="Копирай"
        >
          {copied ? (
            <Check className="h-4 w-4" strokeWidth={2} />
          ) : (
            <Copy className="h-4 w-4" strokeWidth={2} />
          )}
        </Button>
        <Button
          variant="ghost"
          className="!h-9 !px-2.5"
          disabled={busy}
          onClick={onDownload}
          aria-label="PNG"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
        </Button>
        <Button
          variant="secondary"
          className="!h-9 !px-2.5"
          onClick={onEdit}
          aria-label="Редакция"
        >
          <Pencil className="h-4 w-4" strokeWidth={2} />
        </Button>
        <Button
          variant="danger"
          className="!h-9 !px-2.5"
          onClick={onDelete}
          aria-label="Изтрий"
        >
          <Trash2 className="h-4 w-4" strokeWidth={2} />
        </Button>
      </div>
    </article>
  );
}

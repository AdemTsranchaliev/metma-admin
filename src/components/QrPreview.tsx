"use client";

import { useEffect, useState } from "react";
import { qrDataUrl } from "@/lib/qr";
import { Button } from "@/components/forms";
import { Download, ExternalLink, QrCode } from "lucide-react";

type Props = {
  /** URL encoded in the QR (/go/… short link). */
  value: string;
  /** Final destination after /go/ redirect. */
  destination?: string;
  testable?: boolean;
  onDownload?: () => void;
  downloading?: boolean;
  size?: number;
  compact?: boolean;
};

export function QrPreview({
  value,
  destination,
  testable = false,
  onDownload,
  downloading,
  size = 168,
  compact = false,
}: Props) {
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    if (!value.trim()) {
      setSrc(null);
      return;
    }
    setSrc(null);
    void qrDataUrl(value, size * 2)
      .then((url) => {
        if (!cancelled) setSrc(url);
      })
      .catch(() => {
        if (!cancelled) {
          setSrc(null);
          setFailed(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (compact) {
    return (
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--admin-line)] bg-white">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" width={56} height={56} className="h-full w-full" />
        ) : (
          <QrCode className="h-5 w-5 text-[var(--admin-mute)]" strokeWidth={1.5} />
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--admin-line)] bg-white">
      <div className="flex items-center gap-2 border-b border-[var(--admin-line)] bg-[color-mix(in_srgb,var(--admin-sand)_55%,white)] px-3.5 py-2">
        <QrCode
          className="h-3.5 w-3.5 text-[var(--admin-rose)]"
          strokeWidth={2}
        />
        <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--admin-mute)]">
          Preview
        </span>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-[auto_1fr] sm:items-start">
        <div className="mx-auto flex h-[168px] w-[168px] items-center justify-center rounded-xl border border-[var(--admin-line)] bg-[var(--admin-sand)] sm:mx-0">
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt="QR preview"
              width={size}
              height={size}
              className="h-[152px] w-[152px] rounded-lg bg-white p-1"
            />
          ) : failed ? (
            <p className="px-3 text-center text-xs text-red-600">
              QR не се генерира
            </p>
          ) : (
            <p className="px-3 text-center text-xs text-[var(--admin-mute)]">
              {value.trim() ? "Генериране…" : "Въведете код"}
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-3">
          <div className="space-y-2 font-mono text-xs leading-relaxed">
            <p className="break-all text-[var(--admin-ink)]">
              <span className="mr-2 text-[var(--admin-mute)]">QR</span>
              {value || "—"}
            </p>
            {destination ? (
              <p className="break-all text-[var(--admin-rose)]">
                <span className="mr-2 text-[var(--admin-mute)]">→</span>
                {destination}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {testable && value ? (
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[var(--admin-rose-deep)] bg-[var(--admin-rose)] px-3.5 text-sm font-semibold text-white shadow-[0_1px_2px_rgba(201,69,32,0.35)] transition hover:bg-[var(--admin-rose-deep)]"
              >
                <ExternalLink className="h-4 w-4" strokeWidth={2} />
                Тествай
              </a>
            ) : null}
            {onDownload ? (
              <Button
                type="button"
                variant="secondary"
                disabled={downloading || !value}
                onClick={onDownload}
              >
                <Download className="h-4 w-4" strokeWidth={2} />
                {downloading ? "…" : "PNG"}
              </Button>
            ) : null}
          </div>

          <p className="text-[0.72rem] leading-relaxed text-[var(--admin-mute)]">
            {testable
              ? "Тествай отваря /go/… и пренасочва към крайния адрес."
              : "Запазете, после тествайте пренасочването през /go/…"}
          </p>
        </div>
      </div>
    </div>
  );
}

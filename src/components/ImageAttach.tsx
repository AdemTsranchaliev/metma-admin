"use client";

import { useRef, useState } from "react";
import type { SiteCode } from "@/lib/types";
import { uploadAndRegister, uploadFile } from "@/lib/api";
import { AdminThumb } from "@/components/AdminThumb";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "./forms";

type Props = {
  site: SiteCode;
  value?: string | null;
  onChange: (url: string | null) => void;
  /** Also register in media library */
  registerMedia?: boolean;
  label?: string;
};

export function ImageAttach({
  site,
  value,
  onChange,
  registerMedia = false,
  label = "Снимка",
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      if (registerMedia) {
        const asset = await uploadAndRegister(site, file);
        onChange(asset.publicUrl);
      } else {
        const upload = await uploadFile(site, file);
        onChange(upload.publicUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неуспешно качване");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--admin-mute)]">
        {label}
      </p>
      <div className="flex flex-wrap items-start gap-3">
        {value ? (
          <AdminThumb
            src={value}
            width={192}
            className="h-24 w-24 rounded-lg border border-[var(--admin-line)] object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-dashed border-[var(--admin-line)] bg-[var(--admin-sand)] text-xs text-[var(--admin-mute)]">
            Няма снимка
          </div>
        )}
        <div className="flex flex-row flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          />
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? (
              "Качване…"
            ) : value ? (
              <>
                <ImagePlus className="h-4 w-4" strokeWidth={2} />
                Смени снимката
              </>
            ) : (
              <>
                <ImagePlus className="h-4 w-4" strokeWidth={2} />
                Закачи снимка
              </>
            )}
          </Button>
          {value ? (
            <Button variant="danger" onClick={() => onChange(null)}>
              <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
              Премахни
            </Button>
          ) : null}
        </div>
      </div>
      {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
    </div>
  );
}

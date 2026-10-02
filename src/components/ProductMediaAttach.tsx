"use client";

import { useRef, useState } from "react";
import type { SiteCode } from "@/lib/types";
import { uploadAndRegister } from "@/lib/api";
import { AdminThumb } from "@/components/AdminThumb";
import { Button, ToggleCard } from "./forms";
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Trash2,
  Video,
} from "lucide-react";

type Props = {
  site: SiteCode;
  imageUrls: string[];
  videoUrl?: string | null;
  isInstruction?: boolean;
  onImagesChange: (urls: string[]) => void;
  onVideoChange: (url: string | null) => void;
  onInstructionChange: (value: boolean) => void;
};

export function ProductMediaAttach({
  site,
  imageUrls,
  videoUrl,
  isInstruction,
  onImagesChange,
  onVideoChange,
  onInstructionChange,
}: Props) {
  const imageRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<"image" | "video" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function addImages(files: FileList | null) {
    if (!files?.length) return;
    setBusy("image");
    setError(null);
    try {
      const next = [...imageUrls];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const asset = await uploadAndRegister(site, file);
        next.push(asset.publicUrl);
      }
      onImagesChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неуспешно качване");
    } finally {
      setBusy(null);
      if (imageRef.current) imageRef.current.value = "";
    }
  }

  async function addVideo(file: File | null) {
    if (!file) return;
    setBusy("video");
    setError(null);
    try {
      const asset = await uploadAndRegister(site, file);
      onVideoChange(asset.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Неуспешно качване");
    } finally {
      setBusy(null);
      if (videoRef.current) videoRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onImagesChange(imageUrls.filter((_, i) => i !== index));
  }

  function moveImage(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= imageUrls.length) return;
    const next = [...imageUrls];
    [next[index], next[j]] = [next[j], next[index]];
    onImagesChange(next);
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--admin-mute)]">
              Снимки
            </p>
            {imageUrls.length > 0 ? (
              <span className="text-[0.7rem] font-medium text-[var(--admin-mute)]">
                {imageUrls.length} · първата е главна
              </span>
            ) : null}
          </div>

          {imageUrls.length > 0 ? (
            <ul className="mb-2 grid grid-cols-2 gap-2">
              {imageUrls.map((url, index) => (
                <li
                  key={`${url}-${index}`}
                  className={`group relative overflow-hidden rounded-xl border bg-[var(--admin-sand)] ${
                    index === 0
                      ? "border-[color-mix(in_srgb,var(--admin-rose)_45%,var(--admin-line))]"
                      : "border-[var(--admin-line)]"
                  }`}
                >
                  <AdminThumb
                    src={url}
                    width={360}
                    className="aspect-square w-full object-cover"
                  />
                  <span
                    className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-white ${
                      index === 0 ? "bg-[var(--admin-rose)]" : "bg-black/55"
                    }`}
                  >
                    {index === 0 ? "Главна" : `#${index + 1}`}
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-end gap-1 bg-gradient-to-t from-black/55 to-transparent p-1.5 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-[var(--admin-ink)] disabled:opacity-35"
                      disabled={index === 0}
                      onClick={() => moveImage(index, -1)}
                      aria-label="Наляво"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-[var(--admin-ink)] disabled:opacity-35"
                      disabled={index === imageUrls.length - 1}
                      onClick={() => moveImage(index, 1)}
                      aria-label="Надясно"
                    >
                      <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      className="flex h-7 w-7 items-center justify-center rounded-md bg-white/95 text-red-700"
                      onClick={() => removeImage(index)}
                      aria-label="Премахни"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => imageRef.current?.click()}
              className="flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 bg-white px-3 py-5 text-center transition hover:border-[var(--admin-rose)] hover:bg-[var(--admin-rose-soft)] disabled:opacity-50"
            >
              <ImagePlus
                className="h-5 w-5 text-[var(--admin-rose)]"
                strokeWidth={1.75}
              />
              <span className="text-sm font-semibold text-[var(--admin-ink)]">
                Добави снимки
              </span>
              <span className="text-[0.7rem] text-[var(--admin-mute)]">
                JPEG · PNG · WebP
              </span>
            </button>
          )}

          <input
            ref={imageRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            multiple
            className="hidden"
            onChange={(e) => addImages(e.target.files)}
          />
          {imageUrls.length > 0 ? (
            <Button
              variant="secondary"
              className="mt-1 w-full"
              disabled={busy !== null}
              onClick={() => imageRef.current?.click()}
            >
              {busy === "image" ? (
                "Качване…"
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" strokeWidth={2} />
                  Добави още
                </>
              )}
            </Button>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--admin-mute)]">
              Видео
            </p>
            <span className="text-[0.7rem] text-[var(--admin-mute)]">
              до 200 MB
            </span>
          </div>

          {videoUrl ? (
            <div className="overflow-hidden rounded-xl border border-[var(--admin-line)] bg-black">
              <video
                src={videoUrl}
                controls
                className="max-h-44 w-full"
                preload="metadata"
              />
              <div className="flex gap-2 bg-white p-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  disabled={busy !== null}
                  onClick={() => videoRef.current?.click()}
                >
                  {busy === "video" ? "Качване…" : "Смени"}
                </Button>
                <Button variant="danger" onClick={() => onVideoChange(null)}>
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => videoRef.current?.click()}
              className="flex min-h-[7.5rem] w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-stone-300 bg-white px-3 py-5 text-center transition hover:border-[var(--admin-rose)] hover:bg-[var(--admin-rose-soft)] disabled:opacity-50"
            >
              <Video
                className="h-5 w-5 text-[var(--admin-rose)]"
                strokeWidth={1.75}
              />
              <span className="text-sm font-semibold text-[var(--admin-ink)]">
                Добави видео
              </span>
              <span className="text-[0.7rem] text-[var(--admin-mute)]">
                MP4 · WebM · MOV
              </span>
            </button>
          )}

          <input
            ref={videoRef}
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => addVideo(e.target.files?.[0] ?? null)}
          />
        </div>
      </div>

      <ToggleCard
        checked={Boolean(videoUrl && isInstruction)}
        onChange={onInstructionChange}
        disabled={!videoUrl || busy !== null}
        title="Видеото е инструкция"
        description={
          videoUrl
            ? "Показва се и в отделна секция под продукта."
            : "Налично след качване на видео."
        }
      />

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

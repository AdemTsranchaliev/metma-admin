"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/forms";
import { Card } from "@/components/ui";
import { useFirebase } from "@/lib/data-mode";
import { fbFetchHeroFrame, fbSaveHeroFrame } from "@/lib/firebase/store";
import {
  DEFAULT_HERO_FRAME,
  heroMediaStyle,
  type HeroFrame,
  type HeroSide,
} from "@/lib/hero-frame";
import { sitePublicOrigin, type SiteCode } from "@/lib/sites";

export function HeroFrameManager({ site }: { site: SiteCode }) {
  const [frame, setFrame] = useState<HeroFrame>(DEFAULT_HERO_FRAME);
  const [loadedSite, setLoadedSite] = useState<SiteCode | null>(null);
  const loading = loadedSite !== site;
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const videoOrigin = sitePublicOrigin("Bg");
  const videoSrc = `${videoOrigin}/videos/egg-dye-explosion.mp4`;
  const posterSrc = `${videoOrigin}/videos/egg-dye-explosion.jpg`;

  useEffect(() => {
    let cancelled = false;
    fbFetchHeroFrame(site)
      .then((next) => {
        if (!cancelled) {
          setFrame(next);
          setError("");
          setMessage("");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFrame(DEFAULT_HERO_FRAME);
          setError("Не успях да заредя записания кадър. Показана е цялата сцена.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoadedSite(site);
      });
    return () => {
      cancelled = true;
    };
  }, [site]);

  function update(side: keyof HeroFrame, patch: Partial<HeroSide>) {
    setFrame((current) => ({
      ...current,
      [side]: { ...current[side], ...patch },
    }));
    setMessage("");
  }

  async function save() {
    if (!useFirebase) {
      setError("Firebase не е включен в този админ, затова кадърът не може да се запише.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await fbSaveHeroFrame(site, frame);
      setMessage("Кадърът е записан. Презареди началната страница, за да го видиш.");
    } catch {
      setError("Записът не мина. Правилата на базата трябва да позволяват heroFrames.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {site !== "Bg" ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Видеото на началната страница е на България. Избери България от менюто горе, за да нагласиш кадъра на metma-bg.com.
        </p>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <FrameEditor
          title="Компютър"
          hint="Приближение 100% показва цялото видео. Над 100% изрязва кадъра и плъзгачите местят яйцето."
          side={frame.desktop}
          variant="desktop"
          previewClass="aspect-[1600/870] w-full"
          videoSrc={videoSrc}
          posterSrc={posterSrc}
          onChange={(patch) => update("desktop", patch)}
          resetLabel="Цяла сцена"
          onReset={() => update("desktop", DEFAULT_HERO_FRAME.desktop)}
        />
        <FrameEditor
          title="Телефон"
          hint="На телефон прозорецът е по-висок от видеото, затова ляво и дясно вече изрязват. Нагоре и надолу се виждат, когато приближиш."
          side={frame.phone}
          variant="phone"
          previewClass="mx-auto aspect-[390/416] w-[240px]"
          videoSrc={videoSrc}
          posterSrc={posterSrc}
          onChange={(patch) => update("phone", patch)}
          resetLabel="Яйцето вдясно"
          onReset={() => update("phone", DEFAULT_HERO_FRAME.phone)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={save} disabled={loading || saving}>
          {saving ? "Записвам…" : "Запази кадъра"}
        </Button>
        {loading ? <span className="text-sm text-[var(--admin-mute)]">Зареждам…</span> : null}
        {message ? <span className="text-sm text-emerald-700">{message}</span> : null}
        {error ? <span className="text-sm text-red-700">{error}</span> : null}
      </div>
    </div>
  );
}

function FrameEditor({
  title,
  hint,
  side,
  variant,
  previewClass,
  videoSrc,
  posterSrc,
  onChange,
  onReset,
  resetLabel,
}: {
  title: string;
  hint: string;
  side: HeroSide;
  variant: "desktop" | "phone";
  previewClass: string;
  videoSrc: string;
  posterSrc: string;
  onChange: (patch: Partial<HeroSide>) => void;
  onReset: () => void;
  resetLabel: string;
}) {
  const drag = useRef<{ id: number; x: number; y: number; w: number; h: number; side: HeroSide } | null>(
    null,
  );

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      w: rect.width,
      h: rect.height,
      side,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = drag.current;
    if (!start || start.id !== event.pointerId) return;
    // Dragging the picture right reveals its left side, so the focus point moves the other way.
    const dx = ((event.clientX - start.x) / start.w) * 100;
    const dy = ((event.clientY - start.y) / start.h) * 100;
    onChange({
      x: Math.round(Math.min(100, Math.max(0, start.side.x - dx))),
      y: Math.round(Math.min(100, Math.max(0, start.side.y - dy))),
    });
  }

  function endDrag(event: React.PointerEvent<HTMLDivElement>) {
    if (drag.current?.id === event.pointerId) drag.current = null;
  }

  return (
    <Card className="hover:shadow-none">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-[var(--admin-ink)]">{title}</h3>
        <Button variant="ghost" onClick={onReset}>
          {resetLabel}
        </Button>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-[var(--admin-mute)]">{hint}</p>
      <div
        className={`relative cursor-grab touch-none select-none overflow-hidden bg-[#fff8f4] active:cursor-grabbing ${previewClass}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <video
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={heroMediaStyle(side)}
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 ${
            variant === "desktop"
              ? "bg-[linear-gradient(90deg,#fff8f4_0%,rgba(255,248,244,0.92)_28%,rgba(255,248,244,0.35)_48%,transparent_68%)]"
              : "bg-[linear-gradient(180deg,rgba(255,248,244,0.2)_0%,rgba(255,248,244,0.55)_55%,#fff8f4_100%)]"
          }`}
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 flex flex-col justify-center gap-1.5 ${
            variant === "desktop" ? "w-[38%] pl-[5%]" : "w-[62%] pl-[7%]"
          }`}
        >
          <span className="h-1.5 w-1/3 rounded-full bg-[var(--admin-rose)]/70" />
          <span className="h-3 w-full rounded bg-stone-800/70" />
          <span className="h-3 w-4/5 rounded bg-stone-800/70" />
          <span className="mt-1 h-1.5 w-full rounded-full bg-stone-500/50" />
          <span className="h-1.5 w-3/4 rounded-full bg-stone-500/50" />
          <span className="mt-1.5 h-4 w-2/5 rounded-full bg-[var(--admin-rose)]/80" />
        </div>
      </div>
      <p className="mt-2 text-xs text-[var(--admin-mute)]">
        Хвани кадъра и го плъзни, за да го местиш. Сивите ленти показват къде стои текстът.
      </p>
      <div className="mt-4 space-y-3">
        <Slider
          label="Ляво — дясно"
          min={0}
          max={100}
          step={1}
          value={side.x}
          display={`${Math.round(side.x)}%`}
          onChange={(x) => onChange({ x })}
        />
        <Slider
          label="Горе — долу"
          min={0}
          max={100}
          step={1}
          value={side.y}
          display={`${Math.round(side.y)}%`}
          onChange={(y) => onChange({ y })}
        />
        <Slider
          label="Приближение"
          min={80}
          max={220}
          step={1}
          value={Math.round(side.zoom * 100)}
          display={`${Math.round(side.zoom * 100)}%`}
          onChange={(zoom) => onChange({ zoom: zoom / 100 })}
        />
      </div>
    </Card>
  );
}

function Slider({
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-[var(--admin-ink)]">
        <span>{label}</span>
        <span className="tabular-nums text-[var(--admin-mute)]">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--admin-rose)]"
      />
    </label>
  );
}

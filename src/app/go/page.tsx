"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getQrLinkByCode } from "@/lib/api";
import { resolveQrDestination, type SiteCode } from "@/lib/sites";

function normalizeSite(raw: string | null): SiteCode {
  if (raw === "Bg" || raw === "Usa" || raw === "De") return raw;
  return "De";
}

export default function GoPage() {
  const searchParams = useSearchParams();
  const code = (searchParams.get("c") || searchParams.get("code") || "").trim();
  const site = normalizeSite(searchParams.get("site"));
  const [status, setStatus] = useState<"loading" | "missing" | "ok">("loading");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!code) {
        setStatus("missing");
        return;
      }

      const link = await getQrLinkByCode(site, code);
      if (cancelled) return;

      const target = link ? resolveQrDestination(link) : "";
      if (!target) {
        setStatus("missing");
        return;
      }

      setStatus("ok");
      window.location.replace(target);
    })().catch(() => {
      if (!cancelled) setStatus("missing");
    });

    return () => {
      cancelled = true;
    };
  }, [site, code]);

  if (status === "missing") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-[var(--admin-sand)] px-6 text-center">
        <p className="font-semibold text-[var(--admin-ink)]">Линкът не е намерен</p>
        <p className="text-sm text-[var(--admin-mute)]">
          QR кодът е невалиден или няма зададено пренасочване.
        </p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--admin-sand)] px-6">
      <p className="text-sm text-[var(--admin-mute)]">Пренасочване…</p>
    </main>
  );
}

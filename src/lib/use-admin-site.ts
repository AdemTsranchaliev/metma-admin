"use client";

import { useSearchParams } from "next/navigation";
import type { SiteCode } from "@/lib/sites";

export function useAdminSite(): SiteCode {
  const searchParams = useSearchParams();
  const raw = searchParams.get("site");
  if (raw === "Bg" || raw === "Usa" || raw === "De") return raw;
  return "De";
}

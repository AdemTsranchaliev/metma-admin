"use client";

import { HeroFrameManager } from "@/components/HeroFrameManager";
import { PageHeader } from "@/components/ui";
import { useAdminSite } from "@/lib/use-admin-site";

export default function HeroAdminPage() {
  const site = useAdminSite();

  return (
    <>
      <PageHeader
        title="Хиро"
        description="Нагласи кадъра на видеото за началната страница. Компютър и телефон се пазят отделно."
      />
      <HeroFrameManager site={site} />
    </>
  );
}

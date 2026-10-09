"use client";

import { HeroFrameManager } from "@/components/HeroFrameManager";
import { PageHeader } from "@/components/ui";

export default function HeroAdminPage() {
  return (
    <>
      <PageHeader
        title="Хиро"
        description="Нагласи кадъра на видеото за началната страница. Важи за metma-bg.com. Компютър и телефон се пазят отделно."
      />
      <HeroFrameManager />
    </>
  );
}

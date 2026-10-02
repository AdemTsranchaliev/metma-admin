"use client";

import { PageHeader } from "@/components/ui";
import { ProductsManager } from "@/components/ProductsManager";
import { useAdminSite } from "@/lib/use-admin-site";

export default function ProductsPage() {
  const site = useAdminSite();

  return (
    <>
      <PageHeader
        title="Продукти"
        description={`Каталог за ${site}. Добавяне, редакция, няколко снимки и видео.`}
      />
      <ProductsManager site={site} />
    </>
  );
}

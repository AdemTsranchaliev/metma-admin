"use client";

import { PageHeader } from "@/components/ui";
import { CategoriesManager } from "@/components/CategoriesManager";
import { useAdminSite } from "@/lib/use-admin-site";

export default function CategoriesPage() {
  const site = useAdminSite();

  return (
    <>
      <PageHeader
        title="Категории"
        description="Alle / Farbstoffe / Sets… — добавяйте нови категории за каталога."
      />
      <CategoriesManager site={site} />
    </>
  );
}

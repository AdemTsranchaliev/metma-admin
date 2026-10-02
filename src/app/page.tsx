"use client";

import { PageHeader } from "@/components/ui";
import { DashboardCounts } from "@/components/DashboardCounts";
import { useAdminSite } from "@/lib/use-admin-site";

export default function DashboardPage() {
  const site = useAdminSite();

  return (
    <>
      <PageHeader
        title="Табло"
        description="Преглед за избрания пазарен сайт."
      />
      <DashboardCounts site={site} />
    </>
  );
}

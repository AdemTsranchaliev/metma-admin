"use client";

import { PageHeader } from "@/components/ui";
import { PagesManager } from "@/components/PagesManager";
import { useAdminSite } from "@/lib/use-admin-site";

export default function PagesAdminPage() {
  const site = useAdminSite();

  return (
    <>
      <PageHeader
        title="Страници"
        description={`CMS страници за ${site}.`}
      />
      <PagesManager site={site} />
    </>
  );
}

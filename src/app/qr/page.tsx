"use client";

import { PageHeader } from "@/components/ui";
import { QrCodesManager } from "@/components/QrCodesManager";
import { useAdminSite } from "@/lib/use-admin-site";

export default function QrCodesPage() {
  const site = useAdminSite();

  return (
    <>
      <PageHeader
        title="QR кодове"
        description="Напишете URL и по желание пренасочване. При сканиране води към пренасочването (ако го има) или към URL."
      />
      <QrCodesManager site={site} />
    </>
  );
}

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
        description="Напишете име. Домейнът се взима от избрания сайт — metma-de.com, metma-bg.com или metma-usa.com — и QR кодът съдържа целия адрес."
      />
      <QrCodesManager site={site} />
    </>
  );
}

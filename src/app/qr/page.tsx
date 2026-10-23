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
        description="Напишете име и линк за пренасочване. QR кодът съдържа адреса на избрания сайт. Като се отвори, води към поставения линк."
      />
      <QrCodesManager site={site} />
    </>
  );
}

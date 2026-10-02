"use client";

import { PageHeader } from "@/components/ui";
import { MediaManager } from "@/components/MediaManager";
import { useAdminSite } from "@/lib/use-admin-site";

export default function MediaAdminPage() {
  const site = useAdminSite();

  return (
    <>
      <PageHeader
        title="Медия"
        description="Качване и управление на изображения и видеа за този сайт."
      />
      <MediaManager site={site} />
    </>
  );
}

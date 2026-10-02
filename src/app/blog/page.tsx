"use client";

import { PageHeader } from "@/components/ui";
import { BlogManager } from "@/components/BlogManager";
import { useAdminSite } from "@/lib/use-admin-site";

export default function BlogAdminPage() {
  const site = useAdminSite();

  return (
    <>
      <PageHeader title="Блог" description={`Публикации за ${site}.`} />
      <BlogManager site={site} />
    </>
  );
}

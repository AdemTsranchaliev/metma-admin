import { PageHeader } from "@/components/ui";
import { SitesManager } from "@/components/SitesManager";

export default function SitesAdminPage() {
  return (
    <>
      <PageHeader
        title="Сайтове"
        description="Пазарни сайтове, свързани с тази платформа."
      />
      <SitesManager />
    </>
  );
}

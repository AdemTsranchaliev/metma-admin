import { SeedDeCatalog } from "@/components/SeedDeCatalog";

export default function SeedPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-mute)]">
          One-time
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[var(--admin-ink)]">
          Seed DE каталог
        </h1>
      </div>
      <SeedDeCatalog />
    </div>
  );
}

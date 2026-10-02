"use client";

import { useEffect, useState } from "react";
import { getSites, type Site } from "@/lib/api";
import { Badge, EmptyState } from "@/components/ui";
import { SearchField, matchesQuery } from "@/components/SearchField";

export function SitesManager() {
  const [items, setItems] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const sites = await getSites();
        if (!cancelled) setItems(sites);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = items.filter((site) =>
    matchesQuery(
      query,
      String(site.code),
      site.name,
      site.domain,
      site.defaultLocale,
    ),
  );

  return (
    <>
      <div className="mb-4 sm:max-w-sm">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Търсене по име, домейн, код…"
        />
      </div>

      {loading ? (
        <p className="text-sm text-[var(--admin-mute)]">Зареждане…</p>
      ) : visible.length === 0 ? (
        <EmptyState
          message={
            query.trim()
              ? "Няма резултати за това търсене."
              : "Все още няма сайтове."
          }
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {visible.map((site) => (
            <article
              key={site.id}
              className="rounded-[var(--admin-radius)] border border-[var(--admin-line)] bg-[var(--admin-paper)] p-5 shadow-[0_1px_0_rgba(28,25,23,0.03)] transition hover:border-[color-mix(in_srgb,var(--admin-rose)_30%,var(--admin-line))]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--admin-mute)]">
                    {String(site.code)}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold">{site.name}</h3>
                </div>
                {site.isActive ? (
                  <Badge tone="good">Активен</Badge>
                ) : (
                  <Badge tone="warn">Изключен</Badge>
                )}
              </div>
              <p className="mt-3 text-sm text-[var(--admin-mute)]">{site.domain}</p>
              <p className="mt-1 text-xs text-[var(--admin-mute)]">
                Език: {site.defaultLocale}
              </p>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

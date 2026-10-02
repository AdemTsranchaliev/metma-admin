"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentType } from "react";
import {
  ArrowRight,
  FolderTree,
  Newspaper,
  Package,
} from "lucide-react";
import { getDashboardCounts } from "@/lib/api";
import type { SiteCode } from "@/lib/sites";
import { Card } from "@/components/ui";

type CardItem = {
  label: string;
  value: string | number;
  href: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
};

export function DashboardCounts({ site }: { site: SiteCode }) {
  const [cards, setCards] = useState<CardItem[]>([
    {
      label: "Продукти",
      value: "…",
      href: `/products?site=${site}`,
      icon: Package,
    },
    {
      label: "Категории",
      value: "…",
      href: `/categories?site=${site}`,
      icon: FolderTree,
    },
    {
      label: "Блог публикации",
      value: "…",
      href: `/blog?site=${site}`,
      icon: Newspaper,
    },
  ]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const counts = await getDashboardCounts(site);
        if (cancelled) return;
        setCards([
          {
            label: "Продукти",
            value: counts.products,
            href: `/products?site=${site}`,
            icon: Package,
          },
          {
            label: "Категории",
            value: counts.categories,
            href: `/categories?site=${site}`,
            icon: FolderTree,
          },
          {
            label: "Блог публикации",
            value: counts.posts,
            href: `/blog?site=${site}`,
            icon: Newspaper,
          },
        ]);
      } catch {
        if (cancelled) return;
        setCards((prev) => prev.map((card) => ({ ...card, value: "—" })));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [site]);

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.label}
            href={card.href}
            className="admin-fade block"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <Card className="h-full">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--admin-mute)]">
                  {card.label}
                </p>
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--admin-rose-soft)] text-[var(--admin-rose-deep)]">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
              </div>
              <p className="mt-3 text-[2rem] font-semibold tracking-[-0.04em] text-[var(--admin-ink)]">
                {card.value}
              </p>
              <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[var(--admin-rose)]">
                Отвори
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

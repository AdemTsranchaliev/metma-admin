"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ExternalLink,
  FolderTree,
  Globe2,
  ImageIcon,
  LayoutDashboard,
  Menu,
  Newspaper,
  Package,
  QrCode,
  X,
} from "lucide-react";
import { useFirebase } from "@/lib/data-mode";
import { SITE_OPTIONS, siteLocalOrigin, type SiteCode } from "@/lib/sites";
import { useAuth } from "@/lib/firebase/auth";

const nav = [
  { href: "/", label: "Табло", icon: LayoutDashboard },
  { href: "/products", label: "Продукти", icon: Package },
  { href: "/categories", label: "Категории", icon: FolderTree },
  { href: "/qr", label: "QR кодове", icon: QrCode },
  { href: "/blog", label: "Блог", icon: Newspaper },
  { href: "/media", label: "Медия", icon: ImageIcon },
  { href: "/sites", label: "Сайтове", icon: Globe2 },
];

function withSite(href: string, site: string) {
  if (href === "/") return `/?site=${site}`;
  return `${href}?site=${site}`;
}

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const site = (searchParams.get("site") as SiteCode) || "De";
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  function onSiteChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("site", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const currentLabel =
    nav.find((item) => isActive(pathname, item.href))?.label ?? "Админ";

  // Public short links — no admin chrome
  if (pathname === "/go" || pathname.startsWith("/go/")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="relative hidden min-h-screen flex-col bg-[linear-gradient(165deg,var(--admin-sidebar)_0%,var(--admin-sidebar-2)_100%)] text-white lg:flex">
        <div className="border-b border-white/8 px-5 py-6">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--admin-rose)] text-sm font-bold tracking-tight text-white"
            >
              M
            </span>
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                Metma
              </p>
              <h1 className="text-base font-semibold tracking-tight">Админ</h1>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3" aria-label="Навигация">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={withSite(item.href, site)}
                className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-white/12 font-semibold text-white shadow-[inset_3px_0_0_0_var(--admin-rose)]"
                    : "text-white/65 hover:bg-white/8 hover:text-white"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${active ? "text-[var(--admin-rose)]" : "opacity-80"}`}
                  strokeWidth={1.75}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/8 p-4">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/40">
            Активен сайт
          </p>
          <select
            value={site}
            onChange={(e) => onSiteChange(e.target.value)}
            className="mt-2 w-full rounded-lg border border-white/12 bg-white/8 px-3 py-2.5 text-sm text-white outline-none transition focus:border-[var(--admin-rose)]"
          >
            {SITE_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code} className="text-black">
                {opt.label}
              </option>
            ))}
          </select>
          {useFirebase && user ? (
            <button
              type="button"
              onClick={() => void logout()}
              className="mt-3 w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              Изход ({user.email})
            </button>
          ) : null}
        </div>
      </aside>

      {/* Mobile drawer */}
      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-[#1c1917]/50 backdrop-blur-[2px]"
            aria-label="Затвори менюто"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(100%,20rem)] flex-col bg-[linear-gradient(165deg,var(--admin-sidebar)_0%,var(--admin-sidebar-2)_100%)] text-white shadow-[8px_0_40px_-12px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-white/8 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--admin-rose)] text-sm font-bold text-white"
                >
                  M
                </span>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Metma
                  </p>
                  <p className="text-base font-semibold tracking-tight">Админ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label="Затвори"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <nav
              className="flex flex-1 flex-col gap-1 overflow-y-auto p-3"
              aria-label="Мобилна навигация"
            >
              {nav.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={withSite(item.href, site)}
                    onClick={() => setMenuOpen(false)}
                    className={`flex min-h-12 items-center gap-3 rounded-lg px-3.5 py-3 text-[0.95rem] transition ${
                      active
                        ? "bg-white/12 font-semibold text-white shadow-[inset_3px_0_0_0_var(--admin-rose)]"
                        : "text-white/70 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 shrink-0 ${active ? "text-[var(--admin-rose)]" : "opacity-80"}`}
                      strokeWidth={1.75}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="space-y-3 border-t border-white/8 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/40">
                  Активен сайт
                </p>
                <select
                  value={site}
                  onChange={(e) => onSiteChange(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/12 bg-white/8 px-3 py-3 text-sm text-white outline-none transition focus:border-[var(--admin-rose)]"
                >
                  {SITE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code} className="text-black">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {useFirebase && user ? (
                <button
                  type="button"
                  onClick={() => void logout()}
                  className="w-full rounded-lg border border-white/15 px-3 py-2.5 text-xs font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  Изход
                </button>
              ) : null}
              <a
                href={siteLocalOrigin(site)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--admin-rose)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--admin-rose-deep)]"
              >
                Отвори сайта
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
              </a>
            </div>
          </div>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-[var(--admin-line)]/80 bg-[color-mix(in_srgb,var(--admin-paper)_88%,transparent)] pt-[env(safe-area-inset-top)] backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-8 sm:py-4">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[var(--admin-line)] bg-white text-[var(--admin-ink)] transition hover:border-[var(--admin-rose)] hover:text-[var(--admin-rose)] lg:hidden"
                aria-label={menuOpen ? "Затвори менюто" : "Отвори менюто"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                <Menu className="h-5 w-5" strokeWidth={2} />
              </button>

              <div className="min-w-0 lg:hidden">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--admin-mute)]">
                  {SITE_OPTIONS.find((s) => s.code === site)?.label ?? site}
                </p>
                <p className="truncate text-sm font-semibold text-[var(--admin-ink)]">
                  {currentLabel}
                </p>
              </div>

              <div className="hidden min-w-0 lg:block">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--admin-mute)]">
                  Управление
                </p>
                <p className="truncate text-sm font-semibold text-[var(--admin-ink)]">
                  {SITE_OPTIONS.find((s) => s.code === site)?.label ?? site}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <select
                value={site}
                onChange={(e) => onSiteChange(e.target.value)}
                className="hidden h-10 rounded-lg border border-[var(--admin-line)] bg-white px-2.5 text-xs font-medium outline-none sm:block lg:hidden"
                aria-label="Сайт"
              >
                {SITE_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code}>
                    {opt.code}
                  </option>
                ))}
              </select>
              <a
                href={siteLocalOrigin(site)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-lg border border-stone-400 bg-white px-3.5 text-sm font-semibold text-[var(--admin-ink)] shadow-[0_1px_0_rgba(28,25,23,0.06)] transition hover:border-[var(--admin-ink)] hover:bg-[var(--admin-sand)]"
                aria-label="Отвори сайта"
              >
                <span className="hidden sm:inline">Отвори сайта</span>
                <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
              </a>
            </div>
          </div>
        </header>

        <main className="admin-fade px-3 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

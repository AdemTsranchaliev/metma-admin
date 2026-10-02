import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-row flex-wrap items-center justify-between gap-3 sm:mb-8">
      <div>
        <h2 className="text-[1.4rem] font-semibold tracking-[-0.03em] text-[var(--admin-ink)] sm:text-[1.85rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-[var(--admin-mute)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--admin-radius)] border border-[var(--admin-line)] bg-[var(--admin-paper)] p-5 shadow-[0_1px_0_rgba(28,25,23,0.03)] transition hover:border-[color-mix(in_srgb,var(--admin-rose)_35%,var(--admin-line))] hover:shadow-[0_8px_24px_-16px_rgba(28,25,23,0.25)] ${className}`}
    >
      {children}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[var(--admin-radius)] border border-dashed border-[var(--admin-line)] bg-[var(--admin-paper)] px-5 py-14 text-center text-sm text-[var(--admin-mute)]">
      {message}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-[var(--admin-radius)] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      {message}
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "good" | "warn";
}) {
  const styles =
    tone === "good"
      ? "bg-emerald-50 text-emerald-800"
      : tone === "warn"
        ? "bg-amber-50 text-amber-900"
        : "bg-[var(--admin-sand)] text-[var(--admin-mute)]";
  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-[0.7rem] font-semibold tracking-wide ${styles}`}
    >
      {children}
    </span>
  );
}

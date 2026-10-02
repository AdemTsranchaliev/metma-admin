"use client";

import { Search } from "lucide-react";
import { inputClass } from "./forms";

export function matchesQuery(query: string, ...parts: (string | null | undefined)[]) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return parts.some((p) => (p ?? "").toLowerCase().includes(q));
}

export function SearchField({
  value,
  onChange,
  placeholder = "Търсене…",
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative min-w-0 flex-1 ${className}`}>
      <Search
        aria-hidden
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-mute)]"
        strokeWidth={1.75}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${inputClass} pl-9`}
        autoComplete="off"
      />
    </div>
  );
}

export function ListToolbar({
  children,
  search,
}: {
  children?: React.ReactNode;
  search: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-row flex-wrap items-center justify-between gap-3">
      <div className="min-w-[12rem] flex-1 sm:max-w-sm">{search}</div>
      {children ? (
        <div className="flex flex-row flex-wrap items-center justify-end gap-2 [&_button]:w-auto">
          {children}
        </div>
      ) : null}
    </div>
  );
}

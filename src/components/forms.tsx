"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Pencil, Trash2, X } from "lucide-react";

export function Button({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const styles =
    variant === "primary"
      ? "border border-[var(--admin-rose-deep)] bg-[var(--admin-rose)] text-white shadow-[0_1px_2px_rgba(201,69,32,0.35)] hover:bg-[var(--admin-rose-deep)]"
      : variant === "secondary"
        ? "border border-stone-400 bg-white text-[var(--admin-ink)] shadow-[0_1px_0_rgba(28,25,23,0.06)] hover:border-[var(--admin-ink)] hover:bg-[var(--admin-sand)]"
        : variant === "danger"
          ? "border border-red-300 bg-white text-red-700 hover:border-red-600 hover:bg-red-50"
          : "border border-stone-300 bg-white text-[var(--admin-ink)] hover:border-stone-500 hover:bg-[var(--admin-sand)]";

  return (
    <button
      type={type}
      className={`inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex w-full flex-nowrap items-center justify-end gap-2">
      <Button variant="secondary" onClick={onEdit} aria-label="Редакция">
        <Pencil className="h-4 w-4" strokeWidth={2} />
        Редакция
      </Button>
      <Button variant="danger" onClick={onDelete} aria-label="Изтрий">
        <Trash2 className="h-4 w-4" strokeWidth={2} />
        Изтрий
      </Button>
    </div>
  );
}

export function Modal({
  title,
  description,
  children,
  footer,
  onClose,
  wide,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="admin-modal-root fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4 md:p-6">
      <button
        type="button"
        className="admin-modal-backdrop absolute inset-0"
        aria-label="Затвори диалога"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={`admin-modal-panel relative z-10 flex max-h-[min(94dvh,920px)] w-full flex-col overflow-hidden rounded-t-[1.35rem] border border-[var(--admin-line)] bg-[var(--admin-paper)] outline-none sm:max-h-[min(90dvh,880px)] sm:rounded-2xl ${
          wide ? "sm:max-w-3xl" : "sm:max-w-lg"
        }`}
      >
        <div className="admin-modal-handle sm:hidden" aria-hidden />
        <div className="admin-modal-header flex shrink-0 items-start justify-between gap-3 border-b border-[var(--admin-line)] px-4 pb-3.5 pt-2 sm:px-5 sm:py-4">
          <div className="min-w-0 flex-1 border-l-[3px] border-[var(--admin-rose)] py-0.5 pl-3.5 pt-1 sm:pt-0">
            <h2
              id={titleId}
              className="min-w-0 text-[1.05rem] font-semibold leading-snug tracking-tight text-[var(--admin-ink)] sm:text-lg"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descId}
                className="mt-1.5 text-sm leading-relaxed text-[var(--admin-mute)]"
              >
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent text-[var(--admin-mute)] transition hover:border-[var(--admin-line)] hover:bg-white hover:text-[var(--admin-ink)] focus-visible:border-[var(--admin-rose)] focus-visible:shadow-[0_0_0_3px_var(--admin-rose-soft)] sm:mt-0"
            aria-label="Затвори"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>
        <div className="admin-modal-body min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-5 sm:py-5">
          {children}
        </div>
        {footer ? (
          <div className="admin-modal-footer shrink-0 border-t border-[var(--admin-line)] px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-3.5 sm:pb-4 [&_button]:min-h-11 [&_button]:w-full">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3 border-b border-[var(--admin-line)] pb-2">
        <div className="min-w-0">
          <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[var(--admin-ink)]">
            {title}
          </h3>
          {hint ? (
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--admin-mute)]">
              {hint}
            </p>
          ) : null}
        </div>
      </div>
      <div className="grid gap-3.5">{children}</div>
    </section>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[var(--admin-mute)]">
          {label}
        </span>
        {hint ? (
          <span className="text-[0.7rem] font-normal normal-case tracking-normal text-[var(--admin-mute)]">
            {hint}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}

export function ToggleCard({
  checked,
  onChange,
  title,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-start gap-3 rounded-xl border px-3 py-2.5 transition ${
        disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"
      } ${
        checked
          ? "border-[color-mix(in_srgb,var(--admin-rose)_40%,var(--admin-line))] bg-[var(--admin-rose-soft)]"
          : "border-[var(--admin-line)] bg-white hover:border-stone-300"
      }`}
    >
      <input
        type="checkbox"
        className="mt-0.5 h-4 w-4 accent-[var(--admin-rose)]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[var(--admin-ink)]">
          {title}
        </span>
        {description ? (
          <span className="mt-0.5 block text-[0.72rem] leading-relaxed text-[var(--admin-mute)]">
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-[var(--admin-line)] bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-[var(--admin-mute)]/70 hover:border-stone-300 focus:border-[var(--admin-rose)] focus:shadow-[0_0_0_3px_var(--admin-rose-soft)] disabled:cursor-not-allowed disabled:bg-[var(--admin-sand)] disabled:opacity-70";

export const textareaClass = `${inputClass} min-h-[120px] resize-y leading-relaxed`;

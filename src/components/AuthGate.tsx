"use client";

import { FormEvent, useState } from "react";
import { usePathname } from "next/navigation";
import { useFirebase } from "@/lib/data-mode";
import { useAuth } from "@/lib/firebase/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Public QR redirects — no login
  if (pathname === "/go" || pathname.startsWith("/go/")) {
    return <>{children}</>;
  }

  // Login only when Firebase data mode is actually on
  if (!useFirebase) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--admin-sand)]">
        <p className="text-sm text-[var(--admin-mute)]">Зареждане…</p>
      </div>
    );
  }

  if (!user) {
    async function onSubmit(e: FormEvent) {
      e.preventDefault();
      setError("");
      setBusy(true);
      try {
        await login(email.trim(), password);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Неуспешен вход във Firebase",
        );
      } finally {
        setBusy(false);
      }
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--admin-sand)] px-4">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm rounded-xl border border-[var(--admin-line)] bg-white p-6 shadow-sm"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--admin-mute)]">
            Metma Admin
          </p>
          <h1 className="mt-2 text-xl font-bold text-[var(--admin-ink)]">
            Вход с Firebase
          </h1>
          <p className="mt-1 text-sm text-[var(--admin-mute)]">
            Използвайте email/парола от Firebase Authentication.
          </p>

          <label className="mt-5 block text-sm font-medium text-[var(--admin-ink)]">
            Email
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--admin-line)] px-3 py-2.5 outline-none focus:border-[var(--admin-accent)]"
            />
          </label>

          <label className="mt-3 block text-sm font-medium text-[var(--admin-ink)]">
            Парола
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-[var(--admin-line)] px-3 py-2.5 outline-none focus:border-[var(--admin-accent)]"
            />
          </label>

          {error ? (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg border border-[var(--admin-rose-deep)] bg-[var(--admin-rose)] text-sm font-semibold text-white shadow-[0_1px_2px_rgba(201,69,32,0.35)] disabled:opacity-60"
          >
            {busy ? "Влизане…" : "Вход"}
          </button>
        </form>
      </div>
    );
  }

  return <>{children}</>;
}

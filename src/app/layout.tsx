import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Suspense } from "react";
import { AdminShell } from "@/components/AdminShell";
import { AuthGate } from "@/components/AuthGate";
import { AuthProvider } from "@/lib/firebase/auth";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-admin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Metma Админ",
  description: "Админ панел за сайтовете на Metma BG / DE / USA",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" className={manrope.variable}>
      <body>
        <Suspense
          fallback={
            <div className="p-8 text-sm text-[var(--admin-mute)]">Зареждане…</div>
          }
        >
          <AuthProvider>
            <AuthGate>
              <AdminShell>{children}</AdminShell>
            </AuthGate>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { switchUserAction } from "@/app/actions";
import { getDb } from "@/lib/db";
import { listPendingOverdrafts, listUsers } from "@/lib/ledger";
import { getCurrentUser } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grant Fund Tracker",
  description: "Faculty Research Grant & Publication Tracker: grant funds (FR-001)",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const db = getDb();
  const user = await getCurrentUser();
  const users = listUsers(db);
  const pendingCount = user.role === "DEAN" ? listPendingOverdrafts(db).length : 0;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
            <Link href="/" className="font-semibold">Grant Fund Tracker</Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/" className="hover:text-accent">Grants</Link>
              {user.role === "DEAN" && (
                <Link href="/overdrafts" className="hover:text-accent">
                  Overdraft review
                  {pendingCount > 0 && (
                    <span className="badge badge-PENDING ml-1.5">{pendingCount}</span>
                  )}
                </Link>
              )}
            </nav>
            <form action={switchUserAction} className="ml-auto flex items-center gap-2 text-sm">
              <label htmlFor="userId" className="text-muted">Acting as</label>
              <select id="userId" name="userId" defaultValue={user.id} className="input w-auto py-1">
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role === "DEAN" ? "Dean" : "Faculty"})
                  </option>
                ))}
              </select>
              <button className="btn-secondary py-1">Switch</button>
            </form>
          </div>
        </header>
        <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">{children}</main>
      </body>
    </html>
  );
}

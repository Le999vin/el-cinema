import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(209,159,68,0.18),_transparent_40%),_radial-gradient(circle_at_bottom,_rgba(89,54,12,0.35),_transparent_45%),_#0c0b0c]">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,_rgba(217,164,65,0.06),_transparent_30%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl items-center justify-center px-6 py-12">
        <section className="grid w-full overflow-hidden rounded-3xl border border-[color:var(--border-subtle)] bg-[color:var(--panel)] shadow-[0_30px_100px_rgba(0,0,0,0.45)] md:grid-cols-[1.2fr_1fr]">
          <div className="hidden border-r border-[color:var(--border-subtle)] bg-[linear-gradient(145deg,_rgba(201,154,70,0.15),_rgba(26,21,17,0.95))] p-10 md:flex md:flex-col md:justify-between">
            <div>
              <p className="font-[family-name:var(--font-display)] text-4xl text-[color:var(--accent)]">CinemaScope</p>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-[color:var(--text-secondary)]">
                Personal cinema discovery for Zurich. Real showtimes, curated venues, recommendations that explain themselves.
              </p>
            </div>
            <Link href="/" className="text-sm text-[color:var(--text-muted)] transition hover:text-[color:var(--text-primary)]">
              Continue without account
            </Link>
          </div>
          <div className="p-8 sm:p-10">{children}</div>
        </section>
      </div>
    </main>
  );
}


import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  const features = [
    "Service User Timelines",
    "eMAR",
    "Incident Recording",
    "Behaviour Monitoring",
    "Wellbeing Tracking",
    "Digital Body Maps",
    "Handover Management",
    "Reporting & Analytics",
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 sm:px-10 lg:px-14">
        <header className="flex items-center justify-end">
          <Link
            href="/login"
            className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
          >
            Log in
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-14 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div>
            <div className="mb-10">
              <Image
                src="/logo.png"
                alt="Castodia"
                width={430}
                height={125}
                priority
                className="drop-shadow-[0_0_35px_rgba(45,212,191,0.18)]"
              />
            </div>

            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.35em] text-teal-300">
              Helping teams care more
            </p>

            <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Built around care.
Designed for teams.
            </h1>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Castodia is developed by experienced health and social care professionals who understand the challenges faced by providers, managers and frontline staff. Every feature is designed with real-world practice in mind.
            </p>

            <div className="mt-10 inline-flex rounded-full border border-teal-300/25 bg-teal-300/10 px-5 py-3 text-sm font-semibold text-teal-200">
              Currently under active development by Castodia LTD
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-2xl shadow-black/30 backdrop-blur">
            <div className="rounded-[1.5rem] bg-slate-900/90 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Platform areas
              </p>

              <div className="mt-6 grid gap-3">
                {features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-100"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-400/20 text-xs text-teal-300">
                      ✓
                    </span>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-white/10 py-6">
          <div className="flex flex-col gap-2 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Castodia LTD</p>
            <p>Digital care management software in development.</p>
          </div>
        </footer>
      </section>
    </main>
  );
}
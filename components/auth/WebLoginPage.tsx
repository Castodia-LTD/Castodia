"use client";

import Image from "next/image";
import {
  CheckCircle2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { LoginLegalLinks } from "@/components/auth/LoginLegalLinks";

type WebLoginPageProps = {
  email: string;
  password: string;
  loggingIn: boolean;
  sendingReset: boolean;

  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;

  onLogin: () => Promise<void>;
  onForgotPassword: () => Promise<void>;
};

export function WebLoginPage({
  email,
  password,
  loggingIn,
  sendingReset,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onForgotPassword,
}: WebLoginPageProps) {
  return (
    <main className="grid min-h-dvh bg-[#f7f9fb] lg:grid-cols-2">
      {/* Brand panel */}
      <section className="relative hidden min-h-dvh overflow-hidden bg-gradient-to-br from-[#079c9c] via-[#157d7d] to-[#102d3d] px-14 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-16">
        <div
          className="pointer-events-none absolute -right-24 top-20 h-80 w-80 rounded-full border border-white/10"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -right-8 top-48 h-44 w-44 rounded-full border border-white/10"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute bottom-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-300/5 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          aria-hidden="true"
        >
          <div className="absolute left-[18%] top-[34%] h-px w-[48%] rotate-12 bg-white" />
          <div className="absolute left-[38%] top-[47%] h-px w-[42%] -rotate-12 bg-white" />
          <div className="absolute left-[17%] top-[33%] h-3 w-3 rounded-full bg-white" />
          <div className="absolute left-[52%] top-[42%] h-3 w-3 rounded-full bg-white" />
          <div className="absolute left-[76%] top-[37%] h-3 w-3 rounded-full bg-white" />
        </div>

        <div className="relative z-10">
          <Image
            src="/logo.png"
            alt="Castodia"
            width={330}
            height={105}
            priority
            className="h-auto w-[300px] xl:w-[330px]"
          />

          <div className="mt-20 max-w-2xl">
            <h1 className="text-5xl font-bold leading-[1.1] tracking-tight xl:text-6xl">
              Better care.
              <br />
              Better connected.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-cyan-50/90 xl:text-xl">
              Secure digital care management designed for
              supported living, residential care and
              community services.
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <div className="grid max-w-2xl gap-3 text-sm text-cyan-50/90 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <ShieldCheck
                className="h-5 w-5 shrink-0 text-cyan-200"
                aria-hidden="true"
              />
              Role-based access
            </div>

            <div className="flex items-center gap-3">
              <LockKeyhole
                className="h-5 w-5 shrink-0 text-cyan-200"
                aria-hidden="true"
              />
              Secure cloud platform
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2
                className="h-5 w-5 shrink-0 text-cyan-200"
                aria-hidden="true"
              />
              Complete audit trails
            </div>

            <div className="flex items-center gap-3">
              <CheckCircle2
                className="h-5 w-5 shrink-0 text-cyan-200"
                aria-hidden="true"
              />
              Built for social care
            </div>
          </div>
        </div>
      </section>

      {/* Login panel */}
      <section className="relative flex min-h-dvh flex-col bg-[#f7f9fb] px-5 py-8 sm:px-8 lg:px-12">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-lg">
            <div className="mb-10 text-center lg:hidden">
              <Image
                src="/logo.png"
                alt="Castodia"
                width={280}
                height={90}
                priority
                className="mx-auto h-auto w-[260px]"
              />
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-white px-6 py-8 shadow-[0_22px_55px_rgba(15,23,42,0.10)] sm:px-10 sm:py-10">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Welcome back
              </h2>

              <p className="mt-3 text-base leading-7 text-slate-500">
                Sign in to access your secure Castodia
                workspace.
              </p>

              <form
                className="mt-9 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  void onLogin();
                }}
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      onEmailChange(event.target.value)
                    }
                    disabled={loggingIn}
                    className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="name@organisation.co.uk"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-800"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) =>
                      onPasswordChange(event.target.value)
                    }
                    disabled={loggingIn}
                    className="h-14 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loggingIn}
                  className="flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#079c9c] to-[#65d0c7] px-5 text-base font-bold text-white shadow-[0_12px_28px_rgba(13,148,136,0.24)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loggingIn
                    ? "Signing in..."
                    : "Sign in"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void onForgotPassword()
                  }
                  disabled={
                    sendingReset ||
                    loggingIn
                  }
                  className="w-full text-center text-sm font-semibold text-teal-700 transition hover:text-teal-900 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sendingReset
                    ? "Sending reset email..."
                    : "Forgotten your password?"}
                </button>
              </form>

              <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                <p className="text-sm font-medium text-slate-600">
                  Having trouble signing in?
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Contact your organisation administrator or
                  email{" "}
                  <a
                    href="mailto:support@castodia.co.uk"
                    className="font-semibold text-teal-700 transition hover:text-teal-900 hover:underline"
                  >
                    support@castodia.co.uk
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <footer className="pt-8 text-center text-sm text-slate-500">
          <LoginLegalLinks />

          <p className="mt-4">© 2026 Castodia LTD</p>

          <p className="mt-1 text-xs text-slate-400">
            Care records. Protected.
          </p>
        </footer>
      </section>
    </main>
  );
}


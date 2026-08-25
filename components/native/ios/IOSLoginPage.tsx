"use client";

import Image from "next/image";
import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

type IOSLoginPageProps = {
  email: string;
  password: string;
  loggingIn: boolean;
  sendingReset: boolean;

  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;

  onLogin: () => Promise<void>;
  onForgotPassword: () => Promise<void>;
};

export function IOSLoginPage({
  email,
  password,
  loggingIn,
  sendingReset,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onForgotPassword,
}: IOSLoginPageProps) {
  return (
    <main
      className={[
        "relative min-h-dvh overflow-hidden",
        "bg-gradient-to-b from-[#063b40] via-[#07565c] to-[#08757a]",
        "text-white",
      ].join(" ")}
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="pointer-events-none absolute -right-28 bottom-20 h-80 w-80 rounded-full bg-teal-100/10 blur-3xl"
        aria-hidden="true"
      />

      <div
        className={[
          "relative z-10 flex min-h-dvh flex-col",
          "px-6",
          "pt-[calc(26px+env(safe-area-inset-top))]",
          "pb-[calc(24px+env(safe-area-inset-bottom))]",
        ].join(" ")}
      >
        {/* Brand */}
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-10 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[30px] border border-white/15 bg-white/10 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <Image
                src="/castodia-mark.png"
                alt=""
                width={72}
                height={72}
                priority
                className="h-[70px] w-[70px] object-contain"
              />
            </div>

            <Image
              src="/logo.png"
              alt="Castodia"
              width={240}
              height={80}
              priority
              className="mx-auto mt-6 h-auto w-[210px] brightness-0 invert"
            />

            <p className="mt-3 text-sm font-medium tracking-wide text-cyan-50/70">
              Care records. Protected.
            </p>
          </div>

          {/* Login card */}
          <section
            className={[
              "rounded-[30px]",
              "border border-white/15",
              "bg-white/10",
              "p-5",
              "shadow-[0_24px_70px_rgba(2,6,23,0.24)]",
              "backdrop-blur-xl",
            ].join(" ")}
          >
            <div className="mb-7">
              <p className="text-sm font-semibold text-cyan-100">
                Secure access
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-cyan-50/70">
                Sign in to your Castodia workspace.
              </p>
            </div>

            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                void onLogin();
              }}
            >
              <div>
                <label
                  htmlFor="ios-email"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  Email address
                </label>

                <input
                  id="ios-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                  value={email}
                  onChange={(event) =>
                    onEmailChange(event.target.value)
                  }
                  disabled={loggingIn}
                  placeholder="name@organisation.co.uk"
                  className={[
                    "h-14 w-full rounded-2xl",
                    "border border-white/20",
                    "bg-white/95 px-4",
                    "text-base text-slate-950",
                    "outline-none",
                    "placeholder:text-slate-400",
                    "focus:border-cyan-300",
                    "focus:ring-4 focus:ring-cyan-300/20",
                    "disabled:opacity-60",
                  ].join(" ")}
                />
              </div>

              <div>
                <label
                  htmlFor="ios-password"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  Password
                </label>

                <input
                  id="ios-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) =>
                    onPasswordChange(event.target.value)
                  }
                  disabled={loggingIn}
                  placeholder="Enter your password"
                  className={[
                    "h-14 w-full rounded-2xl",
                    "border border-white/20",
                    "bg-white/95 px-4",
                    "text-base text-slate-950",
                    "outline-none",
                    "placeholder:text-slate-400",
                    "focus:border-cyan-300",
                    "focus:ring-4 focus:ring-cyan-300/20",
                    "disabled:opacity-60",
                  ].join(" ")}
                />
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className={[
                  "mt-2 flex h-14 w-full",
                  "items-center justify-center",
                  "rounded-2xl bg-white",
                  "text-base font-bold text-[#087078]",
                  "shadow-[0_12px_28px_rgba(2,6,23,0.18)]",
                  "transition",
                  "active:scale-[0.985]",
                  "disabled:cursor-not-allowed",
                  "disabled:opacity-60",
                ].join(" ")}
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
                className={[
                  "w-full py-2 text-center",
                  "text-sm font-semibold",
                  "text-cyan-50/90",
                  "disabled:opacity-60",
                ].join(" ")}
              >
                {sendingReset
                  ? "Sending reset email..."
                  : "Forgotten your password?"}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-2 border-t border-white/10 pt-5 text-xs font-medium text-cyan-50/60">
              <ShieldCheck
                size={15}
                aria-hidden="true"
              />

              Secure Castodia access

              <LockKeyhole
                size={14}
                aria-hidden="true"
              />
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="pt-7 text-center">
          <p className="text-xs font-medium text-cyan-50/50">
            Castodia 4.2.1
          </p>

          <p className="mt-1 text-[11px] text-cyan-50/35">
            © 2026 Castodia LTD
          </p>
        </footer>
      </div>
    </main>
  );
}
"use client";

import Image from "next/image";
import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { LoginLegalLinks } from "@/components/auth/LoginLegalLinks";

import type {
  IOSLoginViewProps,
} from "../IOSLoginPage";
import { IOSLoginForm } from "./IOSLoginForm";

export function CoreIOSLoginPage(
  props: IOSLoginViewProps,
) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#061825] via-[#082d43] to-[#0b4f66] text-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-0 h-80 w-80 rounded-full bg-cyan-300/10 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-sky-200/10 blur-3xl"
      />

      <div
        className={[
          "relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col",
          "px-6",
          "pt-[calc(34px+env(safe-area-inset-top))]",
          "pb-[calc(24px+env(safe-area-inset-bottom))]",
        ].join(" ")}
      >
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-9 text-center">
            <Image
              src="/CastodiaCore.png"
              alt="CastodiaCore"
              width={300}
              height={120}
              priority
              className="mx-auto h-auto w-[250px] object-contain"
            />

            <p className="mt-4 text-sm font-medium tracking-wide text-cyan-100/70">
              Castodia administration and control
            </p>
          </div>

          <section className="rounded-[28px] border border-white/12 bg-white/10 p-6 shadow-[0_26px_70px_rgba(0,0,0,0.24)] backdrop-blur-xl">
            <div className="mb-7">
              <p className="text-sm font-semibold text-cyan-100">
                Secure access
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-cyan-50/65">
                Sign in to CastodiaCore.
              </p>
            </div>

            <IOSLoginForm
              {...props}
              variant="core"
            />
          </section>
        </div>

        <footer className="pt-7 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-cyan-50/45">
            <ShieldCheck
              size={14}
              aria-hidden="true"
            />

            Secure CastodiaCore access

            <LockKeyhole
              size={13}
              aria-hidden="true"
            />
          </div>

          <div className="mt-4">
            <LoginLegalLinks variant="dark" />
          </div>

          <p className="mt-3 text-[11px] text-cyan-50/30">
            © 2026 Castodia LTD
          </p>
        </footer>
      </div>
    </main>
  );
}


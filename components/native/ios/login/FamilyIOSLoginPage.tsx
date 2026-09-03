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

export function FamilyIOSLoginPage(
  props: IOSLoginViewProps,
) {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-gradient-to-b from-[#718371] via-[#657765] to-[#566856] text-[#34423b]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-24 h-[380px] w-[380px] rounded-full bg-[#d9dfcd]/30 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-36 -left-24 h-[380px] w-[380px] rounded-full bg-[#d6c1a6]/25 blur-3xl"
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
          <div className="mb-8 text-center">
            <div className="mx-auto inline-flex rounded-[28px] border border-white/25 bg-[#f8f5ee]/95 px-6 py-5 shadow-[0_18px_45px_rgba(39,50,41,0.16)] backdrop-blur">
              <Image
                src="/castodia-family-logo.png"
                alt="CastodiaFamily"
                width={1254}
                height={387}
                priority
                className="h-auto w-[245px] object-contain"
              />
            </div>

            <p className="mx-auto mt-5 max-w-[290px] text-sm leading-6 text-white/80">
              A meaningful window into the moments that matter.
            </p>
          </div>

          <section className="rounded-[28px] border border-white/25 bg-[#f8f5ee]/95 p-6 shadow-[0_24px_60px_rgba(39,50,41,0.16)] backdrop-blur-xl">
            <div className="mb-7">
              <p className="text-sm font-semibold text-[#5f735f]">
                Family access
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#34423b]">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-[#83796b]">
                Sign in to CastodiaFamily.
              </p>
            </div>

            <IOSLoginForm
              {...props}
              variant="family"
            />
          </section>
        </div>

        <footer className="pt-7 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-white/60">
            <ShieldCheck
              size={14}
              aria-hidden="true"
            />

            Secure CastodiaFamily access

            <LockKeyhole
              size={13}
              aria-hidden="true"
            />
          </div>

          <div className="mt-4">
            <LoginLegalLinks variant="family" />
          </div>

          <p className="mt-3 text-[11px] text-white/40">
            © 2026 Castodia LTD
          </p>
        </footer>
      </div>
    </main>
  );
}


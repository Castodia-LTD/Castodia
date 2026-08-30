"use client";

import Image from "next/image";
import {
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import type {
  IOSLoginViewProps,
} from "../IOSLoginPage";
import { IOSLoginForm } from "./IOSLoginForm";

export function CareIOSLoginPage(
  props: IOSLoginViewProps,
) {
  return (
    <main className="min-h-dvh bg-[#f5f8f9] text-slate-950">
      <div
        className={[
          "mx-auto flex min-h-dvh w-full max-w-md flex-col",
          "px-6",
          "pt-[calc(34px+env(safe-area-inset-top))]",
          "pb-[calc(24px+env(safe-area-inset-bottom))]",
        ].join(" ")}
      >
        <div className="flex flex-1 flex-col justify-center">
          <div className="mb-9 text-center">
            <Image
              src="/logo.png"
              alt="CastodiaCare"
              width={330}
              height={105}
              priority
              className="mx-auto h-auto w-[245px] object-contain"
            />

            <p className="mt-4 text-sm font-semibold tracking-wide text-[#08757a]">
             
            </p>
          </div>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_22px_55px_rgba(15,23,42,0.09)]">
            <div className="mb-7">
              <p className="text-sm font-semibold text-[#08757a]">
                CastodiaCare
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to continue to your care workspace.
              </p>
            </div>

            <IOSLoginForm
              {...props}
              variant="care"
            />
          </section>
        </div>

        <footer className="pt-7 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <ShieldCheck
              size={14}
              aria-hidden="true"
            />

            Secure CastodiaCare access

            <LockKeyhole
              size={13}
              aria-hidden="true"
            />
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            © 2026 Castodia LTD
          </p>
        </footer>
      </div>
    </main>
  );
}
"use client";

import { Fingerprint } from "lucide-react";

import type {
  IOSLoginViewProps,
} from "../IOSLoginPage";

type Props =
  IOSLoginViewProps & {
    variant:
      | "care"
      | "core"
      | "family";
  };

export function IOSLoginForm({
  variant,
  email,
  password,
  loggingIn,
  sendingReset,
  quickSignInEnabled = false,
  quickSigningIn = false,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onQuickSignIn,
  onForgotPassword,
}: Props) {
  const isCare =
    variant === "care";

  const isFamily =
    variant === "family";

  const busy = loggingIn || quickSigningIn;

  const labelClass = isCare
    ? "text-slate-800"
    : isFamily
      ? "text-[#3f4e45]"
      : "text-white";

  const inputClass = isCare
    ? [
        "border-slate-300 bg-[#f8fafb]",
        "text-slate-950 placeholder:text-slate-400",
        "focus:border-[#079c9c]",
        "focus:bg-white",
        "focus:ring-[#079c9c]/15",
      ].join(" ")
    : isFamily
      ? [
          "border-[#d8d0c2] bg-white/85",
          "text-[#34423b] placeholder:text-[#9d978c]",
          "focus:border-[#5f735f]",
          "focus:ring-[#d9dfcd]/70",
        ].join(" ")
      : [
          "border-white/20 bg-white/95",
          "text-slate-950 placeholder:text-slate-400",
          "focus:border-cyan-300",
          "focus:ring-cyan-300/20",
        ].join(" ");

  const buttonClass = isCare
    ? [
        "bg-gradient-to-r from-[#08757a] to-[#079c9c]",
        "text-white",
        "shadow-[0_12px_28px_rgba(7,117,122,0.22)]",
      ].join(" ")
    : isFamily
      ? [
          "bg-[#5f735f]",
          "text-white",
          "shadow-[0_12px_28px_rgba(95,115,95,0.22)]",
        ].join(" ")
      : [
          "bg-white",
          "text-[#0b6176]",
          "shadow-[0_12px_28px_rgba(0,0,0,0.18)]",
        ].join(" ");

  const secondaryButtonClass = isCare
    ? "border-[#08757a]/25 bg-[#08757a]/5 text-[#08757a]"
    : isFamily
      ? "border-[#5f735f]/25 bg-[#5f735f]/5 text-[#5f735f]"
      : "border-white/25 bg-white/10 text-white";

  const forgotClass = isCare
    ? "text-[#08757a]"
    : isFamily
      ? "text-[#5f735f]"
      : "text-cyan-50/90";

  return (
    <form
      className="space-y-4"
      autoComplete="on"
      onSubmit={(event) => {
        event.preventDefault();
        void onLogin();
      }}
    >
      {quickSignInEnabled && onQuickSignIn ? (
        <>
          <button
            type="button"
            onClick={() => void onQuickSignIn()}
            disabled={busy}
            className={[
              "flex h-14 w-full items-center justify-center gap-2 rounded-2xl border",
              "text-base font-bold transition active:scale-[0.985]",
              "disabled:cursor-not-allowed disabled:opacity-60",
              secondaryButtonClass,
            ].join(" ")}
          >
            <Fingerprint size={22} aria-hidden="true" />
            {quickSigningIn
              ? "Checking Face ID / Touch ID..."
              : "Sign in with Face ID / Touch ID"}
          </button>

          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-current opacity-10" />
            <span className="text-xs font-semibold uppercase tracking-wider opacity-45">
              or use password
            </span>
            <div className="h-px flex-1 bg-current opacity-10" />
          </div>
        </>
      ) : null}

      <div>
        <label
          htmlFor={`ios-email-${variant}`}
          className={[
            "mb-2 block text-sm font-semibold",
            labelClass,
          ].join(" ")}
        >
          Email address
        </label>

        <input
          id={`ios-email-${variant}`}
          name="username"
          type="email"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          value={email}
          onChange={(event) =>
            onEmailChange(
              event.target.value,
            )
          }
          disabled={busy}
          placeholder={
            isFamily
              ? "your@email.co.uk"
              : "name@organisation.co.uk"
          }
          className={[
            "h-14 w-full rounded-2xl border px-4",
            "text-base outline-none transition",
            "focus:ring-4",
            "disabled:cursor-not-allowed disabled:opacity-60",
            inputClass,
          ].join(" ")}
        />
      </div>

      <div>
        <label
          htmlFor={`ios-password-${variant}`}
          className={[
            "mb-2 block text-sm font-semibold",
            labelClass,
          ].join(" ")}
        >
          Password
        </label>

        <input
          id={`ios-password-${variant}`}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) =>
            onPasswordChange(
              event.target.value,
            )
          }
          disabled={busy}
          placeholder="Enter your password"
          className={[
            "h-14 w-full rounded-2xl border px-4",
            "text-base outline-none transition",
            "focus:ring-4",
            "disabled:cursor-not-allowed disabled:opacity-60",
            inputClass,
          ].join(" ")}
        />
      </div>

      <button
        type="submit"
        disabled={busy}
        className={[
          "mt-2 flex h-14 w-full items-center justify-center",
          "rounded-2xl text-base font-bold transition",
          "active:scale-[0.985]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          buttonClass,
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
          busy
        }
        className={[
          "w-full py-2 text-center text-sm font-semibold",
          "transition disabled:cursor-not-allowed disabled:opacity-60",
          forgotClass,
        ].join(" ")}
      >
        {sendingReset
          ? "Sending reset email..."
          : "Forgotten your password?"}
      </button>
    </form>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type AccountType =
  | "family"
  | "support"
  | "manager"
  | "castodia_admin"
  | "castodia_owner";

function getAccountLabel(
  accountType: AccountType | null,
) {
  switch (accountType) {
    case "family":
      return "Family account";

    case "support":
      return "CastodiaCare Support account";

    case "manager":
      return "CastodiaCare Manager account";

    case "castodia_admin":
      return "CastodiaCore Admin account";

    case "castodia_owner":
      return "Castodia Owner account";

    default:
      return "Castodia account";
  }
}

function getWelcomeMessage(
  accountType: AccountType | null,
) {
  switch (accountType) {
    case "family":
      return "Finish setting up your secure CastodiaFamily access.";

    case "support":
      return "Finish setting up your CastodiaCare Support account.";

    case "manager":
      return "Finish setting up your CastodiaCare Manager account.";

    case "castodia_admin":
      return "Finish setting up your CastodiaCore administrator account.";

    case "castodia_owner":
      return "Finish setting up your Castodia owner account.";

    default:
      return "Finish setting up your Castodia account.";
  }
}

function isAccountType(
  value: unknown,
): value is AccountType {
  return (
    value === "family" ||
    value === "support" ||
    value === "manager" ||
    value === "castodia_admin" ||
    value === "castodia_owner"
  );
}

export default function AccountSetupPage() {
  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [fullName, setFullName] =
    useState("");

  const [accountType, setAccountType] =
    useState<AccountType | null>(null);

  const [password, setPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState<string | null>(null);

  const [complete, setComplete] =
    useState(false);

  useEffect(() => {
    let mounted = true;

    async function initialiseInvite() {
      try {
        setLoading(true);
        setErrorMessage(null);

        /*
         * Supabase invite links using the implicit
         * flow return the invited user's session
         * in the URL hash:
         *
         * #access_token=...
         * &refresh_token=...
         * &type=invite
         *
         * We MUST establish this session before
         * calling getUser(), otherwise an existing
         * logged-in Castodia user in local storage
         * may be returned instead.
         */
        const hash = window.location.hash;

        if (hash) {
          const hashParams =
            new URLSearchParams(
              hash.substring(1),
            );

          const accessToken =
            hashParams.get("access_token");

          const refreshToken =
            hashParams.get("refresh_token");

          const inviteType =
            hashParams.get("type");

          if (
            accessToken &&
            refreshToken &&
            inviteType === "invite"
          ) {
            const {
              data: sessionData,
              error: sessionError,
            } =
              await supabase.auth.setSession({
                access_token:
                  accessToken,

                refresh_token:
                  refreshToken,
              });

            if (sessionError) {
              throw sessionError;
            }

            if (!sessionData.user) {
              throw new Error(
                "The invited account could not be authenticated.",
              );
            }

            /*
             * Remove the sensitive tokens from
             * the visible browser URL after the
             * session has been established.
             */
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname +
                window.location.search,
            );
          }
        }

        /*
         * Only NOW do we ask Supabase which
         * user is authenticated.
         */
        const {
          data: { user },
          error: userError,
        } =
          await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error(
            "Your invitation could not be verified. It may have expired or already been used.",
          );
        }

        if (!mounted) {
          return;
        }

        const metadata =
          user.user_metadata ?? {};

        setFullName(
          typeof metadata.full_name ===
            "string"
            ? metadata.full_name
            : "",
        );

        setAccountType(
          isAccountType(
            metadata.account_type,
          )
            ? metadata.account_type
            : null,
        );
      } catch (error) {
        console.error(
          "Invite setup error:",
          error,
        );

        if (!mounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Your invitation could not be verified.",
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void initialiseInvite();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage(
        "Your password must contain at least 8 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        "The passwords you entered do not match.",
      );
      return;
    }

    setSubmitting(true);

    try {
      /*
       * Confirm we're still operating on the
       * invited session before changing anything.
       */
      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "Your invitation session is no longer available. Please reopen your invitation email.",
        );
      }

      const {
        data,
        error,
      } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error(
          "Your password could not be saved.",
        );
      }

      setComplete(true);

      /*
       * Temporary redirect.
       *
       * Next we'll replace this with the
       * authoritative Castodia access resolver.
       */
      window.setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 1200);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Your password could not be created.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-cyan-600 to-teal-400 text-white shadow-[0_12px_30px_rgba(13,148,136,0.2)]">
            <LockKeyhole size={24} />
          </div>

          <Loader2 className="mx-auto mt-6 h-6 w-6 animate-spin text-teal-600" />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Checking your invitation...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 -top-48 h-[520px] w-[520px] rounded-full bg-cyan-200/30 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -right-40 h-[520px] w-[520px] rounded-full bg-teal-200/30 blur-3xl"
      />

      <section className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-to-br from-cyan-600 to-teal-400 text-white shadow-[0_12px_30px_rgba(13,148,136,0.22)]">
            <LockKeyhole size={24} />
          </div>

          <p className="mt-4 text-2xl font-bold tracking-[-0.03em] text-slate-950">
            Castodia
          </p>

          <p className="mt-1 text-sm font-semibold text-teal-700">
            {getAccountLabel(accountType)}
          </p>
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-8">
          {complete ? (
            <div className="py-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <Check size={25} />
              </div>

              <h1 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-slate-950">
                You&apos;re all set
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Your Castodia account has
                been set up successfully.
              </p>
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-semibold text-teal-700">
                  Welcome
                  {fullName
                    ? `, ${fullName}`
                    : ""}
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950">
                  Create your password
                </h1>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {getWelcomeMessage(
                    accountType,
                  )}
                </p>
              </div>

              {errorMessage ? (
                <div
                  role="alert"
                  className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
                >
                  {errorMessage}
                </div>
              ) : null}

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >
                <div>
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative mt-2">
                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value,
                        )
                      }
                      autoComplete="new-password"
                      disabled={submitting}
                      className="min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 pr-12 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:opacity-60"
                      placeholder="Create a password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) =>
                            !current,
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    Use at least 8 characters.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirm-password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="new-password"
                    disabled={submitting}
                    className="mt-2 min-h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 disabled:opacity-60"
                    placeholder="Enter it again"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-400 px-5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(13,148,136,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Creating password...
                    </>
                  ) : (
                    "Complete setup"
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500">
          Secure account setup powered by
          Castodia.
        </p>
      </section>
    </main>
  );
}
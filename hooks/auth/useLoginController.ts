"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  authenticateCastodiaUser,
  authenticateCastodiaWithPasskey,
  registerCastodiaPasskey,
  type LoginProduct,
} from "@/lib/auth/login";
import { requestPasswordReset } from "@/lib/auth/password-reset";

type Options = {
  product?: LoginProduct;
  enableQuickSignIn?: boolean;
};

function quickSignInKey(product: LoginProduct) {
  return `castodia.quick-sign-in.${product}`;
}

function browserSupportsPasskeys() {
  return (
    typeof window !== "undefined" &&
    typeof window.PublicKeyCredential !== "undefined"
  );
}

export function useLoginController({
  product = "auto",
  enableQuickSignIn = false,
}: Options = {}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [quickSigningIn, setQuickSigningIn] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [quickSignInEnabled, setQuickSignInEnabled] = useState(false);

  const quickSignInStorageKey = useMemo(
    () => quickSignInKey(product),
    [product],
  );

  useEffect(() => {
    if (!enableQuickSignIn || !browserSupportsPasskeys()) {
      setQuickSignInEnabled(false);
      return;
    }

    setQuickSignInEnabled(
      window.localStorage.getItem(quickSignInStorageKey) === "enabled",
    );
  }, [enableQuickSignIn, quickSignInStorageKey]);

  async function offerQuickSignIn() {
    if (!enableQuickSignIn || !browserSupportsPasskeys()) return;
    if (window.localStorage.getItem(quickSignInStorageKey) === "enabled") return;

    const accepted = window.confirm(
      "Use Face ID or Touch ID for faster sign-in next time? Only enable this on a device you trust and do not share with other staff.",
    );

    if (!accepted) return;

    try {
      await registerCastodiaPasskey();
      window.localStorage.setItem(quickSignInStorageKey, "enabled");
      setQuickSignInEnabled(true);
    } catch (error) {
      // Quick sign-in is optional. A cancelled or unavailable biometric prompt
      // must never prevent a successful password sign-in.
      console.warn("Quick sign-in setup was not completed:", error);
    }
  }

  async function login() {
    if (loggingIn || quickSigningIn) return;
    setLoggingIn(true);
    try {
      const result = await authenticateCastodiaUser(email, password, product);
      await offerQuickSignIn();
      setPassword("");
      router.replace(result.destination);
      router.refresh();
    } catch (error) {
      console.error("Login failed:", error);
      alert(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function quickSignIn() {
    if (loggingIn || quickSigningIn) return;
    setQuickSigningIn(true);
    try {
      const result = await authenticateCastodiaWithPasskey(product);
      router.replace(result.destination);
      router.refresh();
    } catch (error) {
      console.error("Quick sign-in failed:", error);
      alert(
        "Face ID / Touch ID sign-in could not be completed. You can still sign in with your password.",
      );
    } finally {
      setQuickSigningIn(false);
    }
  }

  async function forgotPassword() {
    if (sendingReset) return;
    setSendingReset(true);
    try {
      await requestPasswordReset(email, `${window.location.origin}/reset-password`);
      alert("A password reset email has been sent. Please check your inbox.");
    } catch (error) {
      console.error("Password reset failed:", error);
      alert(error instanceof Error ? error.message : "Unable to send the password reset email.");
    } finally {
      setSendingReset(false);
    }
  }

  return {
    email,
    password,
    loggingIn,
    quickSigningIn,
    quickSignInEnabled,
    sendingReset,
    setEmail,
    setPassword,
    login,
    quickSignIn,
    forgotPassword,
  };
}

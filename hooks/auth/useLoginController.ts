"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  authenticateCastodiaUser,
  type LoginProduct,
} from "@/lib/auth/login";
import { requestPasswordReset } from "@/lib/auth/password-reset";

type Options = {
  product?: LoginProduct;
};

export function useLoginController({ product = "auto" }: Options = {}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  async function login() {
    if (loggingIn) return;
    setLoggingIn(true);

    try {
      const destination = await authenticateCastodiaUser(email, password, product);
      router.replace(destination);
      router.refresh();
    } catch (error) {
      console.error("Login failed:", error);
      alert(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoggingIn(false);
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
      alert(
        error instanceof Error
          ? error.message
          : "Unable to send the password reset email.",
      );
    } finally {
      setSendingReset(false);
    }
  }

  return {
    email,
    password,
    loggingIn,
    sendingReset,
    setEmail,
    setPassword,
    login,
    forgotPassword,
  };
}

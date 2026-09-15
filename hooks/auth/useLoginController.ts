"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  authenticateCastodiaUser,
  type LoginDestination,
  type LoginProduct,
} from "@/lib/auth/login";
import {
  cancelMfa,
  prepareMfa,
  verifyMfa,
  type MfaPreparation,
} from "@/lib/auth/mfa";
import { requestPasswordReset } from "@/lib/auth/password-reset";

type Options = { product?: LoginProduct };
type PendingMfa = { destination: LoginDestination; preparation: MfaPreparation };

export function useLoginController({ product = "auto" }: Options = {}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [pendingMfa, setPendingMfa] = useState<PendingMfa | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [verifyingMfa, setVerifyingMfa] = useState(false);

  async function login() {
    if (loggingIn) return;
    setLoggingIn(true);
    try {
      const result = await authenticateCastodiaUser(email, password, product);
      if (result.status === "mfa_required") {
        const preparation = await prepareMfa(result.enrollmentRequired);
        setPendingMfa({ destination: result.destination, preparation });
        setMfaCode("");
        return;
      }
      router.replace(result.destination);
      router.refresh();
    } catch (error) {
      console.error("Login failed:", error);
      alert(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function submitMfa() {
    if (!pendingMfa || verifyingMfa) return;
    setVerifyingMfa(true);
    try {
      await verifyMfa(pendingMfa.preparation, mfaCode);
      const destination = pendingMfa.destination;
      setPendingMfa(null);
      setMfaCode("");
      router.replace(destination);
      router.refresh();
    } catch (error) {
      console.error("MFA verification failed:", error);
      alert(error instanceof Error ? error.message : "Unable to verify your authentication code.");
    } finally {
      setVerifyingMfa(false);
    }
  }

  async function cancelMfaAndSignOut() {
    if (verifyingMfa) return;
    try {
      await cancelMfa();
    } catch (error) {
      console.error("MFA sign-out failed:", error);
    } finally {
      setPendingMfa(null);
      setMfaCode("");
      setPassword("");
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
    sendingReset,
    pendingMfa,
    mfaCode,
    verifyingMfa,
    setEmail,
    setPassword,
    setMfaCode,
    login,
    submitMfa,
    cancelMfaAndSignOut,
    forgotPassword,
  };
}

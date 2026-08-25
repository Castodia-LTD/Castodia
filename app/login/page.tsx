"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { WebLoginPage } from "@/components/auth/WebLoginPage";
import { AppShell } from "@/components/layout/AppShell";
import { IOSLoginPage } from "@/components/native/ios/IOSLoginPage";

import { useNativePlatform } from "@/hooks/native/useNativePlatform";
import { authenticateCastodiaUser } from "@/lib/auth/login";
import { requestPasswordReset } from "@/lib/auth/password-reset";

export default function Home() {
  const router = useRouter();

  const {
    isIOS,
    platformLoaded,
  } = useNativePlatform();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loggingIn, setLoggingIn] =
    useState(false);

  const [sendingReset, setSendingReset] =
    useState(false);

  async function handleLogin() {
    if (loggingIn) {
      return;
    }

    setLoggingIn(true);

    try {
      const destination =
        await authenticateCastodiaUser(
          email,
          password,
        );

      router.replace(destination);
      router.refresh();
    } catch (error) {
      console.error(
        "Login failed:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to sign in.",
      );
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleForgotPassword() {
    if (sendingReset) {
      return;
    }

    setSendingReset(true);

    try {
      await requestPasswordReset(
        email,
        `${window.location.origin}/reset-password`,
      );

      alert(
        "A password reset email has been sent. Please check your inbox.",
      );
    } catch (error) {
      console.error(
        "Password reset failed:",
        error,
      );

      alert(
        error instanceof Error
          ? error.message
          : "Unable to send the password reset email.",
      );
    } finally {
      setSendingReset(false);
    }
  }

  if (!platformLoaded) {
    return (
      <main className="min-h-dvh bg-[#063b40]" />
    );
  }

  if (isIOS) {
    return (
      <IOSLoginPage
        email={email}
        password={password}
        loggingIn={loggingIn}
        sendingReset={sendingReset}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
        onForgotPassword={
          handleForgotPassword
        }
      />
    );
  }

  return (
    <AppShell>
      <WebLoginPage
        email={email}
        password={password}
        loggingIn={loggingIn}
        sendingReset={sendingReset}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onLogin={handleLogin}
        onForgotPassword={
          handleForgotPassword
        }
      />
    </AppShell>
  );
}
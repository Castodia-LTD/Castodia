"use client";

import { WebLoginPage } from "@/components/auth/WebLoginPage";
import { AppShell } from "@/components/layout/AppShell";
import { IOSLoginPage } from "@/components/native/ios/IOSLoginPage";
import { useLoginController } from "@/hooks/auth/useLoginController";
import { useNativePlatform } from "@/hooks/native/useNativePlatform";

export default function LoginPage() {
  const { isIOS, nativePlatformLoaded } = useNativePlatform();
  const login = useLoginController({ product: isIOS ? "care" : "auto" });

  if (!nativePlatformLoaded) {
    return <main className="min-h-dvh bg-[#063b40]" />;
  }

  const props = {
    email: login.email,
    password: login.password,
    loggingIn: login.loggingIn,
    sendingReset: login.sendingReset,
    onEmailChange: login.setEmail,
    onPasswordChange: login.setPassword,
    onLogin: login.login,
    onForgotPassword: login.forgotPassword,
  };

  if (isIOS) return <IOSLoginPage {...props} />;

  return (
    <AppShell>
      <WebLoginPage {...props} />
    </AppShell>
  );
}

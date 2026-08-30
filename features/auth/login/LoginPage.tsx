"use client";

import { WebLoginPage } from "@/components/auth/WebLoginPage";
import { AppShell } from "@/components/layout/AppShell";
import { IOSLoginPage } from "@/components/native/ios/IOSLoginPage";

import { useLoginController } from "@/hooks/auth/useLoginController";
import { useNativePlatform } from "@/hooks/native/useNativePlatform";
import { useNativeProduct } from "@/hooks/native/useNativeProduct";

export default function LoginPage() {
  const {
    isIOS,
    nativePlatformLoaded,
  } = useNativePlatform();

  const {
    product: nativeProduct,
    nativeProductLoaded,
  } = useNativeProduct();

  const login =
    useLoginController({
      product:
        isIOS && nativeProduct
          ? nativeProduct
          : "auto",
    });

  if (
    !nativePlatformLoaded ||
    (
      isIOS &&
      !nativeProductLoaded
    )
  ) {
    return (
      <main className="min-h-dvh bg-[#063b40]" />
    );
  }

  const props = {
    email: login.email,
    password: login.password,

    loggingIn:
      login.loggingIn,

    sendingReset:
      login.sendingReset,

    onEmailChange:
      login.setEmail,

    onPasswordChange:
      login.setPassword,

    onLogin:
      login.login,

    onForgotPassword:
      login.forgotPassword,
  };

  if (isIOS) {
    if (!nativeProduct) {
      return (
        <main className="flex min-h-dvh items-center justify-center bg-[#063b40] px-6 text-center text-white">
          <div>
            <h1 className="text-xl font-bold">
              Unsupported Castodia app
            </h1>

            <p className="mt-2 text-sm text-white/70">
              This native build could not be identified.
            </p>
          </div>
        </main>
      );
    }

    return (
      <IOSLoginPage
        {...props}
        product={
          nativeProduct
        }
      />
    );
  }

  return (
    <AppShell>
      <WebLoginPage
        {...props}
      />
    </AppShell>
  );
}
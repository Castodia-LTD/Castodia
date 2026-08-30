"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";

type NativePlatform =
  | "ios"
  | "android"
  | "web";

function getDevelopmentPreview():
  | NativePlatform
  | null {
  if (
    process.env.NODE_ENV !==
      "development" ||
    typeof window === "undefined"
  ) {
    return null;
  }

  const params =
    new URLSearchParams(
      window.location.search,
    );

  const preview =
    params.get("nativePlatform");

  if (
    preview === "ios" ||
    preview === "android"
  ) {
    window.sessionStorage.setItem(
      "castodia-native-platform-preview",
      preview,
    );

    return preview;
  }

  const stored =
    window.sessionStorage.getItem(
      "castodia-native-platform-preview",
    );

  if (
    stored === "ios" ||
    stored === "android"
  ) {
    return stored;
  }

  return null;
}

export function useNativePlatform() {
  const [
    platform,
    setPlatform,
  ] =
    useState<NativePlatform>("web");

  const [
    nativePlatformLoaded,
    setNativePlatformLoaded,
  ] =
    useState(false);

  useEffect(() => {
    const preview =
      getDevelopmentPreview();

    if (preview) {
      setPlatform(preview);
      setNativePlatformLoaded(true);
      return;
    }

    const detectedPlatform =
      Capacitor.isNativePlatform()
        ? Capacitor.getPlatform()
        : "web";

    setPlatform(
      detectedPlatform === "ios" ||
        detectedPlatform === "android"
        ? detectedPlatform
        : "web",
    );

    setNativePlatformLoaded(true);
  }, []);

  return {
    platform,
    nativePlatformLoaded,

    isNative:
      platform !== "web",

    isIOS:
      platform === "ios",

    isAndroid:
      platform === "android",
  };
}
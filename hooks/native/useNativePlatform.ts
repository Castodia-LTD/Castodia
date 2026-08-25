"use client";

import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";

type NativePlatform = "ios" | "android" | "web";

export function useNativePlatform() {
  const [platform, setPlatform] = useState<NativePlatform>("web");
  const [nativePlatformLoaded, setNativePlatformLoaded] = useState(false);

  useEffect(() => {
    const detectedPlatform = Capacitor.isNativePlatform()
      ? Capacitor.getPlatform()
      : "web";

    setPlatform(
      detectedPlatform === "ios" || detectedPlatform === "android"
        ? detectedPlatform
        : "web",
    );

    setNativePlatformLoaded(true);
  }, []);

  return {
    platform,
    nativePlatformLoaded,
    isNative: platform !== "web",
    isIOS: platform === "ios",
    isAndroid: platform === "android",
  };
}

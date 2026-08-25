"use client";

type NativePlatform = "ios" | "android" | "web";

export function useNativePlatform() {
  const platform: NativePlatform = "ios";

  return {
    platform,
    platformLoaded: true,
    isNative: true,
    isIOS: true,
    isAndroid: false,
  };
}
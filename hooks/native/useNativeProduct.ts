"use client";

import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { useEffect, useState } from "react";

export type NativeProduct =
  | "care"
  | "core"
  | "family";

const productByBundleId: Record<
  string,
  NativeProduct
> = {
  "uk.co.castodia.care": "care",
  "uk.co.castodia.core": "core",
  "uk.co.castodia.family": "family",
};

const PREVIEW_KEY =
  "castodia-native-product-preview";

function getPreviewProduct():
  | NativeProduct
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const params =
    new URLSearchParams(
      window.location.search,
    );

  const queryProduct =
    params.get("nativeProduct");

  if (
    queryProduct === "care" ||
    queryProduct === "core" ||
    queryProduct === "family"
  ) {
    window.sessionStorage.setItem(
      PREVIEW_KEY,
      queryProduct,
    );

    return queryProduct;
  }

  const stored =
    window.sessionStorage.getItem(
      PREVIEW_KEY,
    );

  return stored === "care" ||
    stored === "core" ||
    stored === "family"
    ? stored
    : null;
}

export function useNativeProduct() {
  const [
    product,
    setProduct,
  ] = useState<
    NativeProduct | null
  >(null);

  const [
    nativeProductLoaded,
    setNativeProductLoaded,
  ] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function detectProduct() {
      if (
        !Capacitor.isNativePlatform()
      ) {
        if (mounted) {
          setProduct(
            getPreviewProduct(),
          );

          setNativeProductLoaded(
            true,
          );
        }

        return;
      }

      try {
        const info =
          await App.getInfo();

        if (!mounted) {
          return;
        }

        setProduct(
          productByBundleId[
            info.id
          ] ?? null,
        );
      } catch (error) {
        console.error(
          "Unable to identify native Castodia product:",
          error,
        );

        if (mounted) {
          setProduct(null);
        }
      } finally {
        if (mounted) {
          setNativeProductLoaded(
            true,
          );
        }
      }
    }

    void detectProduct();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    product,
    nativeProductLoaded,

    isCareApp:
      product === "care",

    isCoreApp:
      product === "core",

    isFamilyApp:
      product === "family",
  };
}
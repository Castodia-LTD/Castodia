"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { loadFamilyHome } from "@/lib/family/loadFamilyHome";

import { FamilyHomeContent } from "./FamilyHomeContent";
import type { FamilyHomeData } from "./types";

export default function FamilyHomePage() {
  const [data, setData] = useState<FamilyHomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    void loadFamilyHome()
      .then((result) => {
        if (mounted) setData(result);
      })
      .catch((error: unknown) => {
        console.error("Unable to load CastodiaFamily home:", error);
        if (mounted) {
          setErrorMessage(error instanceof Error ? error.message : "CastodiaFamily could not be loaded.");
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center text-center">
        <div>
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#61745f]" />
          <p className="mt-4 text-sm font-medium text-[#69736a]">Loading your Family space...</p>
        </div>
      </div>
    );
  }

  if (errorMessage || !data) {
    return (
      <div className="rounded-[28px] border border-[#d8cabb] bg-[#fff8f2]/80 p-6 shadow-sm backdrop-blur-xl">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f0ded2] text-[#865f4a]">
          <AlertTriangle size={20} />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-[#4d433d]">Family home unavailable</h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#796c63]">
          {errorMessage || "Your Family home could not be loaded."}
        </p>
      </div>
    );
  }

  return <FamilyHomeContent data={data} />;
}

"use client";

import { useCallback, useEffect, useState } from "react";

import { listSafeguardingCases } from "@/lib/safeguarding/api";
import type { SafeguardingCase } from "@/lib/safeguarding/types";

export function useSafeguardingDashboard() {
  const [cases, setCases] = useState<SafeguardingCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setCases(await listSafeguardingCases());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load safeguarding cases.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { cases, loading, error, reload };
}

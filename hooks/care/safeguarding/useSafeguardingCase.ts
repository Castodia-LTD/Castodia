"use client";

import { useCallback, useEffect, useState } from "react";

import { getSafeguardingCaseBundle } from "@/lib/care/safeguarding/api";
import type { SafeguardingCaseBundle } from "@/lib/care/safeguarding/types";

export function useSafeguardingCase(caseId: string) {
  const [bundle, setBundle] = useState<SafeguardingCaseBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setError(null);
    try {
      setBundle(await getSafeguardingCaseBundle(caseId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load this safeguarding case.");
    } finally {
      setLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    setLoading(true);
    void reload();
  }, [reload]);

  const mutate = useCallback(
    async (operation: () => Promise<void>) => {
      setSaving(true);
      setError(null);
      try {
        await operation();
        await reload();
      } catch (mutationError) {
        const message = mutationError instanceof Error
          ? mutationError.message
          : "The safeguarding record could not be updated.";
        setError(message);
        throw mutationError;
      } finally {
        setSaving(false);
      }
    },
    [reload],
  );

  return { bundle, loading, saving, error, reload, mutate };
}

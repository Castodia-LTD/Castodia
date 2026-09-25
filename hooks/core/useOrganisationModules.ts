"use client";

import { useCallback, useEffect, useState } from "react";

import type { ModuleKey } from "@/lib/core/modules/availableModules";
import { supabase } from "@/lib/supabase";

type ModuleState = Partial<Record<ModuleKey, boolean>>;

async function fetchOrganisationModules(): Promise<ModuleState> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return {};
  }

  const response = await fetch("/api/modules", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to load feature availability.");
  }

  const payload = (await response.json()) as { modules?: ModuleState };
  return payload.modules ?? {};
}

export function useOrganisationModules(enabled = true) {
  const [modules, setModules] = useState<ModuleState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    void fetchOrganisationModules()
      .then((nextModules) => {
        if (!cancelled) setModules(nextModules);
      })
      .catch((error) => {
        console.error("Unable to load organisation modules:", error);
        if (!cancelled) setModules({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const reload = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    try {
      setModules(await fetchOrganisationModules());
    } catch (error) {
      console.error("Unable to reload organisation modules:", error);
      setModules({});
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  const isEnabled = useCallback(
    (moduleKey: ModuleKey) => modules[moduleKey] !== false,
    [modules],
  );

  return {
    modules,
    loading,
    isEnabled,
    reload,
  };
}

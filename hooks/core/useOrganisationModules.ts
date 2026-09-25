"use client";

import { useCallback, useEffect, useState } from "react";

import type { ModuleKey } from "@/lib/core/modules/availableModules";
import { supabase } from "@/lib/supabase";

type ModuleState = Partial<Record<ModuleKey, boolean>>;

export function useOrganisationModules(enabled = true) {
  const [modules, setModules] = useState<ModuleState>({});
  const [loading, setLoading] = useState(enabled);

  const loadModules = useCallback(async () => {
    if (!enabled) {
      setModules({});
      setLoading(false);
      return;
    }

    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      setModules({});
      setLoading(false);
      return;
    }

    try {
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
      setModules(payload.modules ?? {});
    } catch (error) {
      console.error("Unable to load organisation modules:", error);
      setModules({});
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void loadModules();
  }, [loadModules]);

  const isEnabled = useCallback(
    (moduleKey: ModuleKey) => modules[moduleKey] !== false,
    [modules],
  );

  return {
    modules,
    loading,
    isEnabled,
    reload: loadModules,
  };
}

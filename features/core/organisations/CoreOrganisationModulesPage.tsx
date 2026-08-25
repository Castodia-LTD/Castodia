"use client";

import { useEffect, useState } from "react";
import CoreOrganisationHubPage from "./CoreOrganisationHubPage";
import { supabase } from "@/lib/supabase";
import { availableModules, ModuleKey } from "@/lib/core/modules/availableModules";

type OrganisationModule = {
  id: string;
  organisation_id: string;
  module_key: ModuleKey;
  is_enabled: boolean;
};

export default function CoreOrganisationModulesPage({
  organisationId,
}: {
  organisationId: string;
}) {
  const [modules, setModules] = useState<OrganisationModule[]>([]);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  async function loadModules() {
    const { data, error } = await supabase
      .from("organisation_modules")
      .select("id, organisation_id, module_key, is_enabled")
      .eq("organisation_id", organisationId);

    if (error) {
      console.error("Module load error:", error);
      setModules([]);
      return;
    }

    setModules(data || []);
  }

  useEffect(() => {
    loadModules();
  }, [organisationId]);

  async function toggleModule(moduleKey: ModuleKey, enabled: boolean) {
    setSavingKey(moduleKey);

    const existing = modules.find((module) => module.module_key === moduleKey);

    if (!existing) {
      const { error } = await supabase.from("organisation_modules").insert({
        organisation_id: organisationId,
        module_key: moduleKey,
        is_enabled: enabled,
      });

      if (error) console.error("Module insert error:", error);
    } else {
      const { error } = await supabase
        .from("organisation_modules")
        .update({
          is_enabled: enabled,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) console.error("Module update error:", error);
    }

    await loadModules();
    setSavingKey(null);
  }

  function isEnabled(moduleKey: ModuleKey) {
    return modules.some(
      (module) => module.module_key === moduleKey && module.is_enabled
    );
  }

  return (
    <CoreOrganisationHubPage organisationId={organisationId}>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-950">Modules</h2>
        <p className="mt-2 text-slate-600">
          Turn Castodia modules on or off for this organisation.
        </p>

        <div className="mt-6 grid gap-4">
          {availableModules.map((module) => {
            const enabled = isEnabled(module.key);
            const saving = savingKey === module.key;

            return (
              <div
                key={module.key}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div>
                  <h3 className="font-bold text-slate-950">{module.label}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {module.description}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => toggleModule(module.key, !enabled)}
                  className={
                    enabled
                      ? "min-w-20 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
                      : "min-w-20 rounded-full bg-slate-300 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-60"
                  }
                >
                  {saving ? "Saving" : enabled ? "On" : "Off"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </CoreOrganisationHubPage>
  );
}
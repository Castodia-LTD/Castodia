"use client";

import { useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import {
  moduleGroups,
  type ModuleDefinition,
  type ModuleGroup,
  type ModuleKey,
} from "@/lib/core/modules/availableModules";

import CoreOrganisationHubPage from "./CoreOrganisationHubPage";

type OrganisationModule = ModuleDefinition & {
  isEnabled: boolean;
  isConfigured: boolean;
};

export default function CoreOrganisationModulesPage({
  organisationId,
}: {
  organisationId: string;
}) {
  const [modules, setModules] = useState<OrganisationModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<ModuleKey | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const groupedModules = useMemo(
    () =>
      moduleGroups
        .map((group) => ({
          group,
          modules: modules.filter((module) => module.group === group),
        }))
        .filter(({ modules: groupModules }) => groupModules.length > 0),
    [modules],
  );

  async function getAccessToken() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Your CastodiaCore session has expired.");
    }

    return session.access_token;
  }

  async function loadModules() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `/api/core/organisations/${organisationId}/modules`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
        },
      );

      const payload = (await response.json()) as {
        modules?: OrganisationModule[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to load modules.");
      }

      setModules(payload.modules ?? []);
    } catch (error) {
      setModules([]);
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to load modules.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadModules();
  }, [organisationId]);

  async function toggleModule(moduleKey: ModuleKey, enabled: boolean) {
    setSavingKey(moduleKey);
    setErrorMessage(null);

    setModules((current) =>
      current.map((module) =>
        module.key === moduleKey
          ? { ...module, isEnabled: enabled, isConfigured: true }
          : module,
      ),
    );

    try {
      const accessToken = await getAccessToken();
      const response = await fetch(
        `/api/core/organisations/${organisationId}/modules`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            moduleKey,
            isEnabled: enabled,
          }),
        },
      );

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error || "Unable to update module.");
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to update module.",
      );
      await loadModules();
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <CoreOrganisationHubPage organisationId={organisationId}>
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold text-slate-950">Features & modules</h2>
          <p className="mt-2 text-slate-600">
            Control which Castodia capabilities are available to this
            organisation. Switching a feature off removes it from navigation and
            blocks its feature pages for the organisation.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Existing features remain enabled unless you explicitly switch them
            off.
          </p>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700"
          >
            {errorMessage}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            Loading feature availability...
          </div>
        ) : (
          <div className="mt-7 space-y-8">
            {groupedModules.map(({ group, modules: groupModules }) => (
              <ModuleGroupSection
                key={group}
                group={group}
                modules={groupModules}
                savingKey={savingKey}
                onToggle={toggleModule}
              />
            ))}
          </div>
        )}
      </div>
    </CoreOrganisationHubPage>
  );
}

function ModuleGroupSection({
  group,
  modules,
  savingKey,
  onToggle,
}: {
  group: ModuleGroup;
  modules: OrganisationModule[];
  savingKey: ModuleKey | null;
  onToggle: (moduleKey: ModuleKey, enabled: boolean) => Promise<void>;
}) {
  return (
    <section aria-labelledby={`module-group-${group.replaceAll(" ", "-")}`}>
      <div className="mb-3">
        <h3
          id={`module-group-${group.replaceAll(" ", "-")}`}
          className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500"
        >
          {group}
        </h3>
      </div>

      <div className="grid gap-3">
        {modules.map((module) => {
          const saving = savingKey === module.key;

          return (
            <div
              key={module.key}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-950">{module.label}</h4>
                  {!module.isConfigured ? (
                    <span className="rounded-full bg-cyan-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-cyan-700">
                      Default on
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {module.description}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={module.isEnabled}
                aria-label={`${module.label}: ${module.isEnabled ? "enabled" : "disabled"}`}
                disabled={saving}
                onClick={() => void onToggle(module.key, !module.isEnabled)}
                className={
                  module.isEnabled
                    ? "inline-flex min-w-24 items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-600 disabled:cursor-wait disabled:opacity-60"
                    : "inline-flex min-w-24 items-center justify-center rounded-full bg-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-400 disabled:cursor-wait disabled:opacity-60"
                }
              >
                {saving ? "Saving..." : module.isEnabled ? "On" : "Off"}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

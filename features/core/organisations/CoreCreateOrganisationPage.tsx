"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CastodiaPageShell } from "@/components/castodia";
import { availableModules } from "@/lib/core/modules/availableModules";
import { availableTimelineCategories } from "@/lib/care/timelines/availableTimelineCategories";

export default function CoreCreateOrganisationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [usesHouses, setUsesHouses] = useState(true);
  const [saving, setSaving] = useState(false);

  async function createOrganisation() {
    if (!name.trim()) {
      alert("Please enter an organisation name.");
      return;
    }

    setSaving(true);

    const { data: organisation, error: organisationError } = await supabase
      .from("organisations")
      .insert({
        name: name.trim(),
        uses_houses: usesHouses,
        is_active: true,
        status: "active",
      })
      .select("id")
      .single();

    if (organisationError || !organisation) {
      alert(organisationError?.message || "Could not create organisation.");
      setSaving(false);
      return;
    }

    const organisationId = organisation.id;

    const moduleRows = availableModules.map((module) => ({
      organisation_id: organisationId,
      module_key: module.key,
      is_enabled: false,
    }));

    const categoryRows = availableTimelineCategories.map((category) => ({
      organisation_id: organisationId,
      category_key: category.key,
      is_enabled: true,
    }));

    const optionRows = availableTimelineCategories.flatMap((category) =>
      category.options.map((option) => ({
        organisation_id: organisationId,
        category_key: category.key,
        option_key: option.key,
        is_enabled: true,
      }))
    );

    const { error: moduleError } = await supabase
      .from("organisation_modules")
      .insert(moduleRows);

    const { error: categoryError } = await supabase
      .from("organisation_timeline_categories")
      .insert(categoryRows);

    const { error: optionError } = await supabase
      .from("organisation_timeline_options")
      .insert(optionRows);

    if (moduleError || categoryError || optionError) {
      alert(
        moduleError?.message ||
          categoryError?.message ||
          optionError?.message ||
          "Organisation created, but configuration setup failed."
      );
      setSaving(false);
      return;
    }

    router.push(`/core/organisations/${organisationId}`);
  }

  return (
    <CastodiaPageShell
      title="Create Organisation"
      description="Add a new customer organisation to Castodia."
      maxWidth="default"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
            <Building2 size={26} />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Organisation Details
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              You can configure modules, timeline options and users after this
              organisation is created.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="text-sm font-bold text-slate-700">
              Organisation name
            </label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nathan Care"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white p-4 text-slate-950 outline-none focus:border-cyan-400"
            />
          </div>

          <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="font-bold text-slate-950">Uses houses</p>
              <p className="mt-1 text-sm text-slate-600">
                Enable this if the organisation groups service users by houses.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUsesHouses((value) => !value)}
              className={
                usesHouses
                  ? "min-w-20 rounded-full bg-emerald-500 px-4 py-2 text-sm font-bold text-white"
                  : "min-w-20 rounded-full bg-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
              }
            >
              {usesHouses ? "Yes" : "No"}
            </button>
          </label>

          <button
            type="button"
            disabled={saving}
            onClick={createOrganisation}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 p-4 text-sm font-bold text-white shadow-sm disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Organisation"}
          </button>
        </div>
      </div>
    </CastodiaPageShell>
  );
}
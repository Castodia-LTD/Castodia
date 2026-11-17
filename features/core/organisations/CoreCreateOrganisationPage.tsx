"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, House, CarFront, Building } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CastodiaPageShell } from "@/components/castodia";
import { availableModules } from "@/lib/core/modules/availableModules";
import { availableTimelineCategories } from "@/lib/care/timelines/availableTimelineCategories";

export default function CoreCreateOrganisationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [serviceTypes, setServiceTypes] = useState<string[]>(["supported_living"]);
  const usesHouses = serviceTypes.some((type) => type !== "domiciliary");
  const [saving, setSaving] = useState(false);

  async function createOrganisation() {
    if (!name.trim()) {
      alert("Please enter an organisation name.");
      return;
    }

    if (serviceTypes.length === 0) {
      alert("Select at least one care service.");
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

    // Service configuration is the source of truth for the new multi-service model.
    // Legacy uses_houses is retained for existing house-based screens.
    const { error: serviceError } = await supabase
      .from("care_services")
      .insert(serviceTypes.map((type) => ({
        organisation_id: organisationId,
        name: type === "supported_living" ? "Supported Living" : type === "domiciliary" ? "Domiciliary Care" : "Residential Care",
        care_model: type,
      })));

    if (serviceError) {
      alert("Organisation created, but service setup failed: " + serviceError.message);
      setSaving(false);
      return;
    }

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

          <fieldset className="space-y-3">
            <legend className="text-sm font-bold text-slate-700">Which care services does this provider operate?</legend>
            <p className="text-sm text-slate-600">Select all that apply. Each service will have its own staff and manager workspace, while sharing Castodia's person-centred records.</p>
            {([
              { key: "supported_living", label: "Supported Living", description: "House-based support and existing Castodia workflows.", Icon: House },
              { key: "domiciliary", label: "Domiciliary Care", description: "Scheduled home visits, day planners and visit-based rotas.", Icon: CarFront },
              { key: "residential", label: "Residential Care", description: "Residential home shifts, residents and handovers.", Icon: Building },
            ] as const).map(({ key, label, description, Icon }) => {
              const selected = serviceTypes.includes(key);
              return (
                <label key={key} className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition-colors ${selected ? "border-cyan-500 bg-cyan-50" : "border-slate-200 bg-white"}`}>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => setServiceTypes((current) => selected ? current.filter((type) => type !== key) : [...current, key])}
                    className="h-5 w-5 accent-cyan-600"
                  />
                  <Icon size={24} className="shrink-0 text-cyan-700" />
                  <span>
                    <span className="block font-bold text-slate-950">{label}</span>
                    <span className="block text-sm text-slate-600">{description}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>

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
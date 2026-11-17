"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, House, Building2, CarFront, Plus, Search, Users } from "lucide-react";
import { CastodiaCard, CastodiaPageShell, castodiaTheme } from "@/components/castodia";
import { supabase } from "@/lib/supabase";

type CareModel = "supported_living" | "domiciliary" | "residential";
type Person = { id: string; full_name: string; house_name: string | null; care_model: CareModel; is_active: boolean };
const services = [
  { id: "supported_living" as const, label: "Supported Living", icon: House, description: "People supported in their own homes" },
  { id: "domiciliary" as const, label: "Domiciliary Care", icon: CarFront, description: "People receiving care visits at home" },
  { id: "residential" as const, label: "Residential Care", icon: Building2, description: "People living in residential settings" },
];

export default function ManagerPeopleLandingPage() {
  const router = useRouter();
  const [people, setPeople] = useState<Person[]>([]);
  const [service, setService] = useState<CareModel | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Please sign in to view people.");
        const { data: profile, error: profileError } = await supabase.from("profiles")
          .select("organisation_id").eq("id", user.id).single();
        if (profileError || !profile?.organisation_id) throw new Error("Your organisation could not be verified.");
        const { data, error: peopleError } = await supabase.from("service_users")
          .select("id, full_name, house_name, care_model, is_active")
          .eq("organisation_id", profile.organisation_id).eq("is_active", true)
          .order("full_name");
        if (peopleError) throw peopleError;
        if (active) setPeople((data ?? []) as Person[]);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load people.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => people.filter(person =>
    (service === "all" || person.care_model === service) &&
    (person.full_name.toLowerCase().includes(search.trim().toLowerCase()) ||
      (person.house_name ?? "").toLowerCase().includes(search.trim().toLowerCase()))
  ), [people, service, search]);
  const chosen = filtered.some(person => person.id === selectedId) ? selectedId : "";

  return (
    <CastodiaPageShell title="People" description="Choose a care service and a person to open their record, or manage people in your organisation." maxWidth="wide"
      actions={<Link href="/care/manager/admin/service-users" className={castodiaTheme.button.base + " " + castodiaTheme.button.sizes.md + " " + castodiaTheme.button.variants.primary}><Plus className="mr-2 h-4 w-4" />Add or manage people</Link>}>
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</div>}
      <div className="grid gap-4 md:grid-cols-3">
        {services.map(({ id, label, description, icon: Icon }) => (
          <button type="button" key={id} aria-pressed={service === id} onClick={() => { setService(current => current === id ? "all" : id); setSelectedId(""); }}
            className={"rounded-2xl border p-5 text-left shadow-sm transition hover:border-cyan-400 " + (service === id ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-100" : "border-slate-200 bg-white")}>
            <Icon className="h-7 w-7 text-cyan-700" aria-hidden="true" />
            <span className="mt-3 block text-lg font-bold text-slate-950">{label}</span>
            <span className="mt-1 block text-sm text-slate-600">{description}</span>
            <span className="mt-3 block text-sm font-semibold text-cyan-700">{loading ? "Loading…" : people.filter(person => person.care_model === id).length + " people"}</span>
          </button>
        ))}
      </div>
      <CastodiaCard>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="flex items-center gap-2 text-lg font-bold text-slate-950"><Users className="h-5 w-5 text-cyan-700" />Select a person</h2>
            <p className="mt-1 text-sm text-slate-500">{service === "all" ? "All care services" : services.find(item => item.id === service)?.label} · {filtered.length} people</p></div>
          {service !== "all" && <button type="button" onClick={() => { setService("all"); setSelectedId(""); }} className="text-sm font-semibold text-cyan-700 hover:underline">Show all services</button>}
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">Search by name or house
            <span className="relative mt-2 block"><Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" /><input value={search} onChange={event => { setSearch(event.target.value); setSelectedId(""); }} placeholder="Search people…" className={castodiaTheme.input.base + " pl-10"} /></span>
          </label>
          <label className="block text-sm font-semibold text-slate-700">Person
            <select value={chosen} onChange={event => setSelectedId(event.target.value)} disabled={loading || filtered.length === 0} className={"mt-2 " + castodiaTheme.select.base}>
              <option value="">Choose a person…</option>
              {filtered.map(person => <option key={person.id} value={person.id}>{person.full_name}{person.house_name ? " — " + person.house_name : ""}</option>)}
            </select>
          </label>
        </div>
        {loading ? <p className="mt-5 text-sm text-slate-500">Loading people…</p> : filtered.length === 0 ? <p className="mt-5 text-sm text-slate-500">No people match this selection. Try another service or search, or add a person.</p> : null}
        <button type="button" disabled={!chosen} onClick={() => router.push("/care/manager/service-users/" + chosen + "/growth")}
          className={castodiaTheme.button.base + " " + castodiaTheme.button.sizes.md + " " + castodiaTheme.button.variants.primary + " mt-5"}>
          Open Person Hub <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </CastodiaCard>
      <CastodiaCard>
        <h2 className="text-lg font-bold text-slate-950">Administration</h2>
        <p className="mt-2 text-sm text-slate-600">Add new people, update profiles, assign their care service, or deactivate records.</p>
        <Link href="/care/manager/admin/service-users" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:underline">Manage service users <ArrowRight className="h-4 w-4" /></Link>
      </CastodiaCard>
    </CastodiaPageShell>
  );
}

"use client";

import { useState } from "react";
import { CastodiaCard } from "@/components/castodia";

type TravelProfile = "driving-car" | "foot-walking" | "cycling-regular";
type Estimate = { durationSeconds: number; distanceMetres: number };
const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900";

export default function DomiciliaryTravelCalculator() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [profile, setProfile] = useState<TravelProfile>("driving-car");
  const [buffer, setBuffer] = useState(5);
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function coordinates(value: string): [number, number] | null {
    const parts = value.split(",").map((part) => Number(part.trim()));
    return parts.length === 2 && parts.every(Number.isFinite) && parts[0] >= -180 && parts[0] <= 180 && parts[1] >= -90 && parts[1] <= 90 ? [parts[0], parts[1]] : null;
  }

  async function calculate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEstimate(null);
    const origin = coordinates(from);
    const destination = coordinates(to);
    if (!origin || !destination) {
      setError("Enter both locations as longitude, latitude (for example -3.53, 50.53).");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/care/rota/travel-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from: origin, to: destination, profile }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to estimate journey.");
      setEstimate(result as Estimate);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to estimate journey.");
    } finally { setLoading(false); }
  }

  return (
    <CastodiaCard className="p-5">
      <h2 className="text-lg font-bold text-slate-900">Travel time estimator</h2>
      <p className="mt-1 text-sm text-slate-600">Estimate time between visits using OpenRouteService. This first version accepts coordinates; address lookup and automatic visit-to-visit calculation will follow.</p>
      <form onSubmit={calculate} className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">From (longitude, latitude)
          <input className={inputClass} value={from} onChange={(event) => setFrom(event.target.value)} placeholder="-3.53, 50.53" required />
        </label>
        <label className="text-sm font-semibold text-slate-700">To (longitude, latitude)
          <input className={inputClass} value={to} onChange={(event) => setTo(event.target.value)} placeholder="-3.51, 50.55" required />
        </label>
        <label className="text-sm font-semibold text-slate-700">Travel method
          <select className={inputClass} value={profile} onChange={(event) => setProfile(event.target.value as TravelProfile)}>
            <option value="driving-car">Driving</option><option value="foot-walking">Walking</option><option value="cycling-regular">Cycling</option>
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">Additional buffer (minutes)
          <input className={inputClass} type="number" min="0" max="120" value={buffer} onChange={(event) => setBuffer(Math.max(0, Math.min(120, Number(event.target.value) || 0)))} />
        </label>
        <button type="submit" disabled={loading} className="rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 md:col-span-2">{loading ? "Calculating…" : "Calculate journey"}</button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
      {estimate && <div role="status" className="mt-4 rounded-lg bg-cyan-50 p-4 text-sm text-slate-800">
        <strong>{Math.ceil(estimate.durationSeconds / 60)} minutes estimated travel</strong> · {(estimate.distanceMetres / 1000).toFixed(1)} km
        <p className="mt-1">Recommended scheduling allowance: <strong>{Math.ceil(estimate.durationSeconds / 60) + buffer} minutes</strong> including buffer.</p>
        <p className="mt-1 text-xs text-slate-600">Planning estimate only; not live traffic or a record of actual travel.</p>
      </div>}
    </CastodiaCard>
  );
}

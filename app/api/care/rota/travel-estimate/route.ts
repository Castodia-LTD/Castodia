import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Coordinates = [number, number];
const profiles = new Set(["driving-car", "foot-walking", "cycling-regular"]);
function validPoint(value: unknown): value is Coordinates {
  return Array.isArray(value) && value.length === 2 &&
    value.every((v) => typeof v === "number" && Number.isFinite(v)) &&
    value[0] >= -180 && value[0] <= 180 && value[1] >= -90 && value[1] <= 90;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: auth, error: authError } = await supabase.auth.getUser();
  if (authError || !auth.user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("organisation_id, role").eq("id", auth.user.id).single();
  if (profileError || !profile?.organisation_id || !["manager", "admin", "organisation_admin", "owner"].includes(String(profile.role).toLowerCase())) {
    return NextResponse.json({ error: "Manager access required." }, { status: 403 });
  }

  let body: { from?: unknown; to?: unknown; profile?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!validPoint(body.from) || !validPoint(body.to) || typeof body.profile !== "string" || !profiles.has(body.profile)) {
    return NextResponse.json({ error: "Supply valid longitude/latitude pairs and travel profile." }, { status: 400 });
  }
  const key = process.env.OPENROUTESERVICE_API_KEY;
  if (!key) return NextResponse.json({ error: "Routing is not configured. Add OPENROUTESERVICE_API_KEY to server environment." }, { status: 503 });

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let upstream: Response;
    try {
      upstream = await fetch(`https://api.openrouteservice.org/v2/directions/${body.profile}`, {
        method: "POST",
        headers: { Authorization: key, "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ coordinates: [body.from, body.to], instructions: false }),
        signal: controller.signal,
        cache: "no-store",
      });
    } finally { clearTimeout(timeout); }
    if (!upstream.ok) {
      return NextResponse.json({ error: upstream.status === 429 ? "Routing allowance exceeded. Try again later." : "Routing service unavailable.", providerStatus: upstream.status }, { status: upstream.status === 429 ? 429 : 502 });
    }
    const result = await upstream.json();
    const summary = result?.routes?.[0]?.summary;
    if (!Number.isFinite(summary?.duration) || !Number.isFinite(summary?.distance)) throw new Error("Missing route summary");
    return NextResponse.json({ durationSeconds: Math.ceil(summary.duration), distanceMetres: Math.ceil(summary.distance), source: "openrouteservice", estimated: true });
  } catch {
    return NextResponse.json({ error: "Unable to calculate this journey. Enter a manual travel allowance." }, { status: 502 });
  }
}

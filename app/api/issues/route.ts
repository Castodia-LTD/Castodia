import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const categories = ["technical", "bug", "access", "account", "feature_request", "billing", "security", "other"];
const urgencies = ["low", "medium", "high", "urgent"];

export async function POST(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !anonKey || !serviceRoleKey) return NextResponse.json({ error: "Server configuration is incomplete." }, { status: 500 });

    const auth = request.headers.get("authorization");
    const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: "You must be signed in." }, { status: 401 });

    const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: "Your session is invalid or expired." }, { status: 401 });

    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: profile, error: profileError } = await admin.from("profiles").select("id, role, organisation_id, is_active").eq("id", user.id).maybeSingle();
    if (profileError) throw new Error(profileError.message);
    if (!profile || profile.is_active === false || !["manager", "support"].includes(profile.role)) return NextResponse.json({ error: "You do not have permission to report an issue." }, { status: 403 });
    if (!profile.organisation_id) return NextResponse.json({ error: "Your profile is not connected to an organisation." }, { status: 400 });

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const affectedArea = typeof body.affectedArea === "string" ? body.affectedArea.trim() : null;
    if (!title || title.length > 160) return NextResponse.json({ error: "Enter a valid issue title." }, { status: 400 });
    if (!description) return NextResponse.json({ error: "Describe what happened." }, { status: 400 });
    if (!categories.includes(body.category)) return NextResponse.json({ error: "Invalid issue category." }, { status: 400 });
    if (!urgencies.includes(body.urgency)) return NextResponse.json({ error: "Invalid urgency." }, { status: 400 });

    const { data: ticket, error } = await admin.from("core_issues").insert({
      title,
      description,
      category: body.category,
      status: "submitted",
      priority: "medium",
      organisation_id: profile.organisation_id,
      reported_by: user.id,
      affected_area: affectedArea || null,
      reporter_urgency: body.urgency,
    }).select("id, ticket_number").single();

    if (error) throw new Error(error.message);
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The issue could not be submitted." }, { status: 500 });
  }
}

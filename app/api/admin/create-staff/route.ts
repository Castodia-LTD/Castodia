import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { fullName, email, password, role, creatorId } = await request.json();

  if (!fullName || !email || !password || !role || !creatorId) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: creatorProfile, error: creatorError } = await supabaseAdmin
    .from("profiles")
    .select("organisation_id")
    .eq("id", creatorId)
    .single();

  if (creatorError || !creatorProfile?.organisation_id) {
    return NextResponse.json(
      { error: "Creator organisation not found." },
      { status: 400 }
    );
  }

  const { data: userData, error: userError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (userError) {
    return NextResponse.json(
      { error: userError.message },
      { status: 400 }
    );
  }

  const user = userData.user;

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: user.id,
      full_name: fullName,
      role,
      organisation_id: creatorProfile.organisation_id,
    });

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { fullName, email, password, role } = await request.json();

  if (!fullName || !email || !password || !role) {
    return NextResponse.json(
      { error: "Missing required fields." },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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
    });

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const allowedRoles = [
  "manager",
  "support",
  "castodia_admin",
  "castodia_owner",
] as const;

type AllowedRole = (typeof allowedRoles)[number];

function normaliseRole(value: unknown): AllowedRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalised = value.trim().toLowerCase();

  if (
    normalised === "support worker" ||
    normalised === "support_worker" ||
    normalised === "staff"
  ) {
    return "support";
  }

  if (allowedRoles.includes(normalised as AllowedRole)) {
    return normalised as AllowedRole;
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const {
      fullName,
      email,
      password,
      role: submittedRole,
      creatorId,
    } = await request.json();

    const role = normaliseRole(submittedRole);

    if (!fullName || !email || !password || !role || !creatorId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields or an invalid role was supplied.",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { data: creatorProfile, error: creatorError } =
      await supabaseAdmin
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
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
      });

    if (userError || !userData.user) {
      return NextResponse.json(
        {
          error:
            userError?.message || "The staff account could not be created.",
        },
        { status: 400 }
      );
    }

    const user = userData.user;

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: user.id,
        full_name: fullName.trim(),
        role,
        organisation_id: creatorProfile.organisation_id,
      });

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(user.id);

      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the staff account.",
      },
      { status: 500 }
    );
  }
}
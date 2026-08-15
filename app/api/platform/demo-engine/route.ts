import { NextResponse } from "next/server";

import { runDemoEngine } from "@/lib/demo-engine/api";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_ROLES = [
  "castodia_owner",
  "castodia_admin",
];

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        {
          status: 401,
        },
      );
    }

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      throw new Error(
        profileError.message,
      );
    }

    if (
      !profile?.role ||
      !ALLOWED_ROLES.includes(
        profile.role,
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Only Castodia owners or administrators can run the Demo Engine.",
        },
        {
          status: 403,
        },
      );
    }

    const result =
      await runDemoEngine();

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "Demo Engine failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "The Demo Engine could not be run.",
      },
      {
        status: 500,
      },
    );
  }
}
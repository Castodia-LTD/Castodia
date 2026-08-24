import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const allowedStaffRoles = [
  "manager",
  "support",
] as const;

type AllowedStaffRole =
  (typeof allowedStaffRoles)[number];

function normaliseRole(
  value: unknown,
): AllowedStaffRole | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalised =
    value.trim().toLowerCase();

  if (
    normalised === "support worker" ||
    normalised === "support_worker" ||
    normalised === "staff"
  ) {
    return "support";
  }

  if (
    allowedStaffRoles.includes(
      normalised as AllowedStaffRole,
    )
  ) {
    return normalised as AllowedStaffRole;
  }

  return null;
}

export async function POST(
  request: Request,
) {
  try {
    const {
      fullName,
      email,
      password,
      role: submittedRole,
    } = await request.json();

    const role =
      normaliseRole(submittedRole);

    if (
  typeof fullName !== "string" ||
  !fullName.trim() ||
  typeof email !== "string" ||
  !email.trim() ||
  typeof password !== "string" ||
  password.length < 8 ||
  !role
) {
  return NextResponse.json(
    {
      error:
        "Missing required fields, invalid role, or password is too short.",
    },
    { status: 400 },
  );
}
    /*
     * ------------------------------------------------
     * 1. Read and verify the caller's access token
     * ------------------------------------------------
     */

    const authHeader =
      request.headers.get(
        "authorization",
      );

    if (
      !authHeader?.startsWith(
        "Bearer ",
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Authentication required.",
        },
        { status: 401 },
      );
    }

    const accessToken =
      authHeader.slice(7).trim();

    const supabaseAuth =
      createClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

    const {
      data: {
        user: authenticatedUser,
      },
      error: authError,
    } =
      await supabaseAuth.auth.getUser(
        accessToken,
      );

    if (
      authError ||
      !authenticatedUser
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid or expired session.",
        },
        { status: 401 },
      );
    }

    /*
     * ------------------------------------------------
     * 2. Create privileged server client
     * ------------------------------------------------
     */

    const supabaseAdmin =
      createClient(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL!,
        process.env
          .SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      );

    /*
     * ------------------------------------------------
     * 3. Look up the VERIFIED caller
     * ------------------------------------------------
     */

    const {
      data: creatorProfile,
      error: creatorError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        `
          id,
          organisation_id,
          role
        `,
      )
      .eq(
        "id",
        authenticatedUser.id,
      )
      .single();

    if (
      creatorError ||
      !creatorProfile
    ) {
      return NextResponse.json(
        {
          error:
            "Authenticated profile not found.",
        },
        { status: 403 },
      );
    }

    /*
     * ------------------------------------------------
     * 4. Only managers may create organisation staff
     * ------------------------------------------------
     */

    if (
      creatorProfile.role !==
      "manager"
    ) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to create staff accounts.",
        },
        { status: 403 },
      );
    }

    if (
      !creatorProfile.organisation_id
    ) {
      return NextResponse.json(
        {
          error:
            "Your account is not attached to an organisation.",
        },
        { status: 403 },
      );
    }

    /*
     * ------------------------------------------------
     * 5. Create Auth account
     * ------------------------------------------------
     */

    const {
      data: userData,
      error: userError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email: email
            .trim()
            .toLowerCase(),
          password,
          email_confirm: true,
        },
      );

    if (
      userError ||
      !userData.user
    ) {
      return NextResponse.json(
        {
          error:
            userError?.message ||
            "The staff account could not be created.",
        },
        { status: 400 },
      );
    }

    const newUser =
      userData.user;

    /*
     * ------------------------------------------------
     * 6. Create profile using organisation from
     *    VERIFIED manager profile
     * ------------------------------------------------
     */

    const {
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: newUser.id,
        full_name:
          fullName.trim(),
        role,
        organisation_id:
          creatorProfile.organisation_id,
      });

    /*
     * Roll back the Auth user if profile creation fails.
     */

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(
        newUser.id,
      );

      return NextResponse.json(
        {
          error:
            profileError.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      userId: newUser.id,
    });
  } catch (error) {
    console.error(
      "Create staff error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create the staff account.",
      },
      { status: 500 },
    );
  }
}
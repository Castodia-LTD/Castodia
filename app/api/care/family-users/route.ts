import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

const authClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
);

const adminClient = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);

type CreateFamilyUserBody = {
  serviceUserId: string;
  fullName: string;
  email: string;
  relationship: string;
};

export async function POST(
  request: NextRequest,
) {
  try {
    // -----------------------------------------
    // Verify authenticated user
    // -----------------------------------------

    const authorization =
      request.headers.get("authorization");

    if (
      !authorization?.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          error: "Not authenticated.",
        },
        {
          status: 401,
        },
      );
    }

    const token =
      authorization.slice(7);

    const {
      data: { user },
      error: authError,
    } =
      await authClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        {
          error: "Invalid session.",
        },
        {
          status: 401,
        },
      );
    }

    // -----------------------------------------
    // Load professional profile
    // NO .single() / .maybeSingle()
    // -----------------------------------------

    const {
      data: managerRows,
      error: managerError,
    } = await adminClient
      .from("profiles")
      .select(
        "id, role, organisation_id",
      )
      .eq("id", user.id)
      .limit(2);

    if (managerError) {
      throw managerError;
    }

    if (
      !managerRows ||
      managerRows.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Your Castodia profile could not be found.",
        },
        {
          status: 403,
        },
      );
    }

    if (managerRows.length > 1) {
      console.error(
        "Duplicate profile records detected:",
        managerRows,
      );

      return NextResponse.json(
        {
          error:
            "More than one professional profile exists for this account.",
        },
        {
          status: 500,
        },
      );
    }

    const manager = managerRows[0];

    if (manager.role !== "manager") {
      return NextResponse.json(
        {
          error:
            "Manager access required.",
        },
        {
          status: 403,
        },
      );
    }

    // -----------------------------------------
    // Validate request
    // -----------------------------------------

    const body =
      (await request.json()) as CreateFamilyUserBody;

    const serviceUserId =
      body.serviceUserId?.trim();

    const fullName =
      body.fullName?.trim();

    const email =
      body.email
        ?.trim()
        .toLowerCase();

    const relationship =
      body.relationship?.trim();

    if (
      !serviceUserId ||
      !fullName ||
      !email ||
      !relationship
    ) {
      return NextResponse.json(
        {
          error:
            "Name, email and relationship are required.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------------
    // Verify service user
    // NO .single() / .maybeSingle()
    // -----------------------------------------

    const {
      data: serviceUserRows,
      error: serviceUserError,
    } = await adminClient
      .from("service_users")
      .select(
        "id, organisation_id",
      )
      .eq("id", serviceUserId)
      .eq(
        "organisation_id",
        manager.organisation_id,
      )
      .limit(2);

    if (serviceUserError) {
      throw serviceUserError;
    }

    if (
      !serviceUserRows ||
      serviceUserRows.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Service user could not be found.",
        },
        {
          status: 404,
        },
      );
    }

    if (serviceUserRows.length > 1) {
      return NextResponse.json(
        {
          error:
            "Multiple matching service-user records were found.",
        },
        {
          status: 500,
        },
      );
    }

    const serviceUser =
      serviceUserRows[0];

    // -----------------------------------------
    // Check existing Family access
    // -----------------------------------------

    const {
      data: existingRows,
      error: existingError,
    } = await adminClient
      .from("family_users")
      .select(
        "id, auth_user_id, email",
      )
      .eq(
        "service_user_id",
        serviceUser.id,
      )
      .ilike("email", email)
      .limit(2);

    if (existingError) {
      throw existingError;
    }

    if (
      existingRows &&
      existingRows.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "This person already has Family access.",
        },
        {
          status: 409,
        },
      );
    }

    // -----------------------------------------
    // Site URL
    // -----------------------------------------

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is not configured.",
      );
    }

    // -----------------------------------------
    // Create invitation
    // -----------------------------------------

    const {
      data: invitation,
      error: invitationError,
    } =
      await adminClient.auth.admin.inviteUserByEmail(
        email,
        {
          redirectTo: `${siteUrl}/account/setup`,

          data: {
            full_name: fullName,
            account_type: "family",
          },
        },
      );

    if (
      invitationError ||
      !invitation.user
    ) {
      return NextResponse.json(
        {
          error:
            invitationError?.message ??
            "Unable to create Family account.",
        },
        {
          status: 400,
        },
      );
    }

    // -----------------------------------------
    // Create Family record
    // -----------------------------------------

    const {
      data: insertedRows,
      error: familyUserError,
    } = await adminClient
      .from("family_users")
      .insert({
        auth_user_id:
          invitation.user.id,

        service_user_id:
          serviceUser.id,

        organisation_id:
          manager.organisation_id,

        full_name:
          fullName,

        email,

        relationship,

        is_active:
          true,

        created_by_user_id:
          user.id,
      })
      .select();

    if (familyUserError) {
      await adminClient.auth.admin.deleteUser(
        invitation.user.id,
      );

      throw familyUserError;
    }

    if (
      !insertedRows ||
      insertedRows.length === 0
    ) {
      await adminClient.auth.admin.deleteUser(
        invitation.user.id,
      );

      throw new Error(
        "The Family account was created in authentication, but its Family record could not be saved.",
      );
    }

    if (insertedRows.length > 1) {
      console.error(
        "Unexpected multiple family_users inserts:",
        insertedRows,
      );

      throw new Error(
        "More than one Family record was unexpectedly created.",
      );
    }

    const familyUser =
      insertedRows[0];

    return NextResponse.json(
      {
        familyUser,

        message:
          `Family access created for ${fullName}.`,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Create Family user error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create Family access.",
      },
      {
        status: 500,
      },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type CreateUserBody = {
  firstName?: string;
  surname?: string;
  email?: string;
  password?: string;
  role?: string;
};

const allowedRoles = ["manager", "support"];

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id: organisationId } = await context.params;

    const body = (await request.json()) as CreateUserBody;

    const firstName = body.firstName?.trim();
    const surname = body.surname?.trim();

    const fullName = `${firstName ?? ""} ${surname ?? ""}`.trim();

    const email = body.email?.trim().toLowerCase();
    const temporaryPassword = body.password;
    const role = body.role || "manager";

    if (!organisationId) {
      return NextResponse.json(
        {
          error: "Organisation ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!firstName || !surname) {
  return NextResponse.json(
    { error: "First name and surname are required." },
    { status: 400 }
  );
}

    if (!email) {
      return NextResponse.json(
        {
          error: "Email address is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !temporaryPassword ||
      temporaryPassword.length < 8
    ) {
      return NextResponse.json(
        {
          error:
            "The temporary password must contain at least 8 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        {
          error: "Invalid user role.",
        },
        {
          status: 400,
        }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !serviceRoleKey
    ) {
      console.error(
        "Missing Supabase server environment variables."
      );

      return NextResponse.json(
        {
          error: "Server configuration is incomplete.",
        },
        {
          status: 500,
        }
      );
    }

    const authorizationHeader =
      request.headers.get("authorization");

    const accessToken = authorizationHeader?.startsWith(
      "Bearer "
    )
      ? authorizationHeader.slice(7)
      : null;

    if (!accessToken) {
      return NextResponse.json(
        {
          error: "You must be signed in.",
        },
        {
          status: 401,
        }
      );
    }

    const authenticatedSupabase = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data: { user: requestingUser },
      error: requestingUserError,
    } = await authenticatedSupabase.auth.getUser(accessToken);

    if (requestingUserError || !requestingUser) {
      console.error(
        "Requesting user authentication error:",
        requestingUserError
      );

      return NextResponse.json(
        {
          error: "Your CastodiaCore session is invalid or expired.",
        },
        {
          status: 401,
        }
      );
    }

    const adminSupabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const {
      data: requestingProfile,
      error: requestingProfileError,
    } = await adminSupabase
      .from("profiles")
      .select("id, role")
      .eq("id", requestingUser.id)
      .maybeSingle();

    if (requestingProfileError) {
      console.error(
        "Core profile lookup error:",
        requestingProfileError
      );

      return NextResponse.json(
        {
          error:
            "Your CastodiaCore permissions could not be checked.",
        },
        {
          status: 500,
        }
      );
    }

const isCoreAdmin =
      requestingProfile?.role === "castodia_admin" ||
      requestingProfile?.role === "castodia_owner";

    if (!isCoreAdmin) {
      return NextResponse.json(
        {
          error:
            "You do not have permission to create organisation users.",
        },
        {
          status: 403,
        }
      );
    }

    const {
      data: organisation,
      error: organisationError,
    } = await adminSupabase
      .from("organisations")
      .select("id, name")
      .eq("id", organisationId)
      .maybeSingle();

    if (organisationError) {
      console.error(
        "Organisation lookup error:",
        organisationError
      );

      return NextResponse.json(
        {
          error: organisationError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (!organisation) {
      return NextResponse.json(
        {
          error: "Organisation not found.",
        },
        {
          status: 404,
        }
      );
    }

    const {
      data: existingProfile,
      error: existingProfileError,
    } = await adminSupabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingProfileError) {
      console.error(
        "Existing profile lookup error:",
        existingProfileError
      );

      return NextResponse.json(
        {
          error:
            "The email address could not be checked.",
        },
        {
          status: 500,
        }
      );
    }

    if (existingProfile) {
      return NextResponse.json(
        {
          error:
            "A user with this email address already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const {
      data: authData,
      error: authError,
    } = await adminSupabase.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        organisation_id: organisationId,
        role,
      },
    });

    if (authError) {
      console.error(
        "Supabase Auth creation error:",
        authError
      );

      return NextResponse.json(
        {
          error: authError.message,
        },
        {
          status: 400,
        }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        {
          error:
            "Supabase did not return the created user.",
        },
        {
          status: 500,
        }
      );
    }

    const {
      error: profileError,
    } = await adminSupabase
      .from("profiles")
      .upsert(
        {
          id: authData.user.id,
          organisation_id: organisationId,
          full_name: fullName,
          email,
          role,
          is_active: true,
        },
        {
          onConflict: "id",
        }
      );

    if (profileError) {
      console.error(
        "Profile creation error:",
        profileError
      );

      const {
        error: deleteAuthUserError,
      } = await adminSupabase.auth.admin.deleteUser(
        authData.user.id
      );

      if (deleteAuthUserError) {
        console.error(
          "Auth user rollback error:",
          deleteAuthUserError
        );
      }

      return NextResponse.json(
        {
          error: profileError.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: authData.user.id,
          fullName,
          email,
          role,
          organisationId,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create organisation user route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The user could not be created.",
      },
      {
        status: 500,
      }
    );
  }
}
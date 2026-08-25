import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

type CastodiaRole = "castodia_owner" | "castodia_admin";

const allowedRoles: CastodiaRole[] = [
  "castodia_owner",
  "castodia_admin",
];

function getClients() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return {
    authClient: createClient(url, anonKey, {
      auth: { persistSession: false },
    }),
    adminClient: createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }),
  };
}

async function requireCoreUser(
  request: NextRequest,
  ownerOnly = false
) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      ),
    };
  }

  const token = authorization.slice("Bearer ".length);
  const { authClient, adminClient } = getClients();

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(token);

  if (authError || !user) {
    return {
      error: NextResponse.json(
        { error: "Invalid session." },
        { status: 401 }
      ),
    };
  }

  const { data: profile, error: profileError } =
    await adminClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

  if (
    profileError ||
    !profile ||
    !allowedRoles.includes(profile.role as CastodiaRole)
  ) {
    return {
      error: NextResponse.json(
        { error: "Core administrator access required." },
        { status: 403 }
      ),
    };
  }

  if (ownerOnly && profile.role !== "castodia_owner") {
    return {
      error: NextResponse.json(
        {
          error:
            "Only a Castodia Owner can manage administrator users.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    role: profile.role as CastodiaRole,
    adminClient,
  };
}

export async function GET(request: NextRequest) {
  try {
    const access = await requireCoreUser(request);

    if ("error" in access) {
      return access.error;
    }

    const { adminClient } = access;

    const { data: profiles, error: profilesError } =
  await adminClient
    .from("profiles")
    .select(
      "id, full_name, role, photo_url, created_at, is_active"
    )
    .in("role", allowedRoles)
    .eq("is_active", true)
    .order("full_name");

    if (profilesError) {
      throw new Error(profilesError.message);
    }

    const {
      data: { users: authUsers },
      error: authUsersError,
    } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });

    if (authUsersError) {
      throw new Error(authUsersError.message);
    }

    const authMap = new Map(
      authUsers.map((user) => [user.id, user])
    );

    const users = (profiles ?? []).map((profile) => {
      const authUser = authMap.get(profile.id);

      return {
        ...profile,
        email: authUser?.email ?? "",
        last_sign_in_at: authUser?.last_sign_in_at ?? null,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load administrator users.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const access = await requireCoreUser(request, true);

    if ("error" in access) {
      return access.error;
    }

    const { adminClient } = access;
    const body = await request.json();

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : "";
    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";
    const password =
      typeof body.password === "string" ? body.password : "";
    const role = body.role as CastodiaRole;

    if (!fullName || !email || password.length < 8) {
      return NextResponse.json(
        {
          error:
            "Name, email and a password of at least 8 characters are required.",
        },
        { status: 400 }
      );
    }

    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: "Invalid administrator role." },
        { status: 400 }
      );
    }

    const {
      data: created,
      error: createError,
    } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createError || !created.user) {
      throw new Error(
        createError?.message || "Unable to create Auth user."
      );
    }

    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
  id: created.user.id,
  full_name: fullName,
  email,
  role,
  organisation_id: null,
  is_active: true,
},
       { onConflict: "id" }
      );

    if (profileError) {
      await adminClient.auth.admin.deleteUser(created.user.id);
      throw new Error(profileError.message);
    }

    return NextResponse.json(
      {
        user: {
          id: created.user.id,
          full_name: fullName,
          email,
          role,
          photo_url: null,
          created_at: created.user.created_at,
          last_sign_in_at: null,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to create administrator.",
      },
      { status: 500 }
    );
  }
}

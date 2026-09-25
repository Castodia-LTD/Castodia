import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import {
  availableModules,
  getDefaultModuleState,
} from "@/lib/core/modules/availableModules";

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

export async function GET(request: NextRequest) {
  try {
    const authorization = request.headers.get("authorization");
    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
    }

    const token = authorization.slice("Bearer ".length);
    const { authClient, adminClient } = getClients();

    const {
      data: { user },
      error: authError,
    } = await authClient.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Invalid session." }, { status: 401 });
    }

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("organisation_id")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw new Error(profileError.message);

    let organisationId = profile?.organisation_id ?? null;

    if (!organisationId) {
      const { data: familyUser, error: familyError } = await adminClient
        .from("family_users")
        .select("organisation_id")
        .eq("auth_user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (familyError) throw new Error(familyError.message);
      organisationId = familyUser?.organisation_id ?? null;
    }

    if (!organisationId) {
      return NextResponse.json({
        organisationId: null,
        modules: Object.fromEntries(
          availableModules.map((module) => [
            module.key,
            getDefaultModuleState(module.key),
          ]),
        ),
      });
    }

    const { data, error } = await adminClient
      .from("organisation_modules")
      .select("module_key, is_enabled")
      .eq("organisation_id", organisationId);

    if (error) throw new Error(error.message);

    const overrides = new Map(
      (data ?? []).map((row) => [row.module_key, row.is_enabled]),
    );

    return NextResponse.json({
      organisationId,
      modules: Object.fromEntries(
        availableModules.map((module) => [
          module.key,
          overrides.has(module.key)
            ? Boolean(overrides.get(module.key))
            : getDefaultModuleState(module.key),
        ]),
      ),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load module state.",
      },
      { status: 500 },
    );
  }
}

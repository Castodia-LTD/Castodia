import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export type CastodiaCoreRole = "castodia_owner" | "castodia_admin";

const allowedRoles: CastodiaCoreRole[] = ["castodia_owner", "castodia_admin"];

function createSupabaseClients() {
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

export async function requireCoreUser(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return {
      error: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    };
  }

  const token = authorization.slice("Bearer ".length);
  const { authClient, adminClient } = createSupabaseClients();

  const {
    data: { user },
    error: authError,
  } = await authClient.auth.getUser(token);

  if (authError || !user) {
    return {
      error: NextResponse.json({ error: "Invalid session." }, { status: 401 }),
    };
  }

  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    profileError ||
    !profile ||
    !allowedRoles.includes(profile.role as CastodiaCoreRole)
  ) {
    return {
      error: NextResponse.json(
        { error: "Core administrator access required." },
        { status: 403 },
      ),
    };
  }

  return {
    user,
    role: profile.role as CastodiaCoreRole,
    adminClient,
  };
}

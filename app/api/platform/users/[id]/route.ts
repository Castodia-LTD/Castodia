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

async function requireOwner(request: NextRequest) {
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
    profile?.role !== "castodia_owner"
  ) {
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

  return { user, adminClient };
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const access = await requireOwner(request);

    if ("error" in access) {
      return access.error;
    }

    const { id } = await context.params;
    const { adminClient } = access;
    const body = await request.json();

    const { data: target, error: targetError } =
      await adminClient
        .from("profiles")
        .select("id, role")
        .eq("id", id)
        .single();

    if (
      targetError ||
      !target ||
      !allowedRoles.includes(target.role as CastodiaRole)
    ) {
      return NextResponse.json(
        { error: "Administrator user not found." },
        { status: 404 }
      );
    }

    const updates: Record<string, unknown> = {};

    if (typeof body.fullName === "string") {
      const fullName = body.fullName.trim();

      if (!fullName) {
        return NextResponse.json(
          { error: "Administrator name is required." },
          { status: 400 }
        );
      }

      updates.full_name = fullName;
    }

    if (body.role !== undefined) {
      const role = body.role as CastodiaRole;

      if (!allowedRoles.includes(role)) {
        return NextResponse.json(
          { error: "Invalid administrator role." },
          { status: 400 }
        );
      }

      if (
        target.role === "castodia_owner" &&
        role !== "castodia_owner"
      ) {
        const { count, error: countError } =
          await adminClient
            .from("profiles")
            .select("id", {
              count: "exact",
              head: true,
            })
            .eq("role", "castodia_owner");

        if (countError) {
          throw new Error(countError.message);
        }

        if ((count ?? 0) <= 1) {
          return NextResponse.json(
            {
              error:
                "The final Castodia Owner cannot be demoted.",
            },
            { status: 400 }
          );
        }
      }

      updates.role = role;
    }

    if (
      body.photoUrl === null ||
      typeof body.photoUrl === "string"
    ) {
      updates.photo_url = body.photoUrl;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No changes were supplied." },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } =
      await adminClient
        .from("profiles")
        .update(updates)
        .eq("id", id)
        .select(
          "id, full_name, role, photo_url, created_at"
        )
        .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    if (typeof updates.full_name === "string") {
      const { error: metadataError } =
        await adminClient.auth.admin.updateUserById(id, {
          user_metadata: {
            full_name: updates.full_name,
          },
        });

      if (metadataError) {
        throw new Error(metadataError.message);
      }
    }

    const {
      data: { user: authUser },
    } = await adminClient.auth.admin.getUserById(id);

    return NextResponse.json({
      user: {
        ...updated,
        email: authUser?.email ?? "",
        last_sign_in_at:
          authUser?.last_sign_in_at ?? null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update administrator.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const access = await requireOwner(request);

    if ("error" in access) {
      return access.error;
    }

    const { id } = await context.params;
    const { user: currentUser, adminClient } = access;

    if (id === currentUser.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account." },
        { status: 400 }
      );
    }

    const { data: target, error: targetError } =
      await adminClient
        .from("profiles")
        .select("id, role")
        .eq("id", id)
        .single();

    if (
      targetError ||
      !target ||
      !allowedRoles.includes(target.role as CastodiaRole)
    ) {
      return NextResponse.json(
        { error: "Administrator user not found." },
        { status: 404 }
      );
    }

    if (target.role === "castodia_owner") {
      const { count, error: countError } =
        await adminClient
          .from("profiles")
          .select("id", {
            count: "exact",
            head: true,
          })
          .eq("role", "castodia_owner");

      if (countError) {
        throw new Error(countError.message);
      }

      if ((count ?? 0) <= 1) {
        return NextResponse.json(
          {
            error:
              "The final Castodia Owner cannot be deleted.",
          },
          { status: 400 }
        );
      }
    }

    const { error: deleteError } =
      await adminClient.auth.admin.deleteUser(id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to delete administrator.",
      },
      { status: 500 }
    );
  }
}

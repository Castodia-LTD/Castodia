import { NextRequest, NextResponse } from "next/server";

import { requireCoreUser } from "@/lib/core/auth/requireCoreUser";
import {
  availableModules,
  getDefaultModuleState,
  isModuleKey,
} from "@/lib/core/modules/availableModules";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const access = await requireCoreUser(request);
    if ("error" in access) return access.error;

    const { id: organisationId } = await context.params;
    const { adminClient } = access;

    const { data: organisation, error: organisationError } = await adminClient
      .from("organisations")
      .select("id")
      .eq("id", organisationId)
      .maybeSingle();

    if (organisationError) throw new Error(organisationError.message);
    if (!organisation) {
      return NextResponse.json({ error: "Organisation not found." }, { status: 404 });
    }

    const { data, error } = await adminClient
      .from("organisation_modules")
      .select("module_key, is_enabled, updated_at")
      .eq("organisation_id", organisationId);

    if (error) throw new Error(error.message);

    const overrides = new Map(
      (data ?? []).map((row) => [row.module_key, row.is_enabled]),
    );

    return NextResponse.json({
      modules: availableModules.map((module) => ({
        ...module,
        isEnabled: overrides.has(module.key)
          ? Boolean(overrides.get(module.key))
          : getDefaultModuleState(module.key),
        isConfigured: overrides.has(module.key),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to load organisation modules.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const access = await requireCoreUser(request);
    if ("error" in access) return access.error;

    const { id: organisationId } = await context.params;
    const body = (await request.json()) as {
      moduleKey?: unknown;
      isEnabled?: unknown;
    };

    if (!isModuleKey(body.moduleKey) || typeof body.isEnabled !== "boolean") {
      return NextResponse.json(
        { error: "A valid module key and enabled state are required." },
        { status: 400 },
      );
    }

    const { adminClient } = access;

    const { data: organisation, error: organisationError } = await adminClient
      .from("organisations")
      .select("id")
      .eq("id", organisationId)
      .maybeSingle();

    if (organisationError) throw new Error(organisationError.message);
    if (!organisation) {
      return NextResponse.json({ error: "Organisation not found." }, { status: 404 });
    }

    const { error } = await adminClient
      .from("organisation_modules")
      .upsert(
        {
          organisation_id: organisationId,
          module_key: body.moduleKey,
          is_enabled: body.isEnabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "organisation_id,module_key" },
      );

    if (error) throw new Error(error.message);

    return NextResponse.json({
      moduleKey: body.moduleKey,
      isEnabled: body.isEnabled,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update organisation module.",
      },
      { status: 500 },
    );
  }
}

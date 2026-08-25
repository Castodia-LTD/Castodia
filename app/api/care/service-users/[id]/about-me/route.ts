import { NextResponse } from "next/server";

import { saveAboutMe } from "@/lib/care/service-user-hub/about-me/saveAboutMe";
import type { AboutMeFormValues } from "@/lib/care/service-user-hub/about-me/types";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PUT(
  request: Request,
  context: RouteContext
) {
  try {
    const { id: serviceUserId } = await context.params;

    if (!serviceUserId) {
      return NextResponse.json(
        {
          error: "Service user ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const values = (await request.json()) as AboutMeFormValues;

    const savedRecord = await saveAboutMe(
      serviceUserId,
      values
    );

    return NextResponse.json({
      data: savedRecord,
    });
  } catch (error) {
    console.error("Failed to save About Me record:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to save About Me information.",
      },
      {
        status: 500,
      }
    );
  }
}
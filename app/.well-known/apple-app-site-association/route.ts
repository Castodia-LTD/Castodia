import { NextResponse } from "next/server";

const APPLE_TEAM_ID_PATTERN = /^[A-Z0-9]{10}$/;

export const dynamic = "force-dynamic";

export function GET() {
  const teamId =
    process.env.APPLE_DEVELOPER_TEAM_ID?.trim().toUpperCase();

  if (!teamId || !APPLE_TEAM_ID_PATTERN.test(teamId)) {
    return NextResponse.json(
      {
        error:
          "APPLE_DEVELOPER_TEAM_ID must be configured with the 10-character Apple Developer Team ID.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }

  return NextResponse.json(
    {
      webcredentials: {
        apps: [
          `${teamId}.uk.co.castodia.care`,
          `${teamId}.uk.co.castodia.family`,
        ],
      },
    },
    {
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}

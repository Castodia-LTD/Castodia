import { NextResponse } from "next/server";

const APPLE_DEVELOPER_TEAM_ID = "4C4AT5B42L";

export function GET() {
  return NextResponse.json(
    {
      webcredentials: {
        apps: [
          `${APPLE_DEVELOPER_TEAM_ID}.uk.co.castodia.care`,
          `${APPLE_DEVELOPER_TEAM_ID}.uk.co.castodia.family`,
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

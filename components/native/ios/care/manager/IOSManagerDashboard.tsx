"use client";

import { IOSDashboardHome } from "../../dashboard/IOSDashboardHome";
import { managerDashboardTiles } from "./managerDashboardTiles";

type Props = { name: string };

export function IOSManagerDashboard({ name }: Props) {
  return (
    <IOSDashboardHome
      name={name}
      portalLabel="Manager"
      prompt="What would you like to manage?"
      tiles={managerDashboardTiles}
    />
  );
}

"use client";

import { supportDashboardTiles } from "@/components/care/support/dashboard/supportDashboardTiles";
import { IOSDashboardHome } from "../../dashboard/IOSDashboardHome";

type Props = { name: string };

export function IOSSupportDashboard({ name }: Props) {
  return (
    <IOSDashboardHome
      name={name}
      portalLabel="Support"
      prompt="What do you need to do?"
      tiles={supportDashboardTiles}
    />
  );
}

import type { ReactNode } from "react";

import { AppShell } from "@/components/layout";
import { managerNavigation } from "@/config/navigation/managerNavigation";

export default function ManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell
      links={managerNavigation}
      portal="manager"
    >
      {children}
    </AppShell>
  );
}
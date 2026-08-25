import type { ReactNode } from "react";

import { AppShell } from "@/components/layout";
import { careManagerNavigation } from "@/config/navigation/careManagerNavigation";

export default function CareManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell
      links={careManagerNavigation}
      portal="care-manager"
    >
      {children}
    </AppShell>
  );
}
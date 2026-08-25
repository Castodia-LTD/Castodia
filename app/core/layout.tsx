import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { coreNavigation } from "@/config/navigation/coreNavigation";

type CoreLayoutProps = {
  children: ReactNode;
};

export default function CoreLayout({
  children,
}: CoreLayoutProps) {
  return (
    <AppShell
      portal="core"
      links={coreNavigation}
    >
      {children}
    </AppShell>
  );
}
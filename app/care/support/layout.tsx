import type { ReactNode } from "react";

import { AppShell } from "@/components/layout";
import { careSupportNavigation } from "@/config/navigation/careSupportNavigation";

export default function CareSupportLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell
      links={careSupportNavigation}
      portal="care-support"
    >
      {children}
    </AppShell>
  );
}
import type { ReactNode } from "react";

import { AppShell } from "@/components/layout";
import { supportNavigation } from "@/config/navigation/supportNavigation";

export default function SupportLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AppShell
      links={supportNavigation}
      portal="support"
    >
      {children}
    </AppShell>
  );
}
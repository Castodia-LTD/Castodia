import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { platformNavigation } from "@/config/navigation/platformNavigation";

type PlatformLayoutProps = {
  children: ReactNode;
};

export default function PlatformLayout({
  children,
}: PlatformLayoutProps) {
  return (
    <AppShell
      portal="platform"
      links={platformNavigation}
    >
      {children}
    </AppShell>
  );
}
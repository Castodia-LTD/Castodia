"use client";

import { IOSSupportDashboard } from "@/components/native/ios/care/support/IOSSupportDashboard";
import SupportDashboardWeb from "@/components/care/support/dashboard/SupportDashboardWeb";
import { useNativePlatform } from "@/hooks/native/useNativePlatform";
import { useCurrentProfile } from "@/hooks/shared/useCurrentProfile";

export default function SupportDashboardPage() {
  const { isIOS, nativePlatformLoaded } = useNativePlatform();
  const { name, photoUrl, role } = useCurrentProfile();

  if (!nativePlatformLoaded) return null;
  if (isIOS) return <IOSSupportDashboard name={name} />;

  return <SupportDashboardWeb name={name} photoUrl={photoUrl} role={role} />;
}

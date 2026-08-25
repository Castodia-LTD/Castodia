"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { getCurrentFamilyUser } from "@/lib/family/getCurrentFamilyUser";
import { supabase } from "@/lib/supabase";

export function useFamilyShellController() {
  const pathname = usePathname();
  const router = useRouter();
  const [familyUser, setFamilyUser] = useState<Awaited<ReturnType<typeof getCurrentFamilyUser>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    void getCurrentFamilyUser()
      .then((result) => {
        if (mounted) setFamilyUser(result);
      })
      .catch((error) => {
        console.error("Unable to load CastodiaFamily access:", error);
        if (mounted) router.replace("/");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [router]);

  async function logout() {
    if (loggingOut) return;
    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Unable to sign out:", error);
      setLoggingOut(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  const serviceUser = familyUser?.service_user ?? null;
  const serviceUserName =
    serviceUser?.first_name?.trim() || serviceUser?.full_name?.trim() || "Your loved one";
  const familyMemberName = familyUser?.full_name?.trim() || "Family";

  return {
    pathname,
    familyUser,
    serviceUserName,
    familyMemberName,
    loading,
    loggingOut,
    mobileMenuOpen,
    openMobileMenu: () => setMobileMenuOpen(true),
    closeMobileMenu: () => setMobileMenuOpen(false),
    logout,
  };
}

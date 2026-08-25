"use client";

import { useEffect, useState } from "react";

import { IOSSupportDashboard } from "@/components/native/ios/support/IOSSupportDashboard";
import SupportDashboardWeb from "@/components/support/dashboard/SupportDashboardWeb";
import { useNativePlatform } from "@/hooks/native/useNativePlatform";
import { supabase } from "@/lib/supabase";

export default function SupportDashboardPage() {
  const { isIOS, platformLoaded } =
    useNativePlatform();

  const [name, setName] =
    useState("");

  const [photoUrl, setPhotoUrl] =
    useState<string | null>(null);

  const [role, setRole] =
    useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!mounted) {
        return;
      }

      if (userError) {
        console.error(
          "Unable to load authenticated user:",
          userError.message,
        );

        return;
      }

      if (!user) {
        return;
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(`
          full_name,
          photo_url,
          role
        `)
        .eq("id", user.id)
        .single();

      if (!mounted) {
        return;
      }

      if (profileError) {
        console.error(
          "Unable to load support dashboard profile:",
          profileError.message,
        );

        return;
      }

      setName(
        profile?.full_name ?? "",
      );

      setPhotoUrl(
        profile?.photo_url ?? null,
      );

      setRole(
        profile?.role ?? null,
      );
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  if (!platformLoaded) {
    return null;
  }

  if (isIOS) {
    return (
      <IOSSupportDashboard
        name={name}
      />
    );
  }

  return (
    <SupportDashboardWeb
      name={name}
      photoUrl={photoUrl}
      role={role}
    />
  );
}
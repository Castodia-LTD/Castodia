"use client";

import { useEffect, useState } from "react";

import { IOSManagerDashboard } from "@/components/native/ios/manager/IOSManagerDashboard";
import { ContentWidth } from "@/components/layout";
import { useNativePlatform } from "@/hooks/native/useNativePlatform";
import { supabase } from "@/lib/supabase";

export default function ManagerDashboardPage() {
  const {
    isIOS,
    platformLoaded,
  } = useNativePlatform();

  const [name, setName] =
    useState("");

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
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (!mounted) {
        return;
      }

      if (profileError) {
        console.error(
          "Unable to load manager dashboard profile:",
          profileError.message,
        );

        return;
      }

      setName(
        profile?.full_name ?? "",
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
      <IOSManagerDashboard
        name={name}
      />
    );
  }

  return (
    <ContentWidth>
      <div className="py-6">
        <section className="overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-teal-50 px-7 py-9 shadow-sm sm:px-9">
          <p className="text-sm font-semibold text-cyan-700">
            Manager Portal
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
            {name
              ? `Welcome, ${name}`
              : "Welcome"}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Use the navigation menu to access Insights and
            your management tools.
          </p>
        </section>
      </div>
    </ContentWidth>
  );
}
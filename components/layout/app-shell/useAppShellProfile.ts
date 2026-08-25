"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase } from "@/lib/supabase";

import type {
  AppShellProfile,
} from "./appShellTypes";

const EMPTY_PROFILE: AppShellProfile = {
  name: "",
  role: null,
  photoUrl: null,
};

export function useAppShellProfile(
  enabled: boolean,
) {
  const [
    profile,
    setProfile,
  ] = useState<AppShellProfile>(
    EMPTY_PROFILE,
  );

  useEffect(() => {
    if (!enabled) {
      setProfile(EMPTY_PROFILE);
      return;
    }

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
        setProfile(EMPTY_PROFILE);
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("profiles")
        .select(
          "full_name, role, photo_url",
        )
        .eq("id", user.id)
        .single();

      if (!mounted) {
        return;
      }

      if (error) {
        console.error(
          "Unable to load profile:",
          error.message,
        );
        return;
      }

      setProfile({
        name:
          data?.full_name ?? "",
        role:
          data?.role ?? null,
        photoUrl:
          data?.photo_url ?? null,
      });
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, [enabled]);

  return profile;
}
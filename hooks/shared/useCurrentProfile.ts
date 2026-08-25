"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type CurrentProfile = {
  name: string;
  photoUrl: string | null;
  role: string | null;
  loaded: boolean;
};

const initialProfile: CurrentProfile = {
  name: "",
  photoUrl: null,
  role: null,
  loaded: false,
};

export function useCurrentProfile() {
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (!mounted) return;

      if (authError || !authData.user) {
        if (authError) console.error("Unable to load authenticated user:", authError.message);
        setProfile((current) => ({ ...current, loaded: true }));
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, photo_url, role")
        .eq("id", authData.user.id)
        .single();

      if (!mounted) return;

      if (error) {
        console.error("Unable to load current profile:", error.message);
        setProfile((current) => ({ ...current, loaded: true }));
        return;
      }

      setProfile({
        name: data?.full_name ?? "",
        photoUrl: data?.photo_url ?? null,
        role: data?.role ?? null,
        loaded: true,
      });
    }

    void loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  return profile;
}

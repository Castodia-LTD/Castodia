"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  full_name: string;
  house_name: string | null;
};

export function useTimelineServiceUser(serviceUserId: string) {
  const [serviceUser, setServiceUser] = useState<ServiceUser | null>(null);
  const [loadingServiceUser, setLoadingServiceUser] = useState(true);

  async function loadServiceUser() {
    setLoadingServiceUser(true);

    const { data, error } = await supabase
      .from("service_users")
      .select("id, full_name, house_name")
      .eq("id", serviceUserId)
      .single();

    if (error) {
      console.error(error);
      setServiceUser(null);
      setLoadingServiceUser(false);
      return;
    }

    setServiceUser(data);
    setLoadingServiceUser(false);
  }

  useEffect(() => {
    if (serviceUserId) {
      loadServiceUser();
    }
  }, [serviceUserId]);

  return {
    serviceUser,
    loadingServiceUser,
    reloadServiceUser: loadServiceUser,
  };
}
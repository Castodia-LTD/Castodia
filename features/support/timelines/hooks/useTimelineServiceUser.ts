"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ServiceUser = {
  id: string;
  organisation_id: string;
  full_name: string;
  first_name: string | null;
  surname: string | null;
  house_name: string | null;
  gender: string | null;
};

export function useTimelineServiceUser(serviceUserId: string) {
  const [serviceUser, setServiceUser] = useState<ServiceUser | null>(null);
  const [loadingServiceUser, setLoadingServiceUser] = useState(true);

  async function loadServiceUser() {
    if (!serviceUserId) {
      setServiceUser(null);
      setLoadingServiceUser(false);
      return;
    }

    setLoadingServiceUser(true);

    const { data, error } = await supabase
      .from("service_users")
      .select(
        "id, organisation_id, full_name, first_name, surname, house_name, gender"
      )
      .eq("id", serviceUserId)
      .single();

    if (error) {
      console.error(error);
      setServiceUser(null);
      setLoadingServiceUser(false);
      return;
    }

    setServiceUser(data as ServiceUser);
    setLoadingServiceUser(false);
  }

  useEffect(() => {
    loadServiceUser();
  }, [serviceUserId]);

  const serviceUserName =
    serviceUser?.full_name ||
    `${serviceUser?.first_name ?? ""} ${serviceUser?.surname ?? ""}`.trim();

  return {
    serviceUser,
    loadingServiceUser,
    reloadServiceUser: loadServiceUser,
    serviceUserName,
    houseName: serviceUser?.house_name ?? "",
    organisationId: serviceUser?.organisation_id ?? "",
  };
}
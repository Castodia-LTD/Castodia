"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const PHOTO_BUCKET = "service-user-photos";

type ServiceUser = {
  id: string;
  organisation_id: string;
  full_name: string;
  first_name: string | null;
  surname: string | null;
  house_name: string | null;
  gender: string | null;
  photo_path: string | null;
};

export function useTimelineServiceUser(
  serviceUserId: string,
) {
  const [serviceUser, setServiceUser] =
    useState<ServiceUser | null>(null);

  const [
    serviceUserPhotoUrl,
    setServiceUserPhotoUrl,
  ] = useState<string | null>(null);

  const [
    loadingServiceUser,
    setLoadingServiceUser,
  ] = useState(true);

  async function loadServiceUser() {
    if (!serviceUserId) {
      setServiceUser(null);
      setServiceUserPhotoUrl(null);
      setLoadingServiceUser(false);
      return;
    }

    setLoadingServiceUser(true);

    const { data, error } = await supabase
      .from("service_users")
      .select(`
        id,
        organisation_id,
        full_name,
        first_name,
        surname,
        house_name,
        gender,
        photo_path
      `)
      .eq("id", serviceUserId)
      .single();

    if (error) {
      console.error(
        "Timeline service user load error:",
        error,
      );

      setServiceUser(null);
      setServiceUserPhotoUrl(null);
      setLoadingServiceUser(false);
      return;
    }

    const loadedServiceUser =
      data as ServiceUser;

    setServiceUser(loadedServiceUser);

    if (loadedServiceUser.photo_path) {
      const {
        data: signedUrlData,
        error: photoError,
      } = await supabase.storage
        .from(PHOTO_BUCKET)
        .createSignedUrl(
          loadedServiceUser.photo_path,
          60 * 60,
        );

      if (photoError) {
        console.error(
          "Timeline service user photo error:",
          photoError,
        );

        setServiceUserPhotoUrl(null);
      } else {
        setServiceUserPhotoUrl(
          signedUrlData.signedUrl,
        );
      }
    } else {
      setServiceUserPhotoUrl(null);
    }

    setLoadingServiceUser(false);
  }

  useEffect(() => {
    void loadServiceUser();
  }, [serviceUserId]);

  const serviceUserName =
    serviceUser?.full_name ||
    `${serviceUser?.first_name ?? ""} ${
      serviceUser?.surname ?? ""
    }`.trim();

  return {
    serviceUser,
    serviceUserPhotoUrl,
    loadingServiceUser,

    reloadServiceUser: loadServiceUser,

    serviceUserName,

    houseName:
      serviceUser?.house_name ?? "",

    organisationId:
      serviceUser?.organisation_id ?? "",
  };
}
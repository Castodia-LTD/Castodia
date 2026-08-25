import { notFound } from "next/navigation";

import AboutMeView from "@/components/care/service-user-hub/about-me/AboutMeView";
import { getAboutMe } from "@/lib/care/service-user-hub/about-me/getAboutMe";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
  portal?: "manager" | "support";
  canEdit?: boolean;
};

export async function ServiceUserAboutMePage({
  params,
  portal,
  canEdit,
}: Props) {
  const { id: serviceUserId } = await params;
  const supabase = await createClient();

  const { data: serviceUser, error } = await supabase
    .from("service_users")
    .select(`
      id,
      full_name,
      first_name,
      surname,
      photo_url,
      house_name,
      date_of_birth
    `)
    .eq("id", serviceUserId)
    .maybeSingle();

  if (error) {
    throw new Error(`Unable to load service user: ${error.message}`);
  }

  if (!serviceUser) notFound();

  const fullName =
    serviceUser.full_name ||
    [serviceUser.first_name, serviceUser.surname].filter(Boolean).join(" ") ||
    "Unnamed service user";

  const aboutMe = await getAboutMe(serviceUserId);

  return (
    <AboutMeView
      serviceUserId={serviceUserId}
      serviceUser={{
        fullName,
        photoUrl: serviceUser.photo_url,
        houseName: serviceUser.house_name,
        dateOfBirth: serviceUser.date_of_birth,
      }}
      initialData={aboutMe}
      portal={portal}
      canEdit={canEdit}
    />
  );
}

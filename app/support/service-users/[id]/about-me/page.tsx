import { notFound } from "next/navigation";

import AboutMeView from "@/components/service-user-hub/about-me/AboutMeView";

import { createClient } from "@/lib/supabase/server";
import { getAboutMe } from "@/lib/service-user-hub/about-me/getAboutMe";

type AboutMePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function SupportAboutMePage({
  params,
}: AboutMePageProps) {
  const { id: serviceUserId } = await params;

  const supabase = await createClient();

  const { data: serviceUser, error: serviceUserError } =
    await supabase
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

  if (serviceUserError) {
    throw new Error(
      `Unable to load service user: ${serviceUserError.message}`
    );
  }

  if (!serviceUser) {
    notFound();
  }

  const fullName =
    serviceUser.full_name ||
    [serviceUser.first_name, serviceUser.surname]
      .filter(Boolean)
      .join(" ") ||
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
      portal="support"
      canEdit={false}
    />
  );
}
import { getCurrentProfile } from "./getCurrentProfile";

export async function requireOrganisationUser(token: string) {
  const profile = await getCurrentProfile(token);

  if (!profile) {
    throw new Error("Unauthenticated");
  }

  if (!profile.organisation_id) {
    throw new Error("No organisation");
  }

  return profile;
}
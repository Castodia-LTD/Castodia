import { getCurrentProfile } from "./getCurrentProfile";

export async function requirePlatformUser(token: string) {
  const profile = await getCurrentProfile(token);

  if (!profile) {
    throw new Error("Unauthenticated");
  }

  if (
    profile.role !== "castodia_owner" &&
    profile.role !== "platform_admin"
  ) {
    throw new Error("Forbidden");
  }

  return profile;
}
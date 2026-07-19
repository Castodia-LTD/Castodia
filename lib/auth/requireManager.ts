import { getCurrentProfile } from "./getCurrentProfile";

export async function requireManager(token: string) {
  const profile = await getCurrentProfile(token);

  if (!profile) {
    throw new Error("Unauthenticated");
  }

  if (profile.role !== "manager") {
    throw new Error("Forbidden");
  }

  return profile;
}
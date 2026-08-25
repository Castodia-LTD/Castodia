import { getCurrentFamilyUser } from "./getCurrentFamilyUser";
import { getFamilyMemories } from "./memories/api";

import type { FamilyHomeData } from "@/features/family/home/types";

export async function loadFamilyHome(): Promise<FamilyHomeData> {
  const familyUser = await getCurrentFamilyUser();
  const memories = await getFamilyMemories(familyUser.service_user_id);

  return { familyUser, memories };
}

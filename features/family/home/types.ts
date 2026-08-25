import type { CurrentFamilyUser } from "@/lib/family/getCurrentFamilyUser";
import type { FamilyMemory } from "@/lib/family/memories/api";

export type FamilyHomeData = {
  familyUser: CurrentFamilyUser;
  memories: FamilyMemory[];
};

export type FamilyMemoryMonth = {
  key: string;
  label: string;
  count: number;
  coverImageUrl: string | null;
};

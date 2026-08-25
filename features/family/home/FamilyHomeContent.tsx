import FamilyWelcome from "@/components/family/home/FamilyWelcome";
import MemoriesByMonth from "@/components/family/home/MemoriesByMonth";
import MemoryOfTheDay from "@/components/family/home/MemoryOfTheDay";
import RecentMemories from "@/components/family/home/RecentMemories";

import type { FamilyHomeData, FamilyMemoryMonth } from "./types";

function buildMonths(data: FamilyHomeData): FamilyMemoryMonth[] {
  const months = new Map<string, FamilyMemoryMonth>();

  for (const memory of data.memories) {
    const date = new Date(memory.memory_date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
    }).format(date);

    const existing = months.get(key);
    if (existing) {
      existing.count += 1;
      existing.coverImageUrl ||= memory.photos[0]?.signed_url ?? null;
      continue;
    }

    months.set(key, {
      key,
      label,
      count: 1,
      coverImageUrl: memory.photos[0]?.signed_url ?? null,
    });
  }

  return Array.from(months.values());
}

export function FamilyHomeContent({ data }: { data: FamilyHomeData }) {
  const { familyUser, memories } = data;
  const serviceUser = familyUser.service_user;
  const serviceUserName =
    serviceUser.first_name?.trim() || serviceUser.full_name?.trim() || "your relative";
  const featuredMemory = memories[0] ?? null;

  return (
    <div className="space-y-10">
      <FamilyWelcome
        familyMemberName={familyUser.full_name}
        serviceUserName={serviceUserName}
        relationship={familyUser.relationship}
      />

      <MemoryOfTheDay
        serviceUserName={serviceUserName}
        memory={featuredMemory ? {
          id: featuredMemory.id,
          title: featuredMemory.title,
          description: featuredMemory.story,
          memoryDate: featuredMemory.memory_date,
          location: null,
          imageUrl: featuredMemory.photos[0]?.signed_url ?? null,
        } : null}
      />

      <RecentMemories
        serviceUserName={serviceUserName}
        memories={memories.slice(0, 5).map((memory) => ({
          id: memory.id,
          title: memory.title,
          memoryDate: memory.memory_date,
          imageUrl: memory.photos[0]?.signed_url ?? null,
        }))}
      />

      <MemoriesByMonth
        serviceUserName={serviceUserName}
        months={buildMonths(data)}
      />
    </div>
  );
}

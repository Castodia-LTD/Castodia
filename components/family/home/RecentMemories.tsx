import {
  ChevronRight,
  ImageIcon,
} from "lucide-react";

import FamilyEmptyMemories from "./FamilyEmptyMemories";

export type FamilyRecentMemory = {
  id: string;
  title: string;
  memoryDate: string;
  imageUrl: string | null;
};

type RecentMemoriesProps = {
  serviceUserName: string;
  memories: FamilyRecentMemory[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

export default function RecentMemories({
  serviceUserName,
  memories,
}: RecentMemoriesProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8977]">
            Latest moments
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#405044]">
            Recent Memories
          </h2>
        </div>

        {memories.length > 0 ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#61745f] transition hover:text-[#455747]"
          >
            View all

            <ChevronRight
              size={16}
            />
          </button>
        ) : null}
      </div>

      {memories.length === 0 ? (
        <FamilyEmptyMemories
          serviceUserName={
            serviceUserName
          }
          compact
          title="No recent memories yet"
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {memories.map(
            (memory) => (
              <article
                key={memory.id}
                className="group relative aspect-[4/5] overflow-hidden rounded-[24px] border border-white/70 bg-[#e7e4da] shadow-[0_12px_35px_rgba(67,60,48,0.08)]"
              >
                {memory.imageUrl ? (
                  <img
                    src={
                      memory.imageUrl
                    }
                    alt=""
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#dfe6d9] to-[#dfcdb8] text-[#778576]">
                    <ImageIcon
                      size={28}
                    />
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4 pt-12 text-white">
                  <p className="text-xs text-white/80">
                    {formatDate(
                      memory.memoryDate,
                    )}
                  </p>

                  <h3 className="mt-1 line-clamp-2 text-sm font-semibold">
                    {memory.title}
                  </h3>
                </div>
              </article>
            ),
          )}
        </div>
      )}
    </section>
  );
}
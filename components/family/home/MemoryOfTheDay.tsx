import {
  CalendarDays,
  Heart,
  MapPin,
} from "lucide-react";

import FamilyEmptyMemories from "./FamilyEmptyMemories";

export type FamilyFeaturedMemory = {
  id: string;
  title: string;
  description: string | null;
  memoryDate: string;
  location: string | null;
  imageUrl: string | null;
};

type MemoryOfTheDayProps = {
  serviceUserName: string;
  memory: FamilyFeaturedMemory | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(new Date(value));
}

export default function MemoryOfTheDay({
  serviceUserName,
  memory,
}: MemoryOfTheDayProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8a927f]">
            Featured
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#405044]">
            Memory of the Day
          </h2>
        </div>
      </div>

      {!memory ? (
        <FamilyEmptyMemories
          serviceUserName={
            serviceUserName
          }
          title="No memories shared yet"
        />
      ) : (
        <article className="group relative min-h-[360px] overflow-hidden rounded-[32px] border border-white/75 bg-white/55 shadow-[0_22px_60px_rgba(72,64,50,0.09)] backdrop-blur-xl">
          {memory.imageUrl ? (
            <img
              src={memory.imageUrl}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#dfe5d7] via-[#eee8de] to-[#d8c4ad]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-[#f6f1e7]/95 via-[#f6f1e7]/80 to-transparent" />

          <div className="relative flex min-h-[360px] max-w-xl flex-col justify-center p-7 sm:p-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#cfd8c9] bg-white/60 px-3 py-1.5 text-xs font-semibold text-[#5b6d5d] backdrop-blur-md">
              Memory of the Day

              <Heart
                size={13}
                strokeWidth={1.8}
              />
            </div>

            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.035em] text-[#405044] sm:text-4xl">
              {memory.title}
            </h3>

            {memory.description ? (
              <p className="mt-4 max-w-md text-sm leading-6 text-[#6f6a61]">
                {memory.description}
              </p>
            ) : null}

            <div className="mt-6 space-y-2 text-sm text-[#6f7169]">
              <div className="flex items-center gap-2">
                <CalendarDays
                  size={15}
                />

                {formatDate(
                  memory.memoryDate,
                )}
              </div>

              {memory.location ? (
                <div className="flex items-center gap-2">
                  <MapPin
                    size={15}
                  />

                  {memory.location}
                </div>
              ) : null}
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
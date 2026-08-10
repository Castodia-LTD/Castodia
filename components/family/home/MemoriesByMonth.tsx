import {
  CalendarDays,
  ChevronRight,
  Images,
} from "lucide-react";

import FamilyEmptyMemories from "./FamilyEmptyMemories";

export type FamilyMemoryMonth = {
  key: string;
  label: string;
  count: number;
  coverImageUrl: string | null;
};

type MemoriesByMonthProps = {
  serviceUserName: string;
  months: FamilyMemoryMonth[];
};

export default function MemoriesByMonth({
  serviceUserName,
  months,
}: MemoriesByMonthProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a8977]">
            Looking back
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#405044]">
            By Month
          </h2>
        </div>

        {months.length > 0 ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-sm font-semibold text-[#61745f] transition hover:text-[#455747]"
          >
            View timeline

            <ChevronRight
              size={16}
            />
          </button>
        ) : null}
      </div>

      {months.length === 0 ? (
        <FamilyEmptyMemories
          serviceUserName={
            serviceUserName
          }
          compact
          title="Monthly collections will appear here"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {months.map((month) => (
            <article
              key={month.key}
              className="overflow-hidden rounded-[26px] border border-[#ddd8cd] bg-white/55 p-4 shadow-[0_12px_35px_rgba(71,64,51,0.06)] backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#4b5c4e]">
                    <CalendarDays
                      size={15}
                    />

                    {month.label}
                  </div>

                  <p className="mt-1 text-xs text-[#847b70]">
                    {month.count}{" "}
                    {month.count === 1
                      ? "memory"
                      : "memories"}
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#edf0e9] text-[#6b7d69]">
                  <Images size={16} />
                </div>
              </div>

              <div className="mt-4 aspect-[16/9] overflow-hidden rounded-[19px] bg-gradient-to-br from-[#dfe5d8] to-[#dfcbb5]">
                {month.coverImageUrl ? (
                  <img
                    src={
                      month.coverImageUrl
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
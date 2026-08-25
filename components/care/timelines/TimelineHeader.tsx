"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

type Props = {
  serviceUserName: string;
  serviceUserPhotoUrl?: string | null;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onFilterClick: () => void;
  entryCount?: number;
  latestEntryTime?: string | null;
};

export default function TimelineHeader({
  serviceUserName,
  serviceUserPhotoUrl,
  selectedDate,
  setSelectedDate,
  onFilterClick,
  entryCount = 0,
  latestEntryTime = null,
}: Props) {
  function changeDay(amount: number) {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + amount);
    setSelectedDate(next);
  }

  function goToday() {
    setSelectedDate(new Date());
  }

  const initials =
    serviceUserName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "SU";

  const formattedDate = selectedDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="relative overflow-hidden rounded-[26px] border border-teal-100/80 bg-gradient-to-br from-white via-[#fbffff] to-[#eefafa] px-5 py-5 shadow-[0_10px_30px_rgba(13,148,136,0.07)] sm:px-6 sm:py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-12 -top-14 h-40 w-40 rounded-full bg-cyan-100/55 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-16 right-10 h-40 w-40 rounded-full bg-teal-100/45 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[20px] border border-white bg-gradient-to-br from-teal-50 to-cyan-100 shadow-[0_8px_22px_rgba(13,148,136,0.12)] ring-1 ring-teal-100/80 sm:h-[72px] sm:w-[72px]">
            {serviceUserPhotoUrl ? (
              <img
                src={serviceUserPhotoUrl}
                alt={serviceUserName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-teal-700">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-600">
              Daily record
            </p>

            <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">
              {serviceUserName}
            </h1>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-500">
              <span>{formattedDate}</span>
              <span className="h-1 w-1 rounded-full bg-teal-200" />
              <span>
                {entryCount} {entryCount === 1 ? "entry" : "entries"}
              </span>

              {latestEntryTime && (
                <>
                  <span className="h-1 w-1 rounded-full bg-teal-200" />
                  <span>Latest {latestEntryTime}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-2xl border border-teal-100 bg-white/85 p-1 shadow-sm backdrop-blur">
            <button
              type="button"
              onClick={() => changeDay(-1)}
              aria-label="Previous day"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-teal-50 hover:text-teal-700"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={goToday}
              className="flex h-9 items-center gap-2 rounded-xl px-3 text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
            >
              <CalendarDays
                size={16}
                className="text-teal-600"
                aria-hidden="true"
              />
              Today
            </button>

            <button
              type="button"
              onClick={() => changeDay(1)}
              aria-label="Next day"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-teal-50 hover:text-teal-700"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={onFilterClick}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-teal-100 bg-white/85 px-4 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
          >
            <Filter size={16} aria-hidden="true" />
            Filter
          </button>
        </div>
      </div>
    </header>
  );
}
import Link from "next/link";

type Props = {
  serviceUserName: string;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  onFilterClick: () => void;
};

export default function TimelineHeader({
  serviceUserName,
  selectedDate,
  setSelectedDate,
  onFilterClick,
}: Props) {
  function goPreviousDay() {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  }

  function goNextDay() {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-r bg-gradient-to-r
from-slate-700
via-cyan-500
to-slate-700">
      <div className="relative">

  <button
    onClick={onFilterClick}
    className="absolute right-0 top-0 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/20"
  >
    Filter
  </button>

  <div className="text-center">
    <h1 className="text-4xl font-bold text-white">
      {serviceUserName}
    </h1>

  </div>
</div>

      <div className="mt-6 flex items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
        <button onClick={goPreviousDay} className="rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/20">
          ←
        </button>

        <p className="text-center text-sm font-semibold text-white md:text-base">
          {selectedDate.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <button onClick={goNextDay} className="rounded-xl bg-white/10 px-4 py-2 text-white hover:bg-white/20">
          →
        </button>
      </div>
    </section>
  );
}
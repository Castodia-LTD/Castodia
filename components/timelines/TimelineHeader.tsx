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
    <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur">
      <div className="grid grid-cols-3 items-center">
        <Link href="/dashboard" className="text-sm text-slate-400">
          ← Dashboard
        </Link>

        <h1 className="text-center text-lg font-semibold text-white">
          {serviceUserName}
        </h1>

        <button
          onClick={onFilterClick}
          className="justify-self-end rounded-xl bg-white/10 px-3 py-2 text-sm text-slate-200"
        >
          Filter
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={goPreviousDay}
          className="rounded-full bg-white/10 px-4 py-2"
        >
          ←
        </button>

        <p className="text-center text-sm font-semibold text-slate-200">
          {selectedDate.toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <button
          onClick={goNextDay}
          className="rounded-full bg-white/10 px-4 py-2"
        >
          →
        </button>
      </div>
    </div>
  );
}
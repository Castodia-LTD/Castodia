"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Home, Moon, Sun, UserRound } from "lucide-react";

import { CastodiaCard, CastodiaPageShell } from "@/components/castodia";
import { supabase } from "@/lib/supabase";
import { addDays, formatDay, formatWeekRange, startOfWeek, timeLabel, toLocalDateKey, weekDays } from "@/features/care/shared/rota/date";
import type { RotaPerson, RotaShift } from "@/features/care/shared/rota/types";

function personName(person?: RotaPerson | null) {
  if (!person) return "Unknown person";
  return person.full_name.trim() || "Unknown person";
}

export default function MyRotaPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [shifts, setShifts] = useState<RotaShift[]>([]);
  const [people, setPeople] = useState<RotaPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);

  const loadRota = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("You are not signed in.");

      const { data: shiftData, error: shiftError } = await supabase
        .from("rota_shifts")
        .select("id, organisation_id, service_user_id, shift_date, start_time, end_time, shift_type, shift_period, notes, status, rota_shift_assignments(id, staff_user_id, assignment_type)")
        .gte("shift_date", toLocalDateKey(weekStart))
        .lte("shift_date", toLocalDateKey(weekEnd))
        .eq("status", "planned")
        .order("shift_date")
        .order("start_time");
      if (shiftError) throw shiftError;

      const nextShifts = (shiftData ?? []) as unknown as RotaShift[];
      setShifts(nextShifts);

      const personIds = Array.from(new Set(nextShifts.map((shift) => shift.service_user_id)));
      if (personIds.length === 0) {
        setPeople([]);
        return;
      }

      const { data: personData, error: personError } = await supabase
        .from("service_users")
        .select("id, full_name, house_name")
        .in("id", personIds);
      if (personError) throw personError;
      setPeople((personData ?? []) as RotaPerson[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load your rota.");
    } finally {
      setLoading(false);
    }
  }, [weekEnd, weekStart]);

  useEffect(() => { void loadRota(); }, [loadRota]);

  return (
    <CastodiaPageShell
      title="My rota"
      description="Your assigned shifts and annual leave are populated automatically from service-user rotas."
      maxWidth="wide"
      actions={
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Previous week" className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700 hover:bg-slate-50" onClick={() => setWeekStart((current) => addDays(current, -7))}><ChevronLeft className="h-5 w-5" /></button>
          <div className="min-w-44 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-800"><CalendarDays className="mr-2 inline h-4 w-4" />{formatWeekRange(weekStart)}</div>
          <button type="button" aria-label="Next week" className="rounded-xl border border-slate-300 bg-white p-2.5 text-slate-700 hover:bg-slate-50" onClick={() => setWeekStart((current) => addDays(current, 7))}><ChevronRight className="h-5 w-5" /></button>
        </div>
      }
    >
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

      {loading ? (
        <CastodiaCard className="p-8 text-center text-sm text-slate-500">Loading your rota…</CastodiaCard>
      ) : shifts.length === 0 ? (
        <CastodiaCard className="p-10 text-center"><CalendarDays className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 font-semibold text-slate-800">No shifts assigned this week</p><p className="mt-1 text-sm text-slate-500">Shifts will appear here when a manager tags you on a service-user rota.</p></CastodiaCard>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const key = toLocalDateKey(day);
            const dayShifts = shifts.filter((shift) => shift.shift_date === key);
            if (dayShifts.length === 0) return null;

            return (
              <section key={key}>
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-500">{formatDay(day)}</h2>
                <div className="grid gap-3 lg:grid-cols-2">
                  {dayShifts.map((shift) => {
                    const person = peopleById.get(shift.service_user_id);
                    const assignment = shift.rota_shift_assignments?.[0];
                    const annualLeave = assignment?.assignment_type === "annual_leave";
                    return (
                      <CastodiaCard key={shift.id} className={`p-4 sm:p-5 ${annualLeave ? "border-rose-200 bg-rose-50/60 opacity-80" : ""}`}>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${shift.shift_period === "night" ? "bg-indigo-100 text-indigo-800" : "bg-amber-100 text-amber-800"}`}>
                                {shift.shift_period === "night" ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
                                {shift.shift_period === "night" ? "Night" : "Day"}
                              </span>
                              {annualLeave && <span className="rounded-full border border-rose-300 bg-rose-100 px-2.5 py-1 text-xs font-bold text-rose-800">Annual leave</span>}
                            </div>
                            <div className={`flex items-center gap-2 text-lg font-bold ${annualLeave ? "text-rose-900" : "text-slate-900"}`}><Clock3 className={`h-5 w-5 ${annualLeave ? "text-rose-600" : "text-cyan-700"}`} />{timeLabel(shift.start_time)}–{timeLabel(shift.end_time)}</div>
                            <p className={`mt-1 text-sm font-semibold ${annualLeave ? "text-rose-700" : "text-cyan-700"}`}>{shift.shift_type}</p>
                          </div>
                          <div className={`rounded-xl px-3 py-2 text-sm ${annualLeave ? "bg-rose-100/70 text-rose-800" : "bg-slate-50 text-slate-700"}`}>
                            <div className="flex items-center gap-2 font-semibold"><UserRound className="h-4 w-4" />{personName(person)}</div>
                            {person?.house_name && <div className="mt-1 flex items-center gap-2 text-xs opacity-75"><Home className="h-3.5 w-3.5" />{person.house_name}</div>}
                          </div>
                        </div>
                        {annualLeave && <p className="mt-4 rounded-xl border border-rose-200 bg-white/60 p-3 text-sm font-semibold text-rose-800">You are marked as annual leave for this shift. Any cover staff are managed on the service-user rota.</p>}
                        {!annualLeave && shift.notes && <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Shift details</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{shift.notes}</p></div>}
                      </CastodiaCard>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </CastodiaPageShell>
  );
}

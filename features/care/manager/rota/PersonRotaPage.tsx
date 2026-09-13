"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BedDouble, CalendarDays, ChevronLeft, ChevronRight, Moon, Plus, Sun, UserPlus, X } from "lucide-react";

import { CastodiaButton, CastodiaCard, CastodiaPageShell } from "@/components/castodia";
import { supabase } from "@/lib/supabase";
import { findRotaConflicts } from "@/features/care/shared/rota/conflicts";
import { timeLabel, toLocalDateKey } from "@/features/care/shared/rota/date";
import type { RotaAssignmentType, RotaPerson, RotaShift, RotaShiftPeriod, RotaStaff } from "@/features/care/shared/rota/types";

type DraftAssignment = { staffUserId: string; type: RotaAssignmentType };
type ShiftDraft = {
  shiftDate: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  shiftPeriod: RotaShiftPeriod;
  isSleepIn: boolean;
  notes: string;
  assignments: DraftAssignment[];
};

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function monthStart(date: Date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function monthEnd(date: Date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0); }
function calendarStart(date: Date) { const first = monthStart(date); return addDays(first, -((first.getDay() + 6) % 7)); }
function calendarEnd(date: Date) { const last = monthEnd(date); return addDays(last, 6 - ((last.getDay() + 6) % 7)); }
function calendarDays(date: Date) {
  const start = calendarStart(date);
  const end = calendarEnd(date);
  const days: Date[] = [];
  for (let current = start; current <= end; current = addDays(current, 1)) days.push(current);
  return days;
}
function monthLabel(date: Date) { return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" }); }

function blankDraft(date: Date): ShiftDraft {
  return {
    shiftDate: toLocalDateKey(date),
    startTime: "08:00",
    endTime: "20:00",
    shiftType: "Support",
    shiftPeriod: "day",
    isSleepIn: false,
    notes: "",
    assignments: [],
  };
}

export default function PersonRotaPage({ serviceUserId }: { serviceUserId: string }) {
  const [month, setMonth] = useState(() => monthStart(new Date()));
  const [person, setPerson] = useState<RotaPerson | null>(null);
  const [staff, setStaff] = useState<RotaStaff[]>([]);
  const [shifts, setShifts] = useState<RotaShift[]>([]);
  const [draft, setDraft] = useState<ShiftDraft>(() => blankDraft(new Date()));
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => calendarDays(month), [month]);
  const displayStart = days[0];
  const displayEnd = days[days.length - 1];
  const staffById = useMemo(() => new Map(staff.map((member) => [member.id, member])), [staff]);

  const loadRota = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("You are not signed in.");

      const { data: profile, error: profileError } = await supabase.from("profiles").select("organisation_id").eq("id", user.id).single();
      if (profileError || !profile?.organisation_id) throw new Error("Organisation not found.");

      const queryStart = addDays(displayStart, -1);
      const queryEnd = addDays(displayEnd, 1);
      const [personResult, staffResult, shiftsResult] = await Promise.all([
        supabase.from("service_users").select("id, full_name, house_name").eq("id", serviceUserId).eq("organisation_id", profile.organisation_id).eq("is_active", true).single(),
        supabase.from("profiles").select("id, full_name, role").eq("organisation_id", profile.organisation_id).order("full_name"),
        supabase.from("rota_shifts")
          .select("id, organisation_id, service_user_id, shift_date, start_time, end_time, shift_type, shift_period, is_sleep_in, notes, status, rota_shift_assignments(id, staff_user_id, assignment_type)")
          .eq("organisation_id", profile.organisation_id)
          .gte("shift_date", toLocalDateKey(queryStart))
          .lte("shift_date", toLocalDateKey(queryEnd))
          .eq("status", "planned")
          .order("shift_date")
          .order("start_time"),
      ]);

      if (personResult.error) throw personResult.error;
      if (staffResult.error) throw staffResult.error;
      if (shiftsResult.error) throw shiftsResult.error;

      setPerson(personResult.data as RotaPerson);
      const organisationStaff = (staffResult.data ?? []) as RotaStaff[];
      setStaff(organisationStaff);
      setSelectedStaffId((current) => current || organisationStaff[0]?.id || "");
      setShifts((shiftsResult.data ?? []) as unknown as RotaShift[]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load this rota.");
    } finally {
      setLoading(false);
    }
  }, [displayEnd, displayStart, serviceUserId]);

  useEffect(() => { void loadRota(); }, [loadRota]);

  const personShifts = useMemo(() => shifts.filter((shift) => shift.service_user_id === serviceUserId), [serviceUserId, shifts]);
  const conflicts = useMemo(() => findRotaConflicts(shifts, staff), [shifts, staff]);
  const conflictShiftIds = useMemo(() => new Set(conflicts.flatMap((item) => [item.firstShiftId, item.secondShiftId])), [conflicts]);

  const draftConflicts = useMemo(() => {
    const workingIds = draft.assignments.filter((item) => item.type === "working").map((item) => item.staffUserId);
    if (workingIds.length === 0) return [];
    const proposed: RotaShift = {
      id: "__draft__",
      organisation_id: "",
      service_user_id: serviceUserId,
      shift_date: draft.shiftDate,
      start_time: draft.startTime,
      end_time: draft.endTime,
      shift_type: draft.shiftType,
      shift_period: draft.shiftPeriod,
      is_sleep_in: draft.isSleepIn,
      notes: draft.notes || null,
      status: "planned",
      rota_shift_assignments: workingIds.map((staffUserId) => ({ id: `draft-${staffUserId}`, staff_user_id: staffUserId, assignment_type: "working" })),
    };
    return findRotaConflicts([...shifts.filter((shift) => shift.id !== editingShiftId), proposed], staff)
      .filter((item) => item.firstShiftId === "__draft__" || item.secondShiftId === "__draft__");
  }, [draft, editingShiftId, serviceUserId, shifts, staff]);

  function setPeriod(period: RotaShiftPeriod) {
    setDraft((current) => ({
      ...current,
      shiftPeriod: period,
      startTime: period === "day" ? "08:00" : "20:00",
      endTime: period === "day" ? "20:00" : "08:00",
    }));
  }

  function openNewShift(date: Date) {
    setEditingShiftId(null);
    setDraft(blankDraft(date));
    setFormOpen(true);
    setError(null);
  }

  function openEditShift(shift: RotaShift) {
    setEditingShiftId(shift.id);
    setDraft({
      shiftDate: shift.shift_date,
      startTime: timeLabel(shift.start_time),
      endTime: timeLabel(shift.end_time),
      shiftType: shift.shift_type,
      shiftPeriod: shift.shift_period || "day",
      isSleepIn: Boolean(shift.is_sleep_in),
      notes: shift.notes ?? "",
      assignments: (shift.rota_shift_assignments ?? []).map((assignment) => ({ staffUserId: assignment.staff_user_id, type: assignment.assignment_type || "working" })),
    });
    setFormOpen(true);
    setError(null);
  }

  function assignSelected(type: RotaAssignmentType) {
    if (!selectedStaffId) return;
    setDraft((current) => ({
      ...current,
      assignments: [...current.assignments.filter((item) => item.staffUserId !== selectedStaffId), { staffUserId: selectedStaffId, type }],
    }));
  }

  function removeAssignment(staffUserId: string) {
    setDraft((current) => ({ ...current, assignments: current.assignments.filter((item) => item.staffUserId !== staffUserId) }));
  }

  async function saveShift() {
    if (!draft.shiftDate || !draft.startTime || !draft.endTime) {
      setError("Choose a date, start time and end time.");
      return;
    }

    const workingIds = draft.assignments.filter((item) => item.type === "working").map((item) => item.staffUserId);
    const leaveIds = draft.assignments.filter((item) => item.type === "annual_leave").map((item) => item.staffUserId);
    const allIds = Array.from(new Set([...workingIds, ...leaveIds]));

    setSaving(true);
    setError(null);
    try {
      let shiftId = editingShiftId;
      if (editingShiftId) {
        const { error: updateError } = await supabase.rpc("update_rota_shift", {
          p_shift_id: editingShiftId,
          p_service_user_id: serviceUserId,
          p_shift_date: draft.shiftDate,
          p_start_time: draft.startTime,
          p_end_time: draft.endTime,
          p_shift_type: draft.shiftType.trim() || "Support",
          p_notes: draft.notes,
          p_staff_user_ids: allIds,
        });
        if (updateError) throw updateError;
      } else {
        const { data, error: createError } = await supabase.rpc("create_rota_shift", {
          p_service_user_id: serviceUserId,
          p_shift_date: draft.shiftDate,
          p_start_time: draft.startTime,
          p_end_time: draft.endTime,
          p_shift_type: draft.shiftType.trim() || "Support",
          p_notes: draft.notes,
          p_staff_user_ids: allIds,
        });
        if (createError) throw createError;
        shiftId = data as string;
      }

      if (!shiftId) throw new Error("Shift could not be identified after saving.");
      const { error: configError } = await supabase.rpc("configure_rota_shift", {
        p_shift_id: shiftId,
        p_shift_period: draft.shiftPeriod,
        p_annual_leave_staff_user_ids: leaveIds,
        p_is_sleep_in: draft.isSleepIn,
      });
      if (configError) throw configError;

      setFormOpen(false);
      setEditingShiftId(null);
      await loadRota();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this shift.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelShift() {
    if (!editingShiftId || !window.confirm("Cancel this shift? It will stay in the audit record but disappear from the active rota.")) return;
    const { error: cancelError } = await supabase.rpc("cancel_rota_shift", { p_shift_id: editingShiftId });
    if (cancelError) {
      setError(cancelError.message);
      return;
    }
    setFormOpen(false);
    setEditingShiftId(null);
    await loadRota();
  }

  return (
    <CastodiaPageShell
      title={person ? `${person.full_name} — Rota` : "Service user rota"}
      description={person?.house_name ? `${person.house_name}. Build this person's rota; staff schedules are populated from these assignments.` : "Build this person's rota; staff schedules are populated from these assignments."}
      maxWidth="full"
      actions={<Link href="/care/manager/rota" className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">All rotas</Link>}
    >
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

      <CastodiaCard className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-xl border border-slate-300 p-2.5 text-slate-700 hover:bg-slate-50"><ChevronLeft className="h-5 w-5" /></button>
            <div className="min-w-52 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center font-bold text-slate-900"><CalendarDays className="mr-2 inline h-4 w-4 text-cyan-700" />{monthLabel(month)}</div>
            <button type="button" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-xl border border-slate-300 p-2.5 text-slate-700 hover:bg-slate-50"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <button type="button" onClick={() => setMonth(monthStart(new Date()))} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">This month</button>
        </div>
      </CastodiaCard>

      {conflicts.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="flex gap-2"><AlertTriangle className="h-5 w-5 shrink-0" /><div><strong>{conflicts.length} staffing {conflicts.length === 1 ? "clash" : "clashes"} detected.</strong> Annual leave is excluded from clash detection; only overlapping working assignments are flagged.</div></div>
        </div>
      )}

      {formOpen && (
        <CastodiaCard className="p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div><h2 className="text-lg font-bold text-slate-900">{editingShiftId ? "Edit shift" : "Add shift"}</h2><p className="mt-1 text-sm text-slate-500">Tag the shift as Day or Night, mark Sleep-in when needed, then add working staff or annual leave cover.</p></div>
            <button type="button" onClick={() => setFormOpen(false)} aria-label="Close shift editor" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
          </div>

          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setPeriod("day")} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${draft.shiftPeriod === "day" ? "bg-amber-100 text-amber-900 ring-2 ring-amber-300" : "bg-slate-100 text-slate-600"}`}><Sun className="h-4 w-4" />Day</button>
            <button type="button" onClick={() => setPeriod("night")} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${draft.shiftPeriod === "night" ? "bg-indigo-100 text-indigo-900 ring-2 ring-indigo-300" : "bg-slate-100 text-slate-600"}`}><Moon className="h-4 w-4" />Night</button>
            <label className={`ml-0 flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold sm:ml-2 ${draft.isSleepIn ? "border-violet-300 bg-violet-100 text-violet-900" : "border-slate-300 bg-white text-slate-700"}`}>
              <input type="checkbox" checked={draft.isSleepIn} onChange={(event) => setDraft((current) => ({ ...current, isSleepIn: event.target.checked }))} className="h-4 w-4 rounded border-slate-300" />
              <BedDouble className="h-4 w-4" />Sleep-in
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div><label className={labelClass} htmlFor="shift-date">Date</label><input id="shift-date" type="date" className={inputClass} value={draft.shiftDate} onChange={(event) => setDraft((current) => ({ ...current, shiftDate: event.target.value }))} /></div>
            <div><label className={labelClass} htmlFor="shift-start">Start</label><input id="shift-start" type="time" className={inputClass} value={draft.startTime} onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))} /></div>
            <div><label className={labelClass} htmlFor="shift-end">End</label><input id="shift-end" type="time" className={inputClass} value={draft.endTime} onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))} /></div>
            <div className="md:col-span-2"><label className={labelClass} htmlFor="shift-type">Shift / support type</label><input id="shift-type" className={inputClass} value={draft.shiftType} onChange={(event) => setDraft((current) => ({ ...current, shiftType: event.target.value }))} /></div>
            <div className="md:col-span-2 xl:col-span-5"><label className={labelClass} htmlFor="shift-notes">Shift details</label><input id="shift-notes" className={inputClass} value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Optional notes" /></div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1"><label className={labelClass} htmlFor="staff-picker">Staff member</label><select id="staff-picker" value={selectedStaffId} onChange={(event) => setSelectedStaffId(event.target.value)} className={inputClass} disabled={staff.length === 0}>{staff.length === 0 && <option value="">No staff available</option>}{staff.map((member) => <option key={member.id} value={member.id}>{member.full_name || "Unnamed staff"}{member.role === "manager" ? " — Manager" : ""}</option>)}</select></div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => assignSelected("working")} disabled={!selectedStaffId} className="flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40"><UserPlus className="h-4 w-4" />Add staff</button>
                <button type="button" onClick={() => assignSelected("annual_leave")} disabled={!selectedStaffId} className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 disabled:opacity-40">Annual leave</button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {draft.assignments.length === 0 && <p className="text-sm text-slate-500">No staff tagged yet.</p>}
              {draft.assignments.map((assignment) => {
                const member = staffById.get(assignment.staffUserId);
                const leave = assignment.type === "annual_leave";
                return <div key={assignment.staffUserId} className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${leave ? "border-rose-300 bg-rose-100/60 text-rose-800" : "border-cyan-200 bg-cyan-50 text-cyan-800"}`}><span>{member?.full_name || "Unnamed staff"}{leave ? " — Annual leave" : ""}</span><button type="button" onClick={() => removeAssignment(assignment.staffUserId)} aria-label={`Remove ${member?.full_name || "staff"}`}><X className="h-3.5 w-3.5" /></button></div>;
              })}
            </div>
          </div>

          {draftConflicts.length > 0 && <div role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="mr-2 inline h-4 w-4" /><strong>Assignment clash:</strong> {Array.from(new Set(draftConflicts.map((item) => item.staffName))).join(", ")} already has an overlapping working shift. Annual leave entries are not counted as clashes.</div>}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <div>{editingShiftId && <button type="button" onClick={() => void cancelShift()} className="rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50">Cancel shift</button>}</div>
            <div className="flex gap-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button><CastodiaButton onClick={() => void saveShift()} disabled={saving}>{saving ? "Saving…" : editingShiftId ? "Save changes" : "Add to rota"}</CastodiaButton></div>
          </div>
        </CastodiaCard>
      )}

      {loading ? <CastodiaCard className="p-8 text-center text-sm text-slate-500">Loading rota…</CastodiaCard> : (
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold uppercase tracking-wide text-slate-500">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => <div key={label} className="px-2 py-2">{label}</div>)}</div>
            <div className="grid grid-cols-7 border-l border-t border-slate-200">
              {days.map((day) => {
                const key = toLocalDateKey(day);
                const inMonth = day.getMonth() === month.getMonth();
                const dayShifts = personShifts.filter((shift) => shift.shift_date === key);
                return <section key={key} className={`min-h-40 border-b border-r border-slate-200 p-2 ${inMonth ? "bg-white" : "bg-slate-50/70"}`}>
                  <div className="mb-2 flex items-center justify-between"><span className={`text-sm font-bold ${inMonth ? "text-slate-800" : "text-slate-400"}`}>{day.getDate()}</span><button type="button" onClick={() => openNewShift(day)} aria-label={`Add shift ${key}`} className="rounded-md p-1 text-cyan-700 hover:bg-cyan-50"><Plus className="h-4 w-4" /></button></div>
                  <div className="space-y-2">{dayShifts.map((shift) => {
                    const assignments = shift.rota_shift_assignments ?? [];
                    const leaveAssignments = assignments.filter((item) => item.assignment_type === "annual_leave");
                    const workingAssignments = assignments.filter((item) => item.assignment_type !== "annual_leave");
                    const hasConflict = conflictShiftIds.has(shift.id);
                    return <button type="button" key={shift.id} onClick={() => openEditShift(shift)} className={`w-full rounded-xl border p-2.5 text-left shadow-sm ${hasConflict ? "border-amber-400 bg-amber-50" : "border-slate-200 bg-white"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap gap-1"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${shift.shift_period === "night" ? "bg-indigo-100 text-indigo-800" : "bg-amber-100 text-amber-800"}`}>{shift.shift_period === "night" ? "Night" : "Day"}</span>{shift.is_sleep_in && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-800">Sleep-in</span>}</div>{hasConflict && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}</div>
                      <p className="mt-1.5 text-xs font-bold text-slate-900">{timeLabel(shift.start_time)}–{timeLabel(shift.end_time)}</p>
                      {workingAssignments.length > 0 ? <div className="mt-2 space-y-1">{workingAssignments.map((assignment) => <div key={assignment.id} className="rounded-md bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-800">{staffById.get(assignment.staff_user_id)?.full_name || "Unnamed staff"}</div>)}</div> : <p className="mt-2 text-[11px] font-semibold text-amber-700">No cover assigned</p>}
                      {leaveAssignments.length > 0 && <div className="mt-1.5 space-y-1">{leaveAssignments.map((assignment) => <div key={assignment.id} className="rounded-md border border-rose-200 bg-rose-100/60 px-2 py-1 text-[11px] font-semibold text-rose-800 opacity-80">{staffById.get(assignment.staff_user_id)?.full_name || "Unnamed staff"} · Annual leave</div>)}</div>}
                    </button>;
                  })}</div>
                </section>;
              })}
            </div>
          </div>
        </div>
      )}
    </CastodiaPageShell>
  );
}

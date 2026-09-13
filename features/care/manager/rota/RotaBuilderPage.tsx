"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, ChevronLeft, ChevronRight, Pencil, Plus, UserRound, X } from "lucide-react";

import { CastodiaButton, CastodiaCard, CastodiaPageShell } from "@/components/castodia";
import { supabase } from "@/lib/supabase";
import { addDays, formatDay, formatWeekRange, startOfWeek, timeLabel, toLocalDateKey, weekDays } from "@/features/care/shared/rota/date";
import { findRotaConflicts } from "@/features/care/shared/rota/conflicts";
import type { RotaPerson, RotaShift, RotaStaff } from "@/features/care/shared/rota/types";

type ShiftDraft = {
  serviceUserId: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  shiftType: string;
  notes: string;
  staffUserIds: string[];
};

const inputClass = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100";
const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";

function personName(person?: RotaPerson | null) {
  if (!person) return "Unknown person";
  return person.full_name?.trim() || `${person.first_name ?? ""} ${person.surname ?? ""}`.trim() || "Unknown person";
}

function blankDraft(personId: string, weekStart: Date): ShiftDraft {
  return {
    serviceUserId: personId,
    shiftDate: toLocalDateKey(weekStart),
    startTime: "09:00",
    endTime: "17:00",
    shiftType: "Support",
    notes: "",
    staffUserIds: [],
  };
}

export default function RotaBuilderPage() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [people, setPeople] = useState<RotaPerson[]>([]);
  const [staff, setStaff] = useState<RotaStaff[]>([]);
  const [shifts, setShifts] = useState<RotaShift[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [draft, setDraft] = useState<ShiftDraft>(() => blankDraft("", startOfWeek()));
  const [editingShiftId, setEditingShiftId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const peopleById = useMemo(() => new Map(people.map((person) => [person.id, person])), [people]);
  const staffById = useMemo(() => new Map(staff.map((member) => [member.id, member])), [staff]);

  const loadRota = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData.user;
      if (!user) throw new Error("You are not signed in.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("organisation_id")
        .eq("id", user.id)
        .single();
      if (profileError || !profile?.organisation_id) throw new Error("Organisation not found.");

      const [peopleResult, staffResult, shiftsResult] = await Promise.all([
        supabase
          .from("service_users")
          .select("id, first_name, surname, full_name, house_name")
          .eq("organisation_id", profile.organisation_id)
          .eq("is_active", true)
          .order("first_name"),
        supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("organisation_id", profile.organisation_id)
          .in("role", ["manager", "support"])
          .order("full_name"),
        supabase
          .from("rota_shifts")
          .select("id, organisation_id, service_user_id, shift_date, start_time, end_time, shift_type, notes, status, rota_shift_assignments(id, staff_user_id)")
          .eq("organisation_id", profile.organisation_id)
          .gte("shift_date", toLocalDateKey(weekStart))
          .lte("shift_date", toLocalDateKey(weekEnd))
          .eq("status", "planned")
          .order("shift_date")
          .order("start_time"),
      ]);

      if (peopleResult.error) throw peopleResult.error;
      if (staffResult.error) throw staffResult.error;
      if (shiftsResult.error) throw shiftsResult.error;

      const nextPeople = (peopleResult.data ?? []) as RotaPerson[];
      setPeople(nextPeople);
      setStaff((staffResult.data ?? []) as RotaStaff[]);
      setShifts((shiftsResult.data ?? []) as unknown as RotaShift[]);

      setSelectedPersonId((current) => {
        if (current && nextPeople.some((person) => person.id === current)) return current;
        return nextPeople[0]?.id ?? "";
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load the rota.");
    } finally {
      setLoading(false);
    }
  }, [weekEnd, weekStart]);

  useEffect(() => {
    void loadRota();
  }, [loadRota]);

  useEffect(() => {
    if (!selectedPersonId || editingShiftId) return;
    setDraft((current) => ({ ...current, serviceUserId: selectedPersonId }));
  }, [editingShiftId, selectedPersonId]);

  const visibleShifts = useMemo(
    () => shifts.filter((shift) => shift.service_user_id === selectedPersonId),
    [selectedPersonId, shifts],
  );

  const conflicts = useMemo(() => findRotaConflicts(shifts, staff), [shifts, staff]);
  const conflictShiftIds = useMemo(
    () => new Set(conflicts.flatMap((conflict) => [conflict.firstShiftId, conflict.secondShiftId])),
    [conflicts],
  );

  const draftConflicts = useMemo(() => {
    if (!draft.shiftDate || !draft.startTime || !draft.endTime || draft.staffUserIds.length === 0) return [];
    const proposed: RotaShift = {
      id: "__draft__",
      organisation_id: "",
      service_user_id: draft.serviceUserId,
      shift_date: draft.shiftDate,
      start_time: draft.startTime,
      end_time: draft.endTime,
      shift_type: draft.shiftType || "Support",
      notes: draft.notes || null,
      status: "planned",
      rota_shift_assignments: draft.staffUserIds.map((staffUserId) => ({ id: `draft-${staffUserId}`, staff_user_id: staffUserId })),
    };
    return findRotaConflicts([...shifts.filter((shift) => shift.id !== editingShiftId), proposed], staff)
      .filter((conflict) => conflict.firstShiftId === "__draft__" || conflict.secondShiftId === "__draft__");
  }, [draft, editingShiftId, shifts, staff]);

  function openNewShift(date?: Date) {
    const personId = selectedPersonId || people[0]?.id || "";
    setEditingShiftId(null);
    setDraft({ ...blankDraft(personId, weekStart), shiftDate: toLocalDateKey(date ?? weekStart) });
    setError(null);
    setFormOpen(true);
  }

  function openEditShift(shift: RotaShift) {
    setEditingShiftId(shift.id);
    setDraft({
      serviceUserId: shift.service_user_id,
      shiftDate: shift.shift_date,
      startTime: timeLabel(shift.start_time),
      endTime: timeLabel(shift.end_time),
      shiftType: shift.shift_type,
      notes: shift.notes ?? "",
      staffUserIds: (shift.rota_shift_assignments ?? []).map((assignment) => assignment.staff_user_id),
    });
    setFormOpen(true);
    setError(null);
  }

  function toggleStaff(staffUserId: string) {
    setDraft((current) => ({
      ...current,
      staffUserIds: current.staffUserIds.includes(staffUserId)
        ? current.staffUserIds.filter((id) => id !== staffUserId)
        : [...current.staffUserIds, staffUserId],
    }));
  }

  async function saveShift() {
    if (!draft.serviceUserId || !draft.shiftDate || !draft.startTime || !draft.endTime) {
      setError("Choose a person, date, start time and end time.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const params = {
        p_service_user_id: draft.serviceUserId,
        p_shift_date: draft.shiftDate,
        p_start_time: draft.startTime,
        p_end_time: draft.endTime,
        p_shift_type: draft.shiftType.trim() || "Support",
        p_notes: draft.notes,
        p_staff_user_ids: draft.staffUserIds,
      };

      const result = editingShiftId
        ? await supabase.rpc("update_rota_shift", { p_shift_id: editingShiftId, ...params })
        : await supabase.rpc("create_rota_shift", params);

      if (result.error) throw result.error;
      setFormOpen(false);
      setEditingShiftId(null);
      setSelectedPersonId(draft.serviceUserId);
      await loadRota();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save this shift.");
    } finally {
      setSaving(false);
    }
  }

  async function cancelShift(shiftId: string) {
    if (!window.confirm("Cancel this shift? It will be retained in the audit record but removed from the active rota.")) return;
    setError(null);
    const { error: cancelError } = await supabase.rpc("cancel_rota_shift", { p_shift_id: shiftId });
    if (cancelError) {
      setError(cancelError.message);
      return;
    }
    if (editingShiftId === shiftId) {
      setEditingShiftId(null);
      setFormOpen(false);
    }
    await loadRota();
  }

  return (
    <CastodiaPageShell
      title="Rotas"
      description="Build the support rota around each person. Staff rotas are populated automatically from assigned shifts."
      maxWidth="full"
      actions={<CastodiaButton onClick={() => openNewShift()}><Plus className="h-4 w-4" /> Add shift</CastodiaButton>}
    >
      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</div>}

      <CastodiaCard className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <label className={labelClass} htmlFor="rota-person">Person / service</label>
            <select id="rota-person" className={inputClass} value={selectedPersonId} onChange={(event) => setSelectedPersonId(event.target.value)} disabled={loading || people.length === 0}>
              {people.length === 0 && <option value="">No active people found</option>}
              {people.map((person) => <option key={person.id} value={person.id}>{personName(person)}{person.house_name ? ` — ${person.house_name}` : ""}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous week" className="rounded-xl border border-slate-300 p-2.5 text-slate-700 hover:bg-slate-50" onClick={() => setWeekStart((current) => addDays(current, -7))}><ChevronLeft className="h-5 w-5" /></button>
            <div className="min-w-44 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-center text-sm font-semibold text-slate-800"><CalendarDays className="mr-2 inline h-4 w-4" />{formatWeekRange(weekStart)}</div>
            <button type="button" aria-label="Next week" className="rounded-xl border border-slate-300 p-2.5 text-slate-700 hover:bg-slate-50" onClick={() => setWeekStart((current) => addDays(current, 7))}><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
      </CastodiaCard>

      {conflicts.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4">
          <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><p className="font-semibold text-amber-900">{conflicts.length} staff rota {conflicts.length === 1 ? "clash" : "clashes"} detected</p><p className="mt-1 text-sm text-amber-800">{Array.from(new Set(conflicts.map((conflict) => conflict.staffName))).join(", ")} {conflicts.length === 1 ? "is" : "have staff"} assigned to overlapping shifts. Conflicting shifts are highlighted below.</p></div></div>
        </div>
      )}

      {formOpen && (
        <CastodiaCard className="p-5">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div><h2 className="text-lg font-bold text-slate-900">{editingShiftId ? "Edit shift" : "Add shift"}</h2><p className="mt-1 text-sm text-slate-500">Assigning staff here automatically places the shift on their individual rota.</p></div>
            <button type="button" aria-label="Close shift editor" onClick={() => setFormOpen(false)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="xl:col-span-2"><label className={labelClass} htmlFor="shift-person">Person</label><select id="shift-person" className={inputClass} value={draft.serviceUserId} onChange={(event) => setDraft((current) => ({ ...current, serviceUserId: event.target.value }))}>{people.map((person) => <option key={person.id} value={person.id}>{personName(person)}{person.house_name ? ` — ${person.house_name}` : ""}</option>)}</select></div>
            <div><label className={labelClass} htmlFor="shift-date">Date</label><input id="shift-date" type="date" className={inputClass} value={draft.shiftDate} onChange={(event) => setDraft((current) => ({ ...current, shiftDate: event.target.value }))} /></div>
            <div><label className={labelClass} htmlFor="shift-start">Start</label><input id="shift-start" type="time" className={inputClass} value={draft.startTime} onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))} /></div>
            <div><label className={labelClass} htmlFor="shift-end">End</label><input id="shift-end" type="time" className={inputClass} value={draft.endTime} onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))} /></div>
            <div className="md:col-span-2"><label className={labelClass} htmlFor="shift-type">Shift / support type</label><input id="shift-type" className={inputClass} value={draft.shiftType} onChange={(event) => setDraft((current) => ({ ...current, shiftType: event.target.value }))} placeholder="e.g. Support" /></div>
            <div className="md:col-span-2 xl:col-span-3"><label className={labelClass} htmlFor="shift-notes">Shift details</label><input id="shift-notes" className={inputClass} value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Optional information staff need for this shift" /></div>
          </div>

          <fieldset className="mt-5"><legend className="text-sm font-semibold text-slate-700">Assigned staff</legend><p className="mt-1 text-sm text-slate-500">Select everyone working this shift. Their My rota view is populated from this assignment.</p><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{staff.map((member) => { const checked = draft.staffUserIds.includes(member.id); return <label key={member.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${checked ? "border-cyan-500 bg-cyan-50 text-cyan-950" : "border-slate-200 bg-white text-slate-700"}`}><input type="checkbox" checked={checked} onChange={() => toggleStaff(member.id)} className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" /><span className="min-w-0"><span className="block truncate font-semibold">{member.full_name || "Unnamed staff"}</span><span className="block text-xs capitalize text-slate-500">{member.role || "staff"}</span></span></label>; })}</div></fieldset>

          {draftConflicts.length > 0 && <div role="alert" className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900"><div className="flex gap-2"><AlertTriangle className="h-5 w-5 shrink-0" /><div><span className="font-semibold">Assignment clash:</span> {Array.from(new Set(draftConflicts.map((conflict) => conflict.staffName))).join(", ")} already {draftConflicts.length === 1 ? "has" : "have"} an overlapping shift. You can still save if the overlap is intentional.</div></div></div>}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div>{editingShiftId && <button type="button" onClick={() => void cancelShift(editingShiftId)} className="rounded-xl border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50">Cancel shift</button>}</div><div className="flex gap-2"><button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Close</button><CastodiaButton onClick={() => void saveShift()} disabled={saving}>{saving ? "Saving…" : editingShiftId ? "Save changes" : "Add to rota"}</CastodiaButton></div></div>
        </CastodiaCard>
      )}

      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1120px] grid-cols-7 gap-3">
          {days.map((day) => {
            const key = toLocalDateKey(day);
            const dayShifts = visibleShifts.filter((shift) => shift.shift_date === key);
            return <section key={key} className="min-h-[360px] rounded-2xl border border-slate-200 bg-slate-50/70 p-3"><div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-sm font-bold text-slate-800">{formatDay(day)}</h2><button type="button" onClick={() => openNewShift(day)} aria-label={`Add shift ${formatDay(day)}`} className="rounded-lg border border-slate-200 bg-white p-1.5 text-cyan-700 shadow-sm hover:bg-cyan-50"><Plus className="h-4 w-4" /></button></div><div className="space-y-2">{dayShifts.length === 0 && <button type="button" onClick={() => openNewShift(day)} className="w-full rounded-xl border border-dashed border-slate-300 px-3 py-8 text-center text-xs font-medium text-slate-400 hover:border-cyan-300 hover:bg-cyan-50/50 hover:text-cyan-700">No shifts</button>}{dayShifts.map((shift) => { const assigned = (shift.rota_shift_assignments ?? []).map((assignment) => staffById.get(assignment.staff_user_id)?.full_name || "Unnamed staff"); const hasConflict = conflictShiftIds.has(shift.id); return <button type="button" key={shift.id} onClick={() => openEditShift(shift)} className={`w-full rounded-xl border bg-white p-3 text-left shadow-sm transition hover:shadow ${hasConflict ? "border-amber-400 ring-1 ring-amber-200" : "border-slate-200"}`}><div className="flex items-start justify-between gap-2"><div><p className="text-sm font-bold text-slate-900">{timeLabel(shift.start_time)}–{timeLabel(shift.end_time)}</p><p className="mt-0.5 text-xs font-semibold text-cyan-700">{shift.shift_type}</p></div>{hasConflict ? <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" /> : <Pencil className="h-3.5 w-3.5 shrink-0 text-slate-400" />}</div>{assigned.length > 0 ? <div className="mt-2 flex gap-1.5 text-xs text-slate-600"><UserRound className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span>{assigned.join(", ")}</span></div> : <p className="mt-2 text-xs font-medium text-amber-700">Unassigned</p>}{shift.notes && <p className="mt-2 line-clamp-3 text-xs text-slate-500">{shift.notes}</p>}</button>; })}</div></section>;
          })}
        </div>
      </div>

      {!loading && people.length === 0 && <CastodiaCard className="p-10 text-center"><p className="font-semibold text-slate-800">No active people are available for rota planning.</p></CastodiaCard>}
    </CastodiaPageShell>
  );
}

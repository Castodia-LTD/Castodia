"use client";

import {
  type FormEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CastodiaButton,
  CastodiaCard,
} from "@/components/castodia";
import type { CalendarEvent } from "./types";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const STORAGE_KEY = "castodia-calendar-events";

type NewEventForm = {
  title: string;
  category: CalendarEvent["category"];
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  location: string;
  relatedName: string;
};

function createEmptyEventForm(date: Date): NewEventForm {
  return {
    title: "",
    category: "general",
    date: toDateKey(date),
    startTime: "09:00",
    endTime: "10:00",
    allDay: false,
    location: "",
    relatedName: "",
  };
}

export function CastodiaCalendar() {
  const initialDate = useMemo(() => new Date(), []);

  const [visibleMonth, setVisibleMonth] = useState(
    new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      1,
    ),
  );

  const [selectedDate, setSelectedDate] =
    useState(initialDate);

  const [events, setEvents] = useState<
    CalendarEvent[]
  >([]);

  const [eventsLoaded, setEventsLoaded] =
    useState(false);

  const [isAddEventOpen, setIsAddEventOpen] =
    useState(false);

  const [eventForm, setEventForm] =
    useState<NewEventForm>(
      createEmptyEventForm(initialDate),
    );

  useEffect(() => {
    try {
      const storedEvents =
        window.localStorage.getItem(STORAGE_KEY);

      if (storedEvents) {
        const parsedEvents = JSON.parse(
          storedEvents,
        ) as CalendarEvent[];

        setEvents(parsedEvents);
      }
    } catch (error) {
      console.error(
        "Failed to load calendar events:",
        error,
      );
    } finally {
      setEventsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!eventsLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(events),
      );
    } catch (error) {
      console.error(
        "Failed to save calendar events:",
        error,
      );
    }
  }, [events, eventsLoaded]);

  const calendarDays = useMemo(
    () => createCalendarDays(visibleMonth),
    [visibleMonth],
  );

  const monthLabel = new Intl.DateTimeFormat(
    "en-GB",
    {
      month: "long",
      year: "numeric",
    },
  ).format(visibleMonth);

  function goToPreviousMonth() {
    const previousMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() - 1,
      1,
    );

    setVisibleMonth(previousMonth);
    setSelectedDate(previousMonth);
  }

  function goToNextMonth() {
    const nextMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      1,
    );

    setVisibleMonth(nextMonth);
    setSelectedDate(nextMonth);
  }

  function goToToday() {
    const today = new Date();

    setVisibleMonth(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
      ),
    );

    setSelectedDate(today);
  }

  function changeSelectedDay(amount: number) {
    const nextDate = addDays(
      selectedDate,
      amount,
    );

    setSelectedDate(nextDate);

    setVisibleMonth(
      new Date(
        nextDate.getFullYear(),
        nextDate.getMonth(),
        1,
      ),
    );
  }

  function openAddEvent(
    date = selectedDate,
  ) {
    setEventForm(
      createEmptyEventForm(date),
    );

    setIsAddEventOpen(true);
  }

  function closeAddEvent() {
    setIsAddEventOpen(false);
  }

  function saveEvent(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const title = eventForm.title.trim();

    if (!title || !eventForm.date) {
      return;
    }

    if (
      !eventForm.allDay &&
      eventForm.endTime <= eventForm.startTime
    ) {
      window.alert(
        "The end time must be later than the start time.",
      );

      return;
    }

    const startTime = eventForm.allDay
      ? "00:00"
      : eventForm.startTime;

    const endTime = eventForm.allDay
      ? "23:59"
      : eventForm.endTime;

    const newEvent: CalendarEvent = {
      id: crypto.randomUUID(),
      title,
      category: eventForm.category,
      status: "scheduled",
      startAt: createLocalDateTime(
        eventForm.date,
        startTime,
      ),
      endAt: createLocalDateTime(
        eventForm.date,
        endTime,
      ),
      allDay: eventForm.allDay,
      location:
        eventForm.location.trim() ||
        undefined,
      serviceUserName:
        eventForm.relatedName.trim() ||
        undefined,
    };

    setEvents((current) => [
      ...current,
      newEvent,
    ]);

    const savedDate = new Date(
      newEvent.startAt,
    );

    setSelectedDate(savedDate);

    setVisibleMonth(
      new Date(
        savedDate.getFullYear(),
        savedDate.getMonth(),
        1,
      ),
    );

    setIsAddEventOpen(false);
  }

  function deleteEvent(eventId: string) {
    const confirmed = window.confirm(
      "Delete this calendar event?",
    );

    if (!confirmed) {
      return;
    }

    setEvents((current) =>
      current.filter(
        (event) => event.id !== eventId,
      ),
    );
  }

  return (
    <>
      <div className="space-y-4">
        <CalendarToolbar
          monthLabel={monthLabel}
          onPreviousMonth={
            goToPreviousMonth
          }
          onToday={goToToday}
          onNextMonth={goToNextMonth}
          onAddEvent={() =>
            openAddEvent()
          }
        />

        <div className="hidden md:block">
          <CalendarMonthView
            days={calendarDays}
            events={events}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onAddEvent={openAddEvent}
            onDeleteEvent={deleteEvent}
          />
        </div>

        <div className="md:hidden">
          <CalendarDayView
            date={selectedDate}
            events={getEventsForDate(
              events,
              selectedDate,
            )}
            onPreviousDay={() =>
              changeSelectedDay(-1)
            }
            onNextDay={() =>
              changeSelectedDay(1)
            }
            onAddEvent={() =>
              openAddEvent(selectedDate)
            }
            onDeleteEvent={deleteEvent}
          />
        </div>
      </div>

      {isAddEventOpen ? (
        <AddEventModal
          form={eventForm}
          onChange={setEventForm}
          onClose={closeAddEvent}
          onSubmit={saveEvent}
        />
      ) : null}
    </>
  );
}

type CalendarToolbarProps = {
  monthLabel: string;
  onPreviousMonth: () => void;
  onToday: () => void;
  onNextMonth: () => void;
  onAddEvent: () => void;
};

function CalendarToolbar({
  monthLabel,
  onPreviousMonth,
  onToday,
  onNextMonth,
  onAddEvent,
}: CalendarToolbarProps) {
  return (
    <CastodiaCard>
      <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-2 lg:justify-self-start">
          <CastodiaButton
            variant="secondary"
            onClick={onPreviousMonth}
            aria-label="View previous month"
          >
            ←
          </CastodiaButton>

          <CastodiaButton
            variant="secondary"
            onClick={onToday}
          >
            Today
          </CastodiaButton>

          <CastodiaButton
            variant="secondary"
            onClick={onNextMonth}
            aria-label="View next month"
          >
            →
          </CastodiaButton>
        </div>

        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-950 lg:text-3xl">
          {monthLabel}
        </h2>

        <div className="lg:justify-self-end">
          <CastodiaButton
            variant="primary"
            onClick={onAddEvent}
          >
            Add event
          </CastodiaButton>
        </div>
      </div>
    </CastodiaCard>
  );
}

type CalendarMonthViewProps = {
  days: Array<Date | null>;
  events: CalendarEvent[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onAddEvent: (date: Date) => void;
  onDeleteEvent: (eventId: string) => void;
};

function CalendarMonthView({
  days,
  events,
  selectedDate,
  onSelectDate,
  onAddEvent,
  onDeleteEvent,
}: CalendarMonthViewProps) {
  const weeks = chunkCalendarDays(days);

  return (
    <CastodiaCard
      padding="none"
      className="overflow-hidden"
    >
      <div className="grid grid-cols-7 bg-cyan-700">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="
              px-3 py-3 text-center
              text-xs font-bold uppercase
              tracking-wide text-white
            "
          >
            {weekday.slice(0, 3)}
          </div>
        ))}
      </div>

      <div className="space-y-2 bg-slate-100 p-2">
        {weeks.map((week, weekIndex) => {
          const selectedDateInWeek =
            week.find(
              (date) =>
                date !== null &&
                isSameCalendarDay(
                  date,
                  selectedDate,
                ),
            ) ?? null;

          return (
            <div
              key={`week-${weekIndex}`}
              className="space-y-2"
            >
              <div className="grid grid-cols-7 gap-2">
                {week.map((date, dayIndex) => {
                  const isWeekend =
                    dayIndex === 5 ||
                    dayIndex === 6;

                  if (date === null) {
                    return (
                      <div
                        key={`empty-${weekIndex}-${dayIndex}`}
                        aria-hidden="true"
                        className={[
                          "h-40 rounded-xl",
                          "border border-slate-200",
                          isWeekend
                            ? "bg-cyan-50/70"
                            : "bg-slate-50",
                        ].join(" ")}
                      />
                    );
                  }

                  const dateEvents =
                    getEventsForDate(
                      events,
                      date,
                    );

                  const isSelected =
                    isSameCalendarDay(
                      date,
                      selectedDate,
                    );

                  const isToday =
                    isSameCalendarDay(
                      date,
                      new Date(),
                    );

                  const tileBackground =
                    isToday
                      ? "bg-teal-100"
                      : isWeekend
                        ? "bg-cyan-50"
                        : "bg-white";

                  return (
                    <button
                      key={toDateKey(date)}
                      type="button"
                      onClick={() =>
                        onSelectDate(date)
                      }
                      onDoubleClick={() =>
                        onAddEvent(date)
                      }
                      className={[
                        "relative block h-40 w-full",
                        "overflow-hidden rounded-xl",
                        "border border-slate-200",
                        "text-left shadow-sm",
                        "transition duration-150",
                        "hover:-translate-y-0.5",
                        "hover:border-cyan-300",
                        "hover:shadow-md",
                        "focus-visible:z-10",
                        "focus-visible:outline-none",
                        "focus-visible:ring-2",
                        "focus-visible:ring-cyan-500",
                        "focus-visible:ring-offset-2",
                        tileBackground,
                        isSelected
                          ? "border-cyan-600 ring-2 ring-cyan-600"
                          : "",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute left-3 top-2.5",
                          "z-10 text-sm font-bold",
                          isToday
                            ? "text-cyan-800"
                            : "text-slate-800",
                        ].join(" ")}
                      >
                        {date.getDate()}
                      </span>

                      {isToday ? (
                        <span className="absolute right-3 top-2.5 text-[10px] font-bold uppercase tracking-wide text-cyan-800">
                          Today
                        </span>
                      ) : null}

                      <div className="absolute inset-x-3 bottom-3 top-10 overflow-hidden">
                        <div className="space-y-1.5">
                          {dateEvents
                            .slice(0, 3)
                            .map((event) => (
                              <CalendarEventPreview
                                key={event.id}
                                event={event}
                              />
                            ))}

                          {dateEvents.length >
                          3 ? (
                            <p className="px-1 text-xs font-semibold text-cyan-700">
                              +
                              {dateEvents.length -
                                3}{" "}
                              more
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedDateInWeek ? (
                <ExpandedDayPanel
                  date={selectedDateInWeek}
                  events={getEventsForDate(
                    events,
                    selectedDateInWeek,
                  )}
                  onAddEvent={() =>
                    onAddEvent(
                      selectedDateInWeek,
                    )
                  }
                  onDeleteEvent={
                    onDeleteEvent
                  }
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </CastodiaCard>
  );
}

function CalendarEventPreview({
  event,
}: {
  event: CalendarEvent;
}) {
  const relatedName =
    event.serviceUserName ??
    event.staffName;

  return (
    <div
      className={[
        "rounded-md border-l-4",
        "px-2 py-1.5 text-xs",
        getCategoryStyles(
          event.category,
        ),
      ].join(" ")}
    >
      <p className="truncate font-semibold">
        {!event.allDay
          ? `${formatTime(
              event.startAt,
            )} `
          : ""}
        {event.title}
      </p>

      {relatedName ? (
        <p className="mt-0.5 truncate opacity-75">
          {relatedName}
        </p>
      ) : null}
    </div>
  );
}

type ExpandedDayPanelProps = {
  date: Date;
  events: CalendarEvent[];
  onAddEvent: () => void;
  onDeleteEvent: (eventId: string) => void;
};

function ExpandedDayPanel({
  date,
  events,
  onAddEvent,
  onDeleteEvent,
}: ExpandedDayPanelProps) {
  const dateLabel = new Intl.DateTimeFormat(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(date);

  return (
    <div className="rounded-xl border border-cyan-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">
            Selected day
          </p>

          <h3 className="mt-1 text-lg font-bold text-slate-950">
            {dateLabel}
          </h3>
        </div>

        <CastodiaButton
          variant="primary"
          onClick={onAddEvent}
        >
          Add event
        </CastodiaButton>
      </div>

      {events.length === 0 ? (
        <div className="mt-5 rounded-lg bg-slate-50 px-4 py-8 text-center">
          <p className="font-semibold text-slate-800">
            No events scheduled
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Add an event for this day.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {events.map((event) => (
            <div
              key={event.id}
              className={[
                "rounded-lg border-l-4",
                "px-4 py-3",
                getCategoryStyles(
                  event.category,
                ),
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold opacity-75">
                    {event.allDay
                      ? "All day"
                      : formatTime(
                          event.startAt,
                        )}
                  </p>

                  <p className="mt-1 font-bold">
                    {event.title}
                  </p>

                  {event.serviceUserName ? (
                    <p className="mt-1 text-sm opacity-75">
                      {
                        event.serviceUserName
                      }
                    </p>
                  ) : null}

                  {event.staffName ? (
                    <p className="mt-1 text-sm opacity-75">
                      {event.staffName}
                    </p>
                  ) : null}

                  {event.location ? (
                    <p className="mt-1 text-sm opacity-75">
                      {event.location}
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onDeleteEvent(event.id)
                  }
                  className="shrink-0 text-xs font-semibold text-rose-600 hover:text-rose-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type CalendarDayViewProps = {
  date: Date;
  events: CalendarEvent[];
  onPreviousDay: () => void;
  onNextDay: () => void;
  onAddEvent: () => void;
  onDeleteEvent: (eventId: string) => void;
};

function CalendarDayView({
  date,
  events,
  onPreviousDay,
  onNextDay,
  onAddEvent,
  onDeleteEvent,
}: CalendarDayViewProps) {
  const dateLabel = new Intl.DateTimeFormat(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  ).format(date);

  return (
    <div className="space-y-4">
      <CastodiaCard>
        <div className="flex items-center justify-between gap-3">
          <CastodiaButton
            variant="secondary"
            onClick={onPreviousDay}
            aria-label="View previous day"
          >
            ←
          </CastodiaButton>

          <h2 className="text-center text-lg font-bold text-slate-950">
            {dateLabel}
          </h2>

          <CastodiaButton
            variant="secondary"
            onClick={onNextDay}
            aria-label="View next day"
          >
            →
          </CastodiaButton>
        </div>
      </CastodiaCard>

      <CastodiaButton
        variant="primary"
        onClick={onAddEvent}
      >
        Add event
      </CastodiaButton>

      {events.length === 0 ? (
        <CastodiaCard>
          <div className="py-10 text-center">
            <h3 className="font-semibold text-slate-950">
              No events scheduled
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              There are no operational events
              recorded for this day.
            </p>
          </div>
        </CastodiaCard>
      ) : (
        <div className="space-y-3">
          {events.map((event) => (
            <CastodiaCard
              key={event.id}
              interactive
            >
              <div className="flex gap-4">
                <div className="w-16 shrink-0">
                  <p className="text-sm font-bold text-slate-950">
                    {event.allDay
                      ? "All day"
                      : formatTime(
                          event.startAt,
                        )}
                  </p>
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className={[
                      "inline-flex rounded-full",
                      "border px-2 py-1",
                      "text-xs font-semibold",
                      getCategoryStyles(
                        event.category,
                      ),
                    ].join(" ")}
                  >
                    {formatCategory(
                      event.category,
                    )}
                  </div>

                  <h3 className="mt-2 text-base font-semibold text-slate-950">
                    {event.title}
                  </h3>

                  {event.serviceUserName ? (
                    <p className="mt-1 text-sm text-slate-500">
                      Related to:{" "}
                      {
                        event.serviceUserName
                      }
                    </p>
                  ) : null}

                  {event.location ? (
                    <p className="mt-1 text-sm text-slate-500">
                      Location:{" "}
                      {event.location}
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() =>
                      onDeleteEvent(
                        event.id,
                      )
                    }
                    className="mt-3 text-sm font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Delete event
                  </button>
                </div>
              </div>
            </CastodiaCard>
          ))}
        </div>
      )}
    </div>
  );
}

type AddEventModalProps = {
  form: NewEventForm;
  onChange: (
    form: NewEventForm,
  ) => void;
  onClose: () => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
};

function AddEventModal({
  form,
  onChange,
  onClose,
  onSubmit,
}: AddEventModalProps) {
  return (
    <div
      className="
        fixed inset-0 z-50 flex
        items-center justify-center
        bg-slate-950/50 p-4
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-event-title"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <form onSubmit={onSubmit}>
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
            <div>
              <h2
                id="add-event-title"
                className="text-xl font-bold text-slate-950"
              >
                Add calendar event
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Add an appointment, meeting,
                review or other operational
                event.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="
                rounded-lg px-3 py-2
                text-xl text-slate-500
                hover:bg-slate-100
                hover:text-slate-800
              "
              aria-label="Close add event form"
            >
              ×
            </button>
          </div>

          <div className="space-y-5 px-6 py-5">
            <FormField label="Event title">
              <input
                type="text"
                required
                autoFocus
                value={form.title}
                onChange={(event) =>
                  onChange({
                    ...form,
                    title:
                      event.target.value,
                  })
                }
                className={inputClasses}
                placeholder="For example, GP appointment"
              />
            </FormField>

            <FormField label="Category">
              <select
                value={form.category}
                onChange={(event) =>
                  onChange({
                    ...form,
                    category:
                      event.target
                        .value as CalendarEvent["category"],
                  })
                }
                className={inputClasses}
              >
                <option value="appointment">
                  Appointment
                </option>

                <option value="supervision">
                  Supervision
                </option>

                <option value="review">
                  Review
                </option>

                <option value="meeting">
                  Meeting
                </option>

                <option value="training">
                  Training
                </option>

                <option value="audit">
                  Audit
                </option>

                <option value="general">
                  General
                </option>
              </select>
            </FormField>

            <FormField label="Date">
              <input
                type="date"
                required
                value={form.date}
                onChange={(event) =>
                  onChange({
                    ...form,
                    date:
                      event.target.value,
                  })
                }
                className={inputClasses}
              />
            </FormField>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.allDay}
                onChange={(event) =>
                  onChange({
                    ...form,
                    allDay:
                      event.target.checked,
                  })
                }
                className="
                  h-4 w-4 rounded
                  border-slate-300
                  text-cyan-700
                  focus:ring-cyan-500
                "
              />

              <span className="text-sm font-semibold text-slate-700">
                All-day event
              </span>
            </label>

            {!form.allDay ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Start time">
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(event) =>
                      onChange({
                        ...form,
                        startTime:
                          event.target
                            .value,
                      })
                    }
                    className={
                      inputClasses
                    }
                  />
                </FormField>

                <FormField label="End time">
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(event) =>
                      onChange({
                        ...form,
                        endTime:
                          event.target
                            .value,
                      })
                    }
                    className={
                      inputClasses
                    }
                  />
                </FormField>
              </div>
            ) : null}

            <FormField label="Related person">
              <input
                type="text"
                value={form.relatedName}
                onChange={(event) =>
                  onChange({
                    ...form,
                    relatedName:
                      event.target.value,
                  })
                }
                className={inputClasses}
                placeholder="Service user or staff member"
              />
            </FormField>

            <FormField label="Location">
              <input
                type="text"
                value={form.location}
                onChange={(event) =>
                  onChange({
                    ...form,
                    location:
                      event.target.value,
                  })
                }
                className={inputClasses}
                placeholder="Optional"
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
            <CastodiaButton
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancel
            </CastodiaButton>

            <CastodiaButton
              type="submit"
              variant="primary"
            >
              Save event
            </CastodiaButton>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      {children}
    </label>
  );
}

const inputClasses = [
  "w-full rounded-lg",
  "border border-slate-300",
  "bg-white px-3 py-2.5",
  "text-sm text-slate-950",
  "outline-none transition",
  "placeholder:text-slate-400",
  "focus:border-cyan-600",
  "focus:ring-2",
  "focus:ring-cyan-100",
].join(" ");

function createCalendarDays(
  month: Date,
): Array<Date | null> {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const firstOfMonth = new Date(
    year,
    monthIndex,
    1,
  );

  const daysInMonth = new Date(
    year,
    monthIndex + 1,
    0,
  ).getDate();

  const leadingEmptyDays =
    (firstOfMonth.getDay() + 6) % 7;

  const days: Array<Date | null> = [];

  for (
    let index = 0;
    index < leadingEmptyDays;
    index += 1
  ) {
    days.push(null);
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day += 1
  ) {
    days.push(
      new Date(
        year,
        monthIndex,
        day,
      ),
    );
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function chunkCalendarDays(
  days: Array<Date | null>,
): Array<Array<Date | null>> {
  const weeks: Array<
    Array<Date | null>
  > = [];

  for (
    let index = 0;
    index < days.length;
    index += 7
  ) {
    weeks.push(
      days.slice(index, index + 7),
    );
  }

  return weeks;
}

function getEventsForDate(
  events: CalendarEvent[],
  date: Date,
): CalendarEvent[] {
  return events
    .filter((event) =>
      isSameCalendarDay(
        new Date(event.startAt),
        date,
      ),
    )
    .sort(
      (first, second) =>
        new Date(
          first.startAt,
        ).getTime() -
        new Date(
          second.startAt,
        ).getTime(),
    );
}

function createLocalDateTime(
  date: string,
  time: string,
): string {
  return new Date(
    `${date}T${time}:00`,
  ).toISOString();
}

function addDays(
  date: Date,
  amount: number,
): Date {
  const result = new Date(date);

  result.setDate(
    result.getDate() + amount,
  );

  return result;
}

function isSameCalendarDay(
  first: Date,
  second: Date,
): boolean {
  return (
    first.getFullYear() ===
      second.getFullYear() &&
    first.getMonth() ===
      second.getMonth() &&
    first.getDate() ===
      second.getDate()
  );
}

function toDateKey(
  date: Date,
): string {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(
    date.getDate(),
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTime(
  value: string,
): string {
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  ).format(new Date(value));
}

function formatCategory(
  category: CalendarEvent["category"],
): string {
  const labels: Record<
    CalendarEvent["category"],
    string
  > = {
    appointment: "Appointment",
    supervision: "Supervision",
    review: "Review",
    meeting: "Meeting",
    training: "Training",
    audit: "Audit",
    general: "General",
  };

  return labels[category];
}

function getCategoryStyles(
  category: CalendarEvent["category"],
): string {
  const styles: Record<
    CalendarEvent["category"],
    string
  > = {
    appointment:
      "border-blue-500 bg-blue-50 text-blue-800",
    supervision:
      "border-emerald-500 bg-emerald-50 text-emerald-800",
    review:
      "border-amber-500 bg-amber-50 text-amber-800",
    meeting:
      "border-violet-500 bg-violet-50 text-violet-800",
    training:
      "border-cyan-500 bg-cyan-50 text-cyan-800",
    audit:
      "border-rose-500 bg-rose-50 text-rose-800",
    general:
      "border-slate-400 bg-slate-100 text-slate-700",
  };

  return styles[category];
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa6";
import {
  getHebrewMonthDays,
  getHebrewMonthInfo,
  getHebrewMonthRange,
  getEventsForDateRange,
  nextHebrewMonth,
  prevHebrewMonth,
  getCurrentHebrewDate,
  CalendarEvent,
} from "@/lib/hebcal";
import { HDate } from "@hebcal/core";
import { createClient } from "@/lib/supabase/client";
import { useMember } from "@/hooks/useMember";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Hebrew day-of-week headers (Sunday to Saturday)
const DAY_HEADERS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];

// Convert Hebrew year to gematria display
function hebrewYearDisplay(year: number): string {
  const hdate = new HDate(1, 7, year); // 1 Tishrei of that year
  const full = hdate.renderGematriya();
  // Extract just the year part
  const parts = full.split(" ");
  return parts[parts.length - 1] || `${year}`;
}

// Main Hebrew calendar component navigating by Hebrew months
export function HebrewCalendar() {
  const router = useRouter();
  const currentHeb = getCurrentHebrewDate();
  // Track client mount to avoid SSR/SSG baking the build-time date into "today" highlight and current month
  const [mounted, setMounted] = useState(false);
  const [today, setToday] = useState<Date>(() => new Date());
  const [hebYear, setHebYear] = useState(currentHeb.year);
  const [hebMonth, setHebMonth] = useState(currentHeb.month);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [registrationCounts, setRegistrationCounts] = useState<Record<string, number>>({});
  const [myRegistrations, setMyRegistrations] = useState<Set<string>>(new Set());
  const { memberId } = useMember();

  // Re-sync today and current Hebrew month on client mount (fixes stale dates from SSG/cached HTML)
  useEffect(() => {
    const now = new Date();
    setToday(now);
    const heb = getCurrentHebrewDate();
    setHebYear(heb.year);
    setHebMonth(heb.month);
    setMounted(true);
  }, []);

  // Get month info for display
  const monthInfo = getHebrewMonthInfo(new HDate(1, hebMonth, hebYear));
  const { start: monthStart, end: monthEnd } = getHebrewMonthRange(hebYear, hebMonth);

  // Gregorian month range display
  const gregStartMonth = monthStart.toLocaleDateString("he-IL", { month: "short" });
  const gregEndMonth = monthEnd.toLocaleDateString("he-IL", { month: "short" });
  const gregYear = monthEnd.getFullYear();
  const gregDisplay = gregStartMonth === gregEndMonth
    ? `${gregStartMonth} ${gregYear}`
    : `${gregStartMonth}–${gregEndMonth} ${gregYear}`;

  // Fetch calendar events and registration data
  useEffect(() => {
    const calEvents = getEventsForDateRange(monthStart, monthEnd);
    setEvents(calEvents);

    // Fetch registration counts
    async function fetchRegistrations() {
      const supabase = createClient();
      const eventDates = calEvents.map((e) => e.dateString);
      if (eventDates.length === 0) {
        setRegistrationCounts({});
        setMyRegistrations(new Set());
        return;
      }

      const { data } = await supabase
        .from("event_registrations")
        .select("event_date, member_id")
        .in("event_date", eventDates);

      if (data) {
        const counts: Record<string, number> = {};
        const myRegs = new Set<string>();
        for (const reg of data) {
          counts[reg.event_date] = (counts[reg.event_date] || 0) + 1;
          if (reg.member_id === memberId) {
            myRegs.add(reg.event_date);
          }
        }
        setRegistrationCounts(counts);
        setMyRegistrations(myRegs);
      }
    }

    fetchRegistrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hebYear, hebMonth, memberId]);

  // Navigate to next Hebrew month (RTL: left arrow = forward in time)
  const goNext = () => {
    const next = nextHebrewMonth(hebYear, hebMonth);
    setHebYear(next.year);
    setHebMonth(next.month);
  };

  // Navigate to previous Hebrew month (RTL: right arrow = backward in time)
  const goPrev = () => {
    const prev = prevHebrewMonth(hebYear, hebMonth);
    setHebYear(prev.year);
    setHebMonth(prev.month);
  };

  // Get Hebrew month grid data
  const { days, firstDayOfWeek } = getHebrewMonthDays(hebYear, hebMonth);

  // Build event lookup map
  const eventMap = new Map<string, CalendarEvent>();
  for (const ev of events) {
    eventMap.set(ev.dateString, ev);
  }

  // Navigate to event detail page
  const handleDayClick = (dateStr: string) => {
    if (eventMap.has(dateStr)) {
      router.push(`/event/${dateStr}`);
    }
  };

  return (
    <div className="flex flex-col h-full p-3 sm:p-4">
      {/* Month navigation header - Hebrew months */}
      <div className="flex items-center justify-between mb-3">
        <Button variant="ghost" size="icon" onClick={goPrev}>
          <FaChevronRight className="w-4 h-4" />
        </Button>
        <div className="text-center">
          <h2 className="text-xl font-bold">
            {monthInfo.monthName} {hebrewYearDisplay(hebYear)}
          </h2>
          <p className="text-sm text-muted-foreground">
            {gregDisplay}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={goNext}>
          <FaChevronLeft className="w-4 h-4" />
        </Button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid with subtle dividers */}
      <div className="grid grid-cols-7 flex-1 border border-border rounded-xl overflow-hidden divide-x divide-border *:border-b *:border-border">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dateStr = day.date.toISOString().split("T")[0];
          const event = eventMap.get(dateStr);
          const isToday = mounted && day.date.toDateString() === today.toDateString();
          // Compute "past" against the client-mounted `today` so SSG doesn't bake build-time as the cutoff
          const todayMidnight = new Date(today);
          todayMidnight.setHours(0, 0, 0, 0);
          const dayMidnight = new Date(day.date);
          dayMidnight.setHours(0, 0, 0, 0);
          const past = mounted && dayMidnight < todayMidnight;
          const isSaturday = day.date.getDay() === 6;
          const regCount = registrationCounts[dateStr] || 0;
          const isMyReg = myRegistrations.has(dateStr);
          const isClickable = !!event;

          return (
            <div
              key={dateStr}
              onClick={() => handleDayClick(dateStr)}
              className={cn(
                "relative p-1 text-center flex flex-col min-h-0 transition-colors",
                isToday && "shadow-[inset_0_0_0_2px_oklch(0.5_0.2_260)]",
                !past && event?.type === "shabbat" && "bg-violet-50 dark:bg-violet-500/25",
                !past && event?.type === "holiday" && "bg-amber-50 dark:bg-amber-500/25",
                past && "bg-muted/60 text-muted-foreground",
                !past && isSaturday && !event && "bg-muted/30",
                isClickable && "cursor-pointer hover:brightness-90 transition-[filter]"
              )}
            >
              {/* Hebrew day number */}
              <div className="text-sm font-medium">{day.hebrewDate}</div>

              {/* Gregorian day */}
              <div className="text-[10px] text-muted-foreground leading-tight">
                {day.gregDay}
              </div>

              {/* Event indicator */}
              {event && (
                <div className="mt-auto">
                  <div
                    className={cn(
                      "text-[9px] leading-tight font-medium truncate",
                      event.type === "shabbat" ? "text-violet-700 dark:text-violet-300" : "text-amber-700 dark:text-amber-300"
                    )}
                  >
                    {event.title}
                  </div>

                  {regCount > 0 && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[9px] px-1 py-0 mt-0.5",
                        isMyReg && "bg-green-100 text-green-700 dark:bg-green-500/30 dark:text-green-200"
                      )}
                    >
                      {regCount} מגיעים
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

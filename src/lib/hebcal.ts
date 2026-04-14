import {
  HebrewCalendar,
  HDate,
  Event,
  flags,
  Location,
  gematriya,
} from "@hebcal/core";

// Represents a Shabbat or holiday event from the Hebrew calendar
export interface CalendarEvent {
  date: Date;
  dateString: string; // YYYY-MM-DD format
  type: "shabbat" | "holiday";
  title: string;
  hebrewDate: string;
}

// Hebrew month names
const HEBREW_MONTH_NAMES = [
  "", "ניסן", "אייר", "סיון", "תמוז", "אב", "אלול",
  "תשרי", "חשון", "כסלו", "טבת", "שבט", "אדר", "אדר ב׳",
];

// Get the Friday date string in YYYY-MM-DD format
function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Format a Date as a Hebrew date string
export function formatHebrewDate(date: Date): string {
  const hdate = new HDate(date);
  return hdate.renderGematriya();
}

// Get Hebrew month name and year from an HDate
export function getHebrewMonthInfo(hdate: HDate): { monthName: string; year: number } {
  const month = hdate.getMonth();
  const year = hdate.getFullYear();
  return {
    monthName: HEBREW_MONTH_NAMES[month] || `חודש ${month}`,
    year,
  };
}

// Get the Gregorian date range for a Hebrew month
export function getHebrewMonthRange(hebrewYear: number, hebrewMonth: number): { start: Date; end: Date } {
  // First day of the Hebrew month
  const firstDay = new HDate(1, hebrewMonth, hebrewYear);
  // Last day of the Hebrew month
  const daysInMonth = HDate.daysInMonth(hebrewMonth, hebrewYear);
  const lastDay = new HDate(daysInMonth, hebrewMonth, hebrewYear);

  return {
    start: firstDay.greg(),
    end: lastDay.greg(),
  };
}

// Get the number of days in a Hebrew month
export function getHebrewMonthDays(hebrewYear: number, hebrewMonth: number) {
  const daysInMonth = HDate.daysInMonth(hebrewMonth, hebrewYear);
  const days: { date: Date; hebrewDay: number; hebrewDate: string; gregDay: number }[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const hdate = new HDate(d, hebrewMonth, hebrewYear);
    const greg = hdate.greg();
    days.push({
      date: greg,
      hebrewDay: d,
      hebrewDate: gematriya(d),
      gregDay: greg.getDate(),
    });
  }

  // Day of week for the first day (0 = Sunday)
  const firstDayOfWeek = days[0].date.getDay();

  return { days, firstDayOfWeek, daysInMonth };
}

// Navigate to next Hebrew month
export function nextHebrewMonth(hebrewYear: number, hebrewMonth: number): { year: number; month: number } {
  const monthsInYear = HDate.monthsInYear(hebrewYear);
  if (hebrewMonth >= monthsInYear) {
    return { year: hebrewYear + 1, month: 1 };
  }
  return { year: hebrewYear, month: hebrewMonth + 1 };
}

// Navigate to previous Hebrew month
export function prevHebrewMonth(hebrewYear: number, hebrewMonth: number): { year: number; month: number } {
  if (hebrewMonth <= 1) {
    const prevYear = hebrewYear - 1;
    return { year: prevYear, month: HDate.monthsInYear(prevYear) };
  }
  return { year: hebrewYear, month: hebrewMonth - 1 };
}

// Check if a given date is a major Jewish holiday
function isMajorHoliday(ev: Event): boolean {
  const majorHolidayFlags =
    flags.CHAG | flags.LIGHT_CANDLES_TZEIS | flags.YOM_TOV_ENDS;
  return (ev.getFlags() & majorHolidayFlags) !== 0;
}

// Get all Shabbat and holiday events for a date range
export function getEventsForDateRange(start: Date, end: Date): CalendarEvent[] {
  const options = {
    start,
    end,
    sedrot: true,
    candlelighting: false,
    location: Location.lookup("Jerusalem"),
    locale: "he",
    il: true,
    mask:
      flags.PARSHA_HASHAVUA |
      flags.CHAG |
      flags.LIGHT_CANDLES_TZEIS |
      flags.YOM_TOV_ENDS |
      flags.EREV,
  };

  const events = HebrewCalendar.calendar(options);
  const result: CalendarEvent[] = [];
  const fridayDates = new Set<string>();

  // Process parsha events (Shabbat)
  for (const ev of events) {
    const evDate = ev.getDate().greg();
    if (ev.getFlags() & flags.PARSHA_HASHAVUA) {
      const dateStr = toDateString(evDate);
      fridayDates.add(dateStr);
      result.push({
        date: evDate,
        dateString: dateStr,
        type: "shabbat",
        title: ev.render("he"),
        hebrewDate: formatHebrewDate(evDate),
      });
    }
  }

  // Process holiday events
  for (const ev of events) {
    if (isMajorHoliday(ev)) {
      const evDate = ev.getDate().greg();
      const dateStr = toDateString(evDate);
      if (fridayDates.has(dateStr)) continue;
      result.push({
        date: evDate,
        dateString: dateStr,
        type: "holiday",
        title: ev.render("he"),
        hebrewDate: formatHebrewDate(evDate),
      });
    }
  }

  // Ensure every Saturday in the range is included (even without a parsha, e.g., Shabbat during Pesach)
  const capturedDates = new Set(result.map((r) => r.dateString));
  const current = new Date(start);
  while (current <= end) {
    if (current.getDay() === 6) {
      const saturdayStr = toDateString(current);

      // If this Saturday is not already captured, add it as a Shabbat
      if (!capturedDates.has(saturdayStr)) {
        const hdate = new HDate(current);
        result.push({
          date: new Date(current),
          dateString: saturdayStr,
          type: "shabbat",
          title: "שבת " + hdate.renderGematriya(false),
          hebrewDate: formatHebrewDate(current),
        });
      }
    }
    current.setDate(current.getDate() + 1);
  }

  result.sort((a, b) => a.date.getTime() - b.date.getTime());
  return result;
}

// Convenience: get events for a Gregorian month (used by legacy code)
export function getEventsForMonth(year: number, month: number): CalendarEvent[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return getEventsForDateRange(start, end);
}

// Get the next upcoming Shabbat or holiday
export function getNextEvent(): CalendarEvent | null {
  const today = new Date();
  const end = new Date(today);
  end.setDate(end.getDate() + 30);
  const events = getEventsForDateRange(today, end);
  return events[0] ?? null;
}

// Get month days for a Gregorian month (legacy)
export function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const days: { date: Date; hebrewDate: string; dayOfMonth: number }[] = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      hebrewDate: new HDate(date).renderGematriya(false),
      dayOfMonth: i,
    });
  }

  return { days, startDayOfWeek, daysInMonth };
}

// Check if a date is in the past
export function isPastDate(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const check = new Date(date);
  check.setHours(0, 0, 0, 0);
  return check < today;
}

// Get current Hebrew year and month
export function getCurrentHebrewDate(): { year: number; month: number } {
  const hdate = new HDate();
  return { year: hdate.getFullYear(), month: hdate.getMonth() };
}

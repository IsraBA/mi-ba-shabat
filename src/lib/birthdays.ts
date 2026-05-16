import { HDate } from "@hebcal/core";
import type { Birthday } from "@/types";

// Resolve a stored birthday (specific Hebrew year/month/day) to its occurrence in a
// target Hebrew year, applying the standard Adar handling and short-month clamping.
//
// Adar rules (Ashkenazi default for plain Adar):
//   - Birth in plain Adar (non-leap year, month=12):
//       leap target → Adar II (13);  non-leap target → Adar (12)
//   - Birth in Adar I (leap year, month=12):
//       leap target → Adar I (12);   non-leap target → Adar (12)
//   - Birth in Adar II (leap year, month=13):
//       leap target → Adar II (13);  non-leap target → Adar (12)
export function birthdayInYear(
  birthday: Pick<Birthday, "hebrew_year" | "hebrew_month" | "hebrew_day">,
  targetYear: number
): { month: number; day: number; age: number } {
  const targetIsLeap = HDate.isLeapYear(targetYear);
  const birthIsLeap = HDate.isLeapYear(birthday.hebrew_year);
  let month = birthday.hebrew_month;

  if (month === 12 || month === 13) {
    if (!targetIsLeap) {
      month = 12;
    } else if (!birthIsLeap) {
      // Plain Adar birth in a leap target year — falls in Adar II
      month = 13;
    }
    // else: birth was in a leap year, keep stored month (12 or 13) as-is
  }

  // Clamp day to month's actual length (e.g. 30 Cheshvan in a year where Cheshvan has 29 days)
  const maxDay = HDate.daysInMonth(month, targetYear);
  const day = Math.min(birthday.hebrew_day, maxDay);

  return { month, day, age: targetYear - birthday.hebrew_year };
}

// Build a quick lookup of Gregorian-date-string → birthdays occurring on that date,
// for a contiguous Gregorian range. Used by the calendar to overlay birthday badges.
export function birthdaysForDateRange(
  birthdays: Birthday[],
  start: Date,
  end: Date
): Map<string, { name: string; age: number }[]> {
  const map = new Map<string, { name: string; age: number }[]>();
  const cursor = new Date(start);

  while (cursor <= end) {
    const hd = new HDate(cursor);
    const targetYear = hd.getFullYear();

    for (const b of birthdays) {
      const occ = birthdayInYear(b, targetYear);
      if (occ.month === hd.getMonth() && occ.day === hd.getDate()) {
        const key = cursor.toISOString().split("T")[0];
        const arr = map.get(key) ?? [];
        arr.push({ name: b.name, age: occ.age });
        map.set(key, arr);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return map;
}

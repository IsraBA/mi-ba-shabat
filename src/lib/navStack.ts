import { HDate } from "@hebcal/core";
import { getCurrentHebrewDate } from "@/lib/hebcal";

// On a deep link (no in-app history below us), inject the missing parent levels into
// the back stack so pressing back walks the app's hierarchy instead of exiting.
//
// Hierarchy:
//   level 1 — /calendar                        (current Hebrew month)
//   level 2 — /calendar?date=YYYY-MM-DD        (other Hebrew month)
//   level 3 — /event/YYYY-MM-DD                (specific event)
//
// Level 2 only exists when the date is NOT in the current Hebrew month — events in
// the current month skip from level 3 directly to level 1 in one back press.
// Marks this tab as "we've already initialized the back stack" so we don't try to
// inject again on subsequent in-app navigations. Per-tab via sessionStorage; absent
// the key on mount means this is the tab's first page load (i.e. a deep link).
const VISITED_KEY = "nav_stack_visited";

// Returns true if entries were injected — caller should then attach a popstate
// handler to nudge Next.js's router into rendering the popped URL (its internal
// router state doesn't track entries we created via raw history.pushState).
export function ensureNavStack(): boolean {
  if (typeof window === "undefined") return false;
  // Run only on the first page load of this tab. window.history.length isn't a
  // reliable signal because the browser may keep an entry above ours (the
  // new-tab page) — sessionStorage is per-tab and unaffected by that.
  if (sessionStorage.getItem(VISITED_KEY)) return false;
  sessionStorage.setItem(VISITED_KEY, "1");

  const path = window.location.pathname;
  const search = window.location.search;
  const fullHere = path + search;

  // Determine which kind of deep link this is and pull the date out
  const eventMatch = path.match(/^\/event\/(\d{4}-\d{2}-\d{2})$/);
  const params = new URLSearchParams(search);
  const calendarDate = path === "/calendar" ? params.get("date") : null;

  let dateStr: string | null = null;
  let isEvent = false;

  if (eventMatch) {
    dateStr = eventMatch[1];
    isEvent = true;
  } else if (calendarDate) {
    dateStr = calendarDate;
  } else {
    // /calendar (no date) or any other path: nothing to inject
    return false;
  }

  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return false;

  const hd = new HDate(d);
  const cur = getCurrentHebrewDate();
  const sameMonth =
    hd.getFullYear() === cur.year && hd.getMonth() === cur.month;

  // Replace current entry with level 1 (current-month calendar)
  window.history.replaceState(null, "", "/calendar");

  // If the date isn't in the current month, push level 2 above level 1
  if (!sameMonth) {
    window.history.pushState(null, "", `/calendar?date=${dateStr}`);
  }

  // For event deep links, push level 3 (the original URL) on top
  if (isEvent) {
    window.history.pushState(null, "", fullHere);
  }
  // For /calendar?date=current-month deep links: we've already replaced to /calendar,
  // so the URL bar now correctly reflects level 1.
  return true;
}

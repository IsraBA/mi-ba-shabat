import { HebrewCalendar } from "@/components/calendar/HebrewCalendar";

// Calendar page - fills available viewport with Hebrew calendar
export default function CalendarPage() {
  return (
    <div className="h-full">
      <HebrewCalendar />
    </div>
  );
}

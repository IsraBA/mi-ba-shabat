"use client";

import { use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventHeader } from "@/components/event/EventHeader";
import { AttendanceTab } from "@/components/event/AttendanceTab";
import { TasksTab } from "@/components/event/TasksTab";
import { RoomsTab } from "@/components/event/RoomsTab";
import { getEventsForMonth, CalendarEvent } from "@/lib/hebcal";
import { FaUsers, FaTasks, FaDoorOpen } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { FaArrowRight } from "react-icons/fa";

interface EventPageProps {
  params: Promise<{ date: string }>;
}

// Event detail page with 3 tabs: attendance, tasks, rooms
export default function EventPage({ params }: EventPageProps) {
  const { date } = use(params);
  const router = useRouter();

  // Look up the calendar event info for this date
  const event = useMemo((): CalendarEvent | null => {
    const d = new Date(date);
    const events = getEventsForMonth(d.getFullYear(), d.getMonth());
    return events.find((e) => e.dateString === date) ?? null;
  }, [date]);

  // Fallback event if not found in hebcal (e.g., manually created holiday)
  const displayEvent: CalendarEvent = event ?? {
    date: new Date(date),
    dateString: date,
    type: "shabbat",
    title: "שבת",
    hebrewDate: "",
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      {/* Back button */}
      <div className="px-4 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1"
        >
          <FaArrowRight className="w-3 h-3" />
          חזרה ללוח
        </Button>
      </div>

      {/* Event header with title and dates */}
      <EventHeader event={displayEvent} />

      {/* Three tabs: attendance, tasks, rooms */}
      <Tabs defaultValue="attendance" dir="rtl" className="px-2">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="attendance" className="gap-1 text-sm">
            <FaUsers className="w-4 h-4" />
            מי מגיע
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-1 text-sm">
            <FaTasks className="w-4 h-4" />
            משימות
          </TabsTrigger>
          <TabsTrigger value="rooms" className="gap-1 text-sm">
            <FaDoorOpen className="w-4 h-4" />
            חדרים
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance">
          <AttendanceTab
            eventDate={date}
            eventType={displayEvent.type}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <TasksTab eventDate={date} />
        </TabsContent>

        <TabsContent value="rooms">
          <RoomsTab eventDate={date} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

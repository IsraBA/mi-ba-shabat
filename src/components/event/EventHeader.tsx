"use client";

import { CalendarEvent } from "@/lib/hebcal";
import { Badge } from "@/components/ui/badge";
import { TbCandleFilled } from "react-icons/tb";
import { BsMoonStarsFill } from "react-icons/bs";

interface EventHeaderProps {
  event: CalendarEvent;
}

// Header section for an event page showing title, date, and type badge
export function EventHeader({ event }: EventHeaderProps) {
  // Format the Gregorian date for display
  const gregDate = new Date(event.dateString).toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="text-center py-4 px-4">
      {/* Event type badge */}
      <Badge
        variant="secondary"
        className={
          event.type === "shabbat"
            ? "bg-violet-100 text-violet-700 dark:bg-violet-500/30 dark:text-violet-200"
            : "bg-amber-100 text-amber-700 dark:bg-amber-500/30 dark:text-amber-200"
        }
      >
        {event.type === "shabbat" ? "שבת" : "חג"}
      </Badge>

      {/* Event title (parsha name or holiday name) */}
      <h1 className="text-2xl font-bold mt-2">{event.title}</h1>

      {/* Hebrew date */}
      <p className="text-muted-foreground mt-1">{event.hebrewDate}</p>

      {/* Gregorian date */}
      <p className="text-sm text-muted-foreground">{gregDate}</p>

      {/* Candle-lighting (entry) and havdalah (exit) times */}
      {(event.candleLighting || event.havdalah) && (
        <div className="mt-3 flex items-center justify-center gap-5 text-sm">
          {event.candleLighting && (
            <span className="flex items-center gap-1">
              <span className="flex text-violet-500 mb-0.5">
                <TbCandleFilled className="w-3.5 h-3.5" />
                <TbCandleFilled className="w-3.5 h-3.5 -ms-2" />
              </span>
              <span className="text-muted-foreground">
                {event.type === "shabbat" ? "כניסת שבת" : "כניסת החג"}
              </span>
              <span className="font-medium ms-0.5">{event.candleLighting}</span>
            </span>
          )}
          {event.havdalah && (
            <span className="flex items-center gap-1">
              <BsMoonStarsFill className="w-3.5 h-3.5 text-violet-500 mb-0.5" />
              <span className="text-muted-foreground">
                {event.type === "shabbat" ? "יציאת שבת" : "יציאת החג"}
              </span>
              <span className="font-medium ms-0.5">{event.havdalah}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

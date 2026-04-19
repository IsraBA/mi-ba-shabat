import { Gender } from "@/types";
import { gendered } from "./gender";

// Notification payload structure
export interface NotificationPayload {
  title: string;
  body?: string;
  url?: string;
}

// Determine event label based on type
function eventLabel(eventType: "shabbat" | "holiday", prefix: "ב" | "ל" | "ה"): string {
  if (prefix === "ב") return eventType === "shabbat" ? "בשבת" : "בחג";
  if (prefix === "ל") return eventType === "shabbat" ? "לשבת" : "לחג";
  return eventType === "shabbat" ? "השבת" : "החג";
}

// 1. Registration reminder (Tuesday 19:00)
export function registrationReminder(gender: Gender, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ב");
  return {
    title: gendered(gender, `האם אתה מגיע ${ev}?`, `האם את מגיעה ${ev}?`, `האם אתם מגיעים ${ev}?`),
    body: gendered(gender, `עדיין לא סימנת אם אתה מגיע`, `עדיין לא סימנת אם את מגיעה`, `עדיין לא סימנתם אם אתם מגיעים`),
  };
}

// 2. Second registration reminder (Thursday 19:00)
export function registrationReminderUrgent(gender: Gender, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ב");
  return {
    title: gendered(gender, `עדיין לא סימנת אם אתה מגיע ${ev}!`, `עדיין לא סימנת אם את מגיעה ${ev}!`, `עדיין לא סימנתם אם אתם מגיעים ${ev}!`),
    body: "יאללה, כולם מחכים לדעת",
  };
}

// 3. Room assignment notification (immediate)
export function roomAssigned(gender: Gender, roomName: string, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ה");
  return {
    title: gendered(gender, `ברכות, אתה בחדר של ${roomName} ${ev}!`, `ברכות, את בחדר של ${roomName} ${ev}!`, `ברכות, אתם בחדר של ${roomName} ${ev}!`),
    body: gendered(gender, "ככה אמא שיבצה אותך, לא להתווכח", "ככה אמא שיבצה אותך, לא להתווכח", "ככה אמא שיבצה אותכם, לא להתווכח"),
  };
}

// 4. Someone registered (immediate, sent to everyone)
export function memberRegistered(memberName: string, memberGender: Gender, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ב");
  return {
    title: gendered(memberGender, `${memberName} מגיע ${ev}!`, `${memberName} מגיעה ${ev}!`, `${memberName} מגיעים ${ev}!`),
  };
}

// 5. Someone cancelled (immediate, sent to everyone)
export function memberCancelled(memberName: string, memberGender: Gender, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ל");
  return {
    title: gendered(memberGender, `לדאבון ליבנו ${memberName} ביטל הגעה ${ev}`, `לדאבון ליבנו ${memberName} ביטלה הגעה ${ev}`, `לדאבון ליבנו ${memberName} ביטלו הגעה ${ev}`),
  };
}

// 6. Friday summary (Friday 10:00, only to attendees)
export function fridaySummary(unclaimedCount: number): NotificationPayload {
  return {
    title: `יש עוד ${unclaimedCount} משימות שלא נלקחו`,
    body: "יאללה להתחיל לעבוד בקשה",
  };
}

// 7. Task king - always "הריעו לשיראל" (Sunday 10:00)
export function taskKing(topMemberName: string, topMemberGender: Gender, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ה");
  return {
    title: "הריעו לשיראל השבוע 👏",
    body: gendered(topMemberGender, `${topMemberName} הוא זה שלקח הכי הרבה משימות ${ev}`, `${topMemberName} היא זאת שלקחה הכי הרבה משימות ${ev}`, `${topMemberName} הם אלה שלקחו הכי הרבה משימות ${ev}`),
  };
}

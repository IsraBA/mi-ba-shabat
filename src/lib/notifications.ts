import { Gender } from "@/types";
import { gendered } from "./gender";

// Notification payload structure
export interface NotificationPayload {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
}

const APP_TITLE = "מי בא שבת";

// Determine event label based on type
function eventLabel(eventType: "shabbat" | "holiday", prefix: "ב" | "ל" | "ה"): string {
  if (prefix === "ב") return eventType === "shabbat" ? "בשבת" : "בחג";
  if (prefix === "ל") return eventType === "shabbat" ? "לשבת" : "לחג";
  return eventType === "shabbat" ? "השבת" : "החג";
}

// 1. Registration reminder (Tuesday 19:00)
export function registrationReminder(gender: Gender, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ב");
  const question = gendered(gender, `האם אתה מגיע ${ev}?`, `האם את מגיעה ${ev}?`, `האם אתם מגיעים ${ev}?`);
  const detail = gendered(gender, "עדיין לא סימנת אם אתה מגיע", "עדיין לא סימנת אם את מגיעה", "עדיין לא סימנתם אם אתם מגיעים");
  return {
    title: APP_TITLE,
    body: `${question} ${detail}`,
  };
}

// 2. Second registration reminder (Thursday 19:00)
export function registrationReminderUrgent(gender: Gender, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ב");
  const reminder = gendered(gender, `עדיין לא סימנת אם אתה מגיע ${ev}!`, `עדיין לא סימנת אם את מגיעה ${ev}!`, `עדיין לא סימנתם אם אתם מגיעים ${ev}!`);
  return {
    title: APP_TITLE,
    body: `${reminder} יאללה, כולם מחכים לדעת`,
  };
}

// 3. Room assignment notification (immediate)
export function roomAssigned(gender: Gender, roomName: string, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ה");
  const msg = gendered(
    gender,
    `ברכות, ה${roomName} הוא החדר שלך ${ev}!`,
    `ברכות, ה${roomName} הוא החדר שלך ${ev}!`,
    `ברכות, ה${roomName} הוא החדר שלכם ${ev}!`
  );
  const detail = gendered(gender, "ככה אמא שיבצה אותך, לא להתווכח", "ככה אמא שיבצה אותך, לא להתווכח", "ככה אמא שיבצה אותכם, לא להתווכח");
  return {
    title: APP_TITLE,
    body: `${msg} ${detail}`,
  };
}

// 4. Someone registered (immediate, sent to everyone)
export function memberRegistered(memberName: string, memberGender: Gender, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ב");
  return {
    title: APP_TITLE,
    body: gendered(memberGender, `${memberName} מגיע ${ev}!`, `${memberName} מגיעה ${ev}!`, `${memberName} מגיעים ${ev}!`),
  };
}

// 5. Someone cancelled (immediate, sent to everyone)
export function memberCancelled(memberName: string, memberGender: Gender, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ל");
  return {
    title: APP_TITLE,
    body: gendered(memberGender, `לדאבון ליבנו ${memberName} ביטל הגעה ${ev}`, `לדאבון ליבנו ${memberName} ביטלה הגעה ${ev}`, `לדאבון ליבנו ${memberName} ביטלו הגעה ${ev}`),
  };
}

// 6. Friday summary (Friday 10:00, only to attendees)
export function fridaySummary(unclaimedCount: number): NotificationPayload {
  return {
    title: APP_TITLE,
    body: `יש עוד ${unclaimedCount} משימות שלא נלקחו, יאללה להתחיל לעבוד בקשה`,
  };
}

// 7. Task king - always "הריעו לשיראל" (Sunday 10:00)
export function taskKing(topMemberName: string, topMemberGender: Gender, eventType: "shabbat" | "holiday"): NotificationPayload {
  const ev = eventLabel(eventType, "ה");
  const detail = gendered(topMemberGender, `${topMemberName} הוא זה שלקח הכי הרבה משימות ${ev}`, `${topMemberName} היא זאת שלקחה הכי הרבה משימות ${ev}`, `${topMemberName} הם אלה שלקחו הכי הרבה משימות ${ev}`);
  return {
    title: APP_TITLE,
    body: `הריעו לשיראל השבוע 👏 ${detail}`,
  };
}

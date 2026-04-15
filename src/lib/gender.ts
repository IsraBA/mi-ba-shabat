import { Gender } from "@/types";

// Gendered text helper — returns the correct Hebrew form based on gender
export function gendered(
  gender: Gender,
  male: string,
  female: string,
  plural: string
): string {
  switch (gender) {
    case "male":
      return male;
    case "female":
      return female;
    case "plural":
      return plural;
  }
}

// Common gendered phrases used across the app
export function comingLabel(gender: Gender, eventType: "shabbat" | "holiday"): string {
  const target = eventType === "shabbat" ? "בשבת" : "לחג";
  return gendered(
    gender,
    `אני מגיע ${target}!`,
    `אני מגיעה ${target}!`,
    `אנחנו מגיעים ${target}!`
  );
}

export function notComingLabel(gender: Gender, eventType: "shabbat" | "holiday"): string {
  const target = eventType === "shabbat" ? "בשבת" : "לחג";
  return gendered(
    gender,
    `אני לא מגיע ${target}`,
    `אני לא מגיעה ${target}`,
    `אנחנו לא מגיעים ${target}`
  );
}

export function attendingBadge(gender: Gender): string {
  return gendered(gender, "מגיע", "מגיעה", "מגיעים");
}

export function notAttendingBadge(gender: Gender): string {
  return gendered(gender, "לא מגיע", "לא מגיעה", "לא מגיעים");
}

export function claimedLabel(gender: Gender): string {
  return gendered(gender, "אני לוקח", "אני לוקחת", "אנחנו לוקחים");
}

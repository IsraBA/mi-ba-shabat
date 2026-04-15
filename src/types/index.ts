// Gender type for Hebrew UI conjugation
export type Gender = "male" | "female" | "plural";

// Member in the family
export interface Member {
  id: string;
  name: string;
  is_admin: boolean;
  always_attending: boolean;
  gender: Gender;
  display_order: number;
  created_at: string;
}

// Guest attending a specific event
export interface EventGuest {
  id: string;
  event_date: string;
  name: string;
  added_by: string | null;
  created_at: string;
}

// Event types: Shabbat or Jewish holiday
export type EventType = "shabbat" | "holiday";

// A Shabbat or holiday event
export interface FamilyEvent {
  id: string;
  date: string;
  type: EventType;
  title: string;
  hebrew_date: string | null;
  created_at: string;
}

// Registration of a member for an event
export interface EventRegistration {
  id: string;
  member_id: string;
  event_date: string;
  created_at: string;
}

// Room in the parents' house
export interface Room {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
}

// Room assignment for a specific event
export interface RoomAssignment {
  id: string;
  event_date: string;
  room_id: string;
  member_id: string;
  assigned_by: string | null;
  created_at: string;
}

// Task category
export type TaskCategory = "preparation" | "shabbat" | "motzash";

// Template for recurring tasks
export interface TaskTemplate {
  id: string;
  name: string;
  category: TaskCategory;
  icon: string | null;
  color: string | null;
  is_recurring: boolean;
  display_order: number;
  created_at: string;
}

// Task instance for a specific event
export interface EventTask {
  id: string;
  event_date: string;
  template_id: string | null;
  name: string;
  category: TaskCategory;
  icon: string | null;
  color: string | null;
  claimed_by: string | null;
  is_done: boolean;
  created_at: string;
}

// Push notification subscription
export interface PushSubscription {
  id: string;
  member_id: string;
  subscription: object;
  created_at: string;
}

// Category display configuration
export interface CategoryConfig {
  key: TaskCategory;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

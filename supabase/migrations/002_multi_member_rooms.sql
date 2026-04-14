-- Allow multiple members per room (e.g., a couple in one room)
-- But each member can only be in ONE room per event

-- Drop old constraint: one member per room per event
ALTER TABLE room_assignments DROP CONSTRAINT IF EXISTS room_assignments_event_date_room_id_key;

-- Add new constraint: each member can only be in one room per event
ALTER TABLE room_assignments ADD CONSTRAINT room_assignments_event_date_member_id_key UNIQUE (event_date, member_id);

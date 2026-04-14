-- Add always_attending flag for members who are registered by default (parents)
ALTER TABLE members ADD COLUMN always_attending BOOLEAN DEFAULT FALSE;

-- Set אבא and אמא as always attending
UPDATE members SET always_attending = TRUE WHERE name IN ('אבא', 'אמא');

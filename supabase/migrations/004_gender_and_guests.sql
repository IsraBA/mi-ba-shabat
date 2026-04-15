-- Add gender field to members (male/female/plural for couples)
ALTER TABLE members ADD COLUMN gender TEXT NOT NULL DEFAULT 'male' CHECK (gender IN ('male', 'female', 'plural'));

-- Set gender for each member
UPDATE members SET gender = 'male' WHERE name = 'אבא';
UPDATE members SET gender = 'female' WHERE name = 'אמא';
UPDATE members SET gender = 'plural' WHERE name = 'שיראל ואלעד';
UPDATE members SET gender = 'plural' WHERE name = 'רני ומרדכי';
UPDATE members SET gender = 'plural' WHERE name = 'אריאל ואודליה';
UPDATE members SET gender = 'male' WHERE name = 'ישראל';
UPDATE members SET gender = 'plural' WHERE name = 'נעמה ואלרואי';
UPDATE members SET gender = 'plural' WHERE name = 'מוריה ושבי';
UPDATE members SET gender = 'female' WHERE name = 'אילה';
UPDATE members SET gender = 'male' WHERE name = 'צביקי';
UPDATE members SET gender = 'female' WHERE name = 'אורהלי';

-- Fix member names
UPDATE members SET name = 'נעמה ואלרואי' WHERE name = 'נעמה ואלרועי';
UPDATE members SET name = 'אורהלי' WHERE name = 'אורה לי';

-- Fix room names to match
UPDATE rooms SET name = 'החדר של אורהלי' WHERE name = 'החדר של אורה לי';

-- Guests table for event attendance
CREATE TABLE event_guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE NOT NULL,
  name TEXT NOT NULL,
  added_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_guests_date ON event_guests(event_date);
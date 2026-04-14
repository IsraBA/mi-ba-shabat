-- Family members table
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_admin BOOLEAN DEFAULT FALSE,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shabbat and holiday events
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('shabbat', 'holiday')),
  title TEXT NOT NULL,
  hebrew_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Event registrations (who's coming)
CREATE TABLE event_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  event_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(member_id, event_date)
);

-- Rooms in the parents' house
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Room assignments per event (admin-only editing)
CREATE TABLE room_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_date, member_id)
);

-- Task templates (recurring tasks)
CREATE TABLE task_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('preparation', 'shabbat', 'motzash')),
  icon TEXT,
  color TEXT,
  is_recurring BOOLEAN DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Task instances for specific events
CREATE TABLE event_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date DATE NOT NULL,
  template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('preparation', 'shabbat', 'motzash')),
  icon TEXT,
  color TEXT,
  claimed_by UUID REFERENCES members(id) ON DELETE SET NULL,
  is_done BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Push notification subscriptions
CREATE TABLE push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_registrations_date ON event_registrations(event_date);
CREATE INDEX idx_tasks_date ON event_tasks(event_date);
CREATE INDEX idx_room_assignments_date ON room_assignments(event_date);

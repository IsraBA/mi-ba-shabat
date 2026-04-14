@AGENTS.md

# מי בא שבת — Family Shabbat Coordination App

## Project Overview
A family web app for coordinating Shabbat and Jewish holiday gatherings at the parents' house. 11 users (9 siblings + parents), Hebrew calendar, event registration, room assignment, and task distribution. Deployed on Vercel, no authentication — simple member selection via dropdown.

## Stack
- **Framework**: Next.js (App Router) with TypeScript
- **Backend/DB**: Supabase (PostgreSQL, Realtime, Storage)
- **Styling**: Tailwind CSS + shadcn/ui
- **Hebrew Calendar**: @hebcal/core
- **Icons**: react-icons (NOT emoji in code)
- **Deployment**: Vercel

## Code Conventions

### Language
- **All code in English** — variable names, function names, file names, and comments must be in English
- **Short comment before every code block** — a brief English description of what the block does
- **Only UI-facing text in Hebrew** — strings displayed to the user on screen

### Responsive Design
- **Mobile-first** approach — design for mobile, then enhance for desktop
- All layouts must work well on both mobile and desktop screens
- Avoid fixed `max-w-*` that makes desktop look cramped — use responsive widths
- Calendar and main content should fill available space

### RTL
- The app is fully RTL (`dir="rtl"`, `lang="he"`)
- Use Tailwind logical properties where available (`ps-4` instead of `pl-4`, `ms-2` instead of `ml-2`)
- shadcn/ui components respect RTL via Radix primitives
- Navigation arrows must be RTL-aware (right = forward, left = backward)

### Icons
- Use `react-icons` library for all icons in the app
- Task icons are stored as react-icons identifiers (e.g., "FaBroom", "MdShoppingCart")
- Never use emoji in code as icon replacements

### Supabase
- Use `@supabase/ssr` for client creation (browser + server)
- Client-side: `src/lib/supabase/client.ts` → `createBrowserClient`
- Server-side: `src/lib/supabase/server.ts` → `createServerClient`
- No RLS policies — this is a trusted family app with ~11 users
- Admin checks (for room assignments) happen in API routes, not at DB level
- Realtime enabled on: `event_registrations`, `room_assignments`, `event_tasks`

### Member Identity
- No authentication system. Users select their identity from a dropdown
- Selection stored in `localStorage` (key: `member_id`)
- `useMember` hook provides current member context
- Admin members: אמא, ישראל

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (RTL, Hebrew font, providers)
│   ├── page.tsx            # Home page
│   ├── calendar/           # Hebrew calendar view
│   ├── event/[date]/       # Event detail with 3 tabs
│   ├── api/                # API routes
│   └── settings/           # Admin settings
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Header, BottomNav, MemberSelector
│   ├── calendar/           # HebrewCalendar, ShabbatCard, RegistrationButton
│   ├── event/              # AttendanceTab, TasksTab, RoomsTab
│   ├── tasks/              # TaskBoard, TaskCard, AddTaskDialog
│   └── rooms/              # RoomList, RoomAssignDialog
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configurations
│   ├── supabase/           # Supabase client setup
│   ├── hebcal.ts           # Hebrew calendar wrapper
│   └── constants.ts        # Category configs, colors, etc.
└── types/                  # TypeScript type definitions
```

## Database Tables
- `members` — family members (11 fixed entries)
- `events` — Shabbat and holiday events
- `event_registrations` — who's coming to which event
- `rooms` — 8 rooms in parents' house
- `room_assignments` — room allocation per event (admin-only edit)
- `task_templates` — recurring task definitions
- `event_tasks` — task instances per event
- `push_subscriptions` — Web Push notification subscriptions

## Task Categories
- `preparation` — הכנות (includes Friday / erev chag prep)
- `shabbat` — שבת עצמה / the holiday itself
- `motzash` — מוצ"ש / post-holiday

## Commands
```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Environment Variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

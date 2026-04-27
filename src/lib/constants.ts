import { CategoryConfig } from "@/types";

// Task category display configuration
export const TASK_CATEGORIES: CategoryConfig[] = [
  {
    key: "preparation",
    label: "הכנות",
    color: "text-indigo-700 dark:text-indigo-300",
    bgColor: "bg-indigo-50 dark:bg-indigo-500/20",
    borderColor: "border-indigo-400 dark:border-indigo-500/50",
  },
  {
    key: "shabbat",
    label: "שבת",
    color: "text-amber-700 dark:text-amber-300",
    bgColor: "bg-amber-50 dark:bg-amber-500/20",
    borderColor: "border-amber-400 dark:border-amber-500/50",
  },
  {
    key: "motzash",
    label: "מוצ\"ש",
    color: "text-slate-700 dark:text-slate-300",
    bgColor: "bg-slate-50 dark:bg-slate-500/20",
    borderColor: "border-slate-400 dark:border-slate-500/50",
  },
];

// Map category key to its config
export function getCategoryConfig(key: string): CategoryConfig {
  return (
    TASK_CATEGORIES.find((c) => c.key === key) ?? TASK_CATEGORIES[0]
  );
}

// Available task colors for the color picker (bg + matching border)
export const TASK_COLORS: { bg: string; border: string }[] = [
  { bg: "bg-red-100", border: "border-red-400" },
  { bg: "bg-orange-100", border: "border-orange-400" },
  { bg: "bg-amber-100", border: "border-amber-400" },
  { bg: "bg-yellow-100", border: "border-yellow-400" },
  { bg: "bg-lime-100", border: "border-lime-400" },
  { bg: "bg-green-100", border: "border-green-400" },
  { bg: "bg-emerald-100", border: "border-emerald-400" },
  { bg: "bg-teal-100", border: "border-teal-400" },
  { bg: "bg-cyan-100", border: "border-cyan-400" },
  { bg: "bg-sky-100", border: "border-sky-400" },
  { bg: "bg-blue-100", border: "border-blue-400" },
  { bg: "bg-indigo-100", border: "border-indigo-400" },
  { bg: "bg-violet-100", border: "border-violet-400" },
  { bg: "bg-purple-100", border: "border-purple-400" },
  { bg: "bg-fuchsia-100", border: "border-fuchsia-400" },
  { bg: "bg-pink-100", border: "border-pink-400" },
  { bg: "bg-rose-100", border: "border-rose-400" },
];

// Map a single bg-X-NNN / border-X-NNN class to a saturated mid-tone variant for dark mode.
// Used at render time so the DB only stores the simple class (e.g. "bg-blue-100").
// In dark mode we use the X-500 shade with moderate opacity for noticeable saturation.
export function withDarkVariant(cls?: string | null): string {
  if (!cls) return "";
  return cls
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((c) => {
      const m = c.match(/^(bg|border)-([a-z]+)-\d+$/);
      if (!m) return [c];
      const [, prop, color] = m;
      const opacity = prop === "bg" ? 25 : 50;
      return [c, `dark:${prop}-${color}-500/${opacity}`];
    })
    .join(" ");
}

// Tailwind safelist for runtime-built dark variants (scanner picks up these literal strings).
// withDarkVariant builds these at runtime, so they must appear statically somewhere.
const _DARK_SAFELIST = `
  dark:bg-red-500/25 dark:bg-orange-500/25 dark:bg-amber-500/25 dark:bg-yellow-500/25
  dark:bg-lime-500/25 dark:bg-green-500/25 dark:bg-emerald-500/25 dark:bg-teal-500/25
  dark:bg-cyan-500/25 dark:bg-sky-500/25 dark:bg-blue-500/25 dark:bg-indigo-500/25
  dark:bg-violet-500/25 dark:bg-purple-500/25 dark:bg-fuchsia-500/25 dark:bg-pink-500/25
  dark:bg-rose-500/25 dark:bg-slate-500/25 dark:bg-gray-500/25 dark:bg-zinc-500/25
  dark:bg-neutral-500/25 dark:bg-stone-500/25
  dark:border-red-500/50 dark:border-orange-500/50 dark:border-amber-500/50 dark:border-yellow-500/50
  dark:border-lime-500/50 dark:border-green-500/50 dark:border-emerald-500/50 dark:border-teal-500/50
  dark:border-cyan-500/50 dark:border-sky-500/50 dark:border-blue-500/50 dark:border-indigo-500/50
  dark:border-violet-500/50 dark:border-purple-500/50 dark:border-fuchsia-500/50 dark:border-pink-500/50
  dark:border-rose-500/50 dark:border-slate-500/50 dark:border-gray-500/50 dark:border-zinc-500/50
  dark:border-neutral-500/50 dark:border-stone-500/50
`;
void _DARK_SAFELIST;

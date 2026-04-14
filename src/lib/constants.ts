import { CategoryConfig } from "@/types";

// Task category display configuration
export const TASK_CATEGORIES: CategoryConfig[] = [
  {
    key: "preparation",
    label: "הכנות",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-400",
  },
  {
    key: "shabbat",
    label: "שבת",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
  },
  {
    key: "motzash",
    label: "מוצ\"ש",
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-400",
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

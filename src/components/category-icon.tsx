import {
  UtensilsCrossed,
  Scissors,
  Stethoscope,
  Smartphone,
  Shirt,
  Car,
  Dumbbell,
  GraduationCap,
  Wrench,
  Store,
  HeartPulse,
  Home,
  Camera,
  type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  "utensils": UtensilsCrossed,
  "scissors": Scissors,
  "stethoscope": Stethoscope,
  "smartphone": Smartphone,
  "shirt": Shirt,
  "car": Car,
  "dumbbell": Dumbbell,
  "graduation": GraduationCap,
  "wrench": Wrench,
  "store": Store,
  "health": HeartPulse,
  "home": Home,
  "camera": Camera,
};

export const CATEGORY_COLORS: Record<string, string> = {
  primary: "from-primary-500 to-primary-700",
  emerald: "from-emerald-500 to-emerald-700",
  sky: "from-sky-500 to-sky-700",
  violet: "from-violet-500 to-violet-700",
  rose: "from-rose-500 to-rose-700",
  amber: "from-amber-500 to-amber-600",
  indigo: "from-indigo-500 to-indigo-700",
  teal: "from-teal-500 to-teal-700",
};

export function CategoryIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] ?? Store;
  return <Icon className={className} aria-hidden />;
}

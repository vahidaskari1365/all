import {
  BadgeCheck,
  Handshake,
  ShieldCheck,
  Images,
  Info,
  type LucideIcon,
} from "lucide-react";

export type ClaimKey = "license" | "union" | "guarantee" | "showcase" | "verified";

type ClaimDef = {
  key: ClaimKey;
  label: string;
  icon: LucideIcon;
  className: string;
  /** بر اساس اظهار کسب‌وکار است؟ */
  selfClaimed: boolean;
  solid?: boolean;
};

export const CLAIMS: ClaimDef[] = [
  {
    key: "verified",
    label: "تأیید پلتفرم",
    icon: BadgeCheck,
    className: "bg-primary text-white shadow-sm shadow-primary-600/30",
    selfClaimed: false,
    solid: true,
  },
  {
    key: "license",
    label: "دارای جواز",
    icon: BadgeCheck,
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    selfClaimed: true,
  },
  {
    key: "union",
    label: "عضو اتحادیه",
    icon: Handshake,
    className: "bg-sky-50 text-sky-700 ring-sky-200",
    selfClaimed: true,
  },
  {
    key: "guarantee",
    label: "دارای ضمانت",
    icon: ShieldCheck,
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    selfClaimed: true,
  },
  {
    key: "showcase",
    label: "ویترین حرفه‌ای",
    icon: Images,
    className: "bg-violet-50 text-violet-700 ring-violet-200",
    selfClaimed: true,
  },
];

export function StatusBadge({
  claimKey,
  size = "md",
}: {
  claimKey: ClaimKey;
  size?: "sm" | "md";
}) {
  const def = CLAIMS.find((c) => c.key === claimKey);
  if (!def) return null;
  const Icon = def.icon;
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
  const ring = def.solid ? "" : "ring-1 ring-inset";
  return (
    <span
      title={
        def.selfClaimed
          ? "این وضعیت بر اساس اظهار خود کسب‌وکار ثبت شده است."
          : "احراز شده توسط تیم کسب‌یاب."
      }
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${ring} ${def.className} ${pad}`}
    >
      <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {def.label}
      {def.selfClaimed && (
        <Info
          className={size === "sm" ? "h-2.5 w-2.5 opacity-60" : "h-3 w-3 opacity-60"}
          aria-hidden
        />
      )}
    </span>
  );
}

/** خوشه‌ای از نشان‌های فعال یک کسب‌وکار */
export function ClaimBadges({
  claims,
  size = "md",
}: {
  claims: Partial<Record<ClaimKey, boolean>>;
  size?: "sm" | "md";
}) {
  const active = CLAIMS.filter((c) => claims[c.key]);
  if (active.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {active.map((c) => (
        <StatusBadge key={c.key} claimKey={c.key} size={size} />
      ))}
    </div>
  );
}

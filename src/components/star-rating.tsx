import { Star } from "lucide-react";
import { toFa } from "@/lib/utils";

export function StarRating({
  rating,
  count,
  size = "sm",
}: {
  rating: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const dim = size === "md" ? "h-5 w-5" : "h-4 w-4";
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center gap-0.5" aria-label={`امتیاز ${toFa(rating)} از ۵`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`${dim} ${
              i <= rounded
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }`}
            aria-hidden
          />
        ))}
      </span>
      <span className="text-xs font-bold text-ink">{toFa(rating.toFixed(1))}</span>
      {count !== undefined && count > 0 && (
        <span className="text-xs text-slate-400">({toFa(count)})</span>
      )}
    </span>
  );
}

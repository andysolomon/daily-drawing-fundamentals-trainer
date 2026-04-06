import { cn } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  score: number; // 1-10
}

export function ScoreBar({ label, score }: ScoreBarProps) {
  const clamped = Math.max(1, Math.min(10, score));
  const pct = (clamped / 10) * 100;

  const colorClass =
    clamped >= 7
      ? "bg-green-500"
      : clamped >= 4
        ? "bg-amber-500"
        : "bg-red-500";

  const labelColor =
    clamped >= 7
      ? "text-green-600"
      : clamped >= 4
        ? "text-amber-600"
        : "text-red-600";

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium capitalize">{label}</span>
        <span className={cn("text-sm font-semibold tabular-nums", labelColor)}>
          {clamped.toFixed(1)} / 10
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-500", colorClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

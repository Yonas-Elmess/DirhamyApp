import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  color?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  gradient?: boolean;
}

export default function ProgressBar({
  value,
  color = "#3b82f6",
  size = "md",
  showLabel = true,
  gradient = true,
}: ProgressBarProps) {
  const heights = { sm: "h-1.5", md: "h-2.5", lg: "h-3.5" };
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className="w-full">
      <div className={cn("w-full bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden", heights[size])}>
        <div
          className={cn("h-full rounded-full transition-all duration-700 ease-out")}
          style={{
            width: `${clampedValue}%`,
            background: gradient
              ? `linear-gradient(90deg, ${color}, ${color}dd)`
              : color,
          }}
        />
      </div>
      {showLabel && (
        <p className="text-[11px] font-semibold text-gray-400 mt-1.5 text-right">{clampedValue}%</p>
      )}
    </div>
  );
}

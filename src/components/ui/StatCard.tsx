import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  subtitle?: string;
  gradient?: string;
  className?: string;
}

const gradients = {
  up: "from-emerald-500 to-teal-600",
  down: "from-red-500 to-rose-600",
  neutral: "from-blue-500 to-indigo-600",
};

export default function StatCard({ title, value, icon, trend, subtitle, gradient, className }: StatCardProps) {
  const bg = gradient || (trend ? gradients[trend] : gradients.neutral);

  return (
    <div className={cn("stat-card group relative overflow-hidden", className)}>
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-[13px] text-gray-500 dark:text-gray-400 font-medium">{title}</p>
          <p className={cn(
            "text-2xl font-extrabold mt-1.5 tracking-tight",
            trend === "up" && "text-emerald-600 dark:text-emerald-400",
            trend === "down" && "text-red-500 dark:text-red-400",
            !trend && "text-gray-900 dark:text-white"
          )}>
            {value}
          </p>
          {subtitle && <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={cn(
          "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center text-white shadow-lg",
          bg
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}

"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/hooks/useTheme";

interface BarChartProps {
  data: { mois: string; revenus: number; depenses: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-100 dark:border-gray-700/40 shadow-xl shadow-gray-200/50 dark:shadow-none p-3 text-sm">
        <p className="font-semibold text-gray-900 dark:text-white mb-1.5">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="flex items-center gap-2" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            {entry.name}: <span className="font-bold">{entry.value.toLocaleString("fr-FR")} MAD</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function BarChart({ data }: BarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RechartsBarChart data={data} margin={{ top: 0, right: 0, left: -10, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
        <XAxis
          dataKey="mois"
          tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: isDark ? '#64748b' : '#94a3b8', fontWeight: 500 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? '#1e293b' : '#f8fafc' }} />
        <Bar dataKey="revenus" name="Revenus" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
        <Bar dataKey="depenses" name="Dépenses" fill="#f87171" radius={[6, 6, 0, 0]} maxBarSize={32} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

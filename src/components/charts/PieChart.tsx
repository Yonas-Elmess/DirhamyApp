"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/hooks/useTheme";

interface PieChartProps {
  data: { categorie: string; montant: number; couleur: string; icone: string }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-white dark:bg-[#1a2332] rounded-xl border border-gray-100 dark:border-gray-700/40 shadow-xl shadow-gray-200/50 dark:shadow-none p-3 text-sm">
        <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
        <p className="font-bold mt-0.5" style={{ color: item.payload.couleur }}>
          {item.value.toLocaleString("fr-FR")} MAD
        </p>
      </div>
    );
  }
  return null;
};

export default function PieChart({ data }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px]">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800/60 rounded-2xl flex items-center justify-center">
          <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-3">Aucune donnée ce mois</p>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.montant, 0);

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="montant"
            nameKey="categorie"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.couleur} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </RechartsPieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 mt-2">
        {data.slice(0, 6).map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px]">
            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.couleur }} />
            <span className="text-gray-600 dark:text-gray-400 truncate">{item.icone} {item.categorie}</span>
            <span className="text-gray-400 dark:text-gray-500 font-medium ml-auto">{total > 0 ? Math.round((item.montant / total) * 100) : 0}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

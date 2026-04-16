"use client";

import Modal from "./Modal";
import { formatMontant, formatDateShort } from "@/lib/utils";

interface Conseil {
  type: "reduction" | "augmentation" | "alerte" | "positif";
  titre: string;
  message: string;
}

interface AnalysisResult {
  statut: "en-bonne-voie" | "en-retard" | "atteint" | "impossible";
  resume: string;
  montantMensuelNecessaire: number;
  epargneActuelleMensuelle: number;
  ecartMensuel: number;
  dateProjetee: string | null;
  conseils: Conseil[];
  source: "mock" | "ai";
}

interface Props {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  analysis: AnalysisResult | null;
  objectifNom: string;
}

const STATUT_CONFIG = {
  "atteint": {
    label: "Objectif atteint",
    bg: "from-green-500 to-emerald-600",
    icon: "🎉",
  },
  "en-bonne-voie": {
    label: "En bonne voie",
    bg: "from-blue-500 to-indigo-600",
    icon: "📈",
  },
  "en-retard": {
    label: "Léger retard",
    bg: "from-amber-500 to-orange-600",
    icon: "⚠️",
  },
  "impossible": {
    label: "Plan à revoir",
    bg: "from-red-500 to-rose-600",
    icon: "🚨",
  },
};

const CONSEIL_CONFIG: Record<Conseil["type"], { icon: string; bg: string; border: string; text: string }> = {
  positif: {
    icon: "✅",
    bg: "bg-green-50 dark:bg-green-500/10",
    border: "border-green-200 dark:border-green-500/30",
    text: "text-green-900 dark:text-green-100",
  },
  reduction: {
    icon: "✂️",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-500/30",
    text: "text-blue-900 dark:text-blue-100",
  },
  augmentation: {
    icon: "💼",
    bg: "bg-indigo-50 dark:bg-indigo-500/10",
    border: "border-indigo-200 dark:border-indigo-500/30",
    text: "text-indigo-900 dark:text-indigo-100",
  },
  alerte: {
    icon: "⚠️",
    bg: "bg-amber-50 dark:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-500/30",
    text: "text-amber-900 dark:text-amber-100",
  },
};

export default function AIAnalysisModal({
  open,
  onClose,
  loading,
  analysis,
  objectifNom,
}: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`✨ Analyse IA — ${objectifNom}`}
    >
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Analyse de votre situation financière...
          </p>
        </div>
      )}

      {!loading && analysis && (
        <div className="space-y-5">
          {/* Status banner */}
          <div
            className={`rounded-xl p-5 bg-gradient-to-br ${STATUT_CONFIG[analysis.statut].bg} text-white shadow-lg`}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{STATUT_CONFIG[analysis.statut].icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider opacity-90">
                {STATUT_CONFIG[analysis.statut].label}
              </span>
            </div>
            <p className="text-sm leading-relaxed">{analysis.resume}</p>
          </div>

          {/* Key numbers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                Épargne nécessaire
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatMontant(analysis.montantMensuelNecessaire)}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">par mois</p>
            </div>
            <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                Épargne actuelle
              </p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatMontant(analysis.epargneActuelleMensuelle)}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500">par mois (moy.)</p>
            </div>
          </div>

          {/* Shortfall / surplus */}
          {analysis.statut !== "atteint" && (
            <div
              className={`rounded-xl p-4 border ${
                analysis.ecartMensuel >= 0
                  ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30"
                  : "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    {analysis.ecartMensuel >= 0 ? "Surplus mensuel" : "Écart mensuel"}
                  </p>
                  <p
                    className={`text-xl font-bold mt-0.5 ${
                      analysis.ecartMensuel >= 0
                        ? "text-green-700 dark:text-green-300"
                        : "text-amber-700 dark:text-amber-300"
                    }`}
                  >
                    {analysis.ecartMensuel >= 0 ? "+" : ""}
                    {formatMontant(analysis.ecartMensuel)}
                  </p>
                </div>
                {analysis.dateProjetee && (
                  <div className="text-right">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                      Projection
                    </p>
                    <p className="text-sm font-semibold mt-0.5">
                      {formatDateShort(analysis.dateProjetee)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Advice list */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              Recommandations ({analysis.conseils.length})
            </h4>

            {analysis.conseils.map((c, i) => {
              const cfg = CONSEIL_CONFIG[c.type];
              return (
                <div
                  key={i}
                  className={`rounded-xl p-4 border ${cfg.bg} ${cfg.border} ${cfg.text}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl shrink-0">{cfg.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-1">{c.titre}</p>
                      <p className="text-xs leading-relaxed opacity-90">{c.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Source footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700/40">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">
              {analysis.source === "ai"
                ? "Analyse générée par Claude"
                : "Analyse basée sur un calcul local (mode démo)"}
            </p>
            <button onClick={onClose} className="btn-secondary text-sm rounded-xl">
              Fermer
            </button>
          </div>
        </div>
      )}

      {!loading && !analysis && (
        <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          Impossible de charger l&apos;analyse.
        </div>
      )}
    </Modal>
  );
}

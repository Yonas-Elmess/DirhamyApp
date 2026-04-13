"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { formatMontant, formatDateShort } from "@/lib/utils";
import StatCard from "@/components/ui/StatCard";
import ProgressBar from "@/components/ui/ProgressBar";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.stats.dashboard();
      setStats(data);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="w-12 h-12 border-[3px] border-blue-600 dark:border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-400 dark:text-gray-500 font-medium">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-subtitle">Vue d&apos;ensemble de vos finances personnelles</p>
      </div>

      {/* Budget alert */}
      {stats.budgetDepasse && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-500/10 dark:to-rose-500/10 border border-red-200/60 dark:border-red-500/20 rounded-2xl p-5 flex items-center gap-4 animate-fadeIn">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-red-800 dark:text-red-400">Budget mensuel dépassé !</p>
            <p className="text-sm text-red-600/80 dark:text-red-300 mt-0.5">
              Vous avez dépassé votre budget de{" "}
              <span className="font-semibold">{formatMontant(Math.abs(stats.budgetRestant))}</span>
            </p>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenus"
          value={formatMontant(stats.totalRevenus)}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>}
          trend="up"
        />
        <StatCard
          title="Total Dépenses"
          value={formatMontant(stats.totalDepenses)}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>}
          trend="down"
        />
        <StatCard
          title="Solde Actuel"
          value={formatMontant(stats.solde)}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
          trend={stats.solde >= 0 ? "up" : "down"}
          gradient={stats.solde >= 0 ? "from-blue-500 to-cyan-500" : "from-red-500 to-rose-600"}
        />
        <StatCard
          title="Budget Restant"
          value={stats.budgetMois > 0 ? formatMontant(stats.budgetRestant) : "Non défini"}
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
          subtitle={stats.budgetMois > 0 ? `sur ${formatMontant(stats.budgetMois)}` : undefined}
          gradient="from-violet-500 to-purple-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Revenus vs Dépenses</h2>
              <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">6 derniers mois</p>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Revenus</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Dépenses</span>
            </div>
          </div>
          <BarChart data={stats.evolutionMensuelle} />
        </div>

        <div className="card">
          <div className="mb-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Dépenses par catégorie</h2>
            <p className="text-[12px] text-gray-400 dark:text-gray-500 mt-0.5">Mois en cours</p>
          </div>
          <PieChart data={stats.depensesCategories} />
        </div>
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent transactions */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Transactions récentes</h2>
            <a href="/historique" className="text-[12px] text-blue-600 hover:text-blue-700 dark:text-amber-400 dark:hover:text-amber-300 font-semibold">
              Voir tout &rarr;
            </a>
          </div>
          {stats.transactionsRecentes.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800/60 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-3">Aucune transaction</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.transactionsRecentes.map((t: any) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors -mx-1"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${
                        t.type === "revenu"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-red-50 text-red-500 dark:bg-red-500/15 dark:text-red-400"
                      }`}
                    >
                      {t.type === "revenu" ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.description}</p>
                      <p className="text-[11px] text-gray-400">{formatDateShort(t.date)}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-bold ${
                    t.type === "revenu" ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                  }`}>
                    {t.type === "revenu" ? "+" : "-"}{formatMontant(t.montant)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Savings goals */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Objectifs d&apos;épargne</h2>
            <a href="/objectifs" className="text-[12px] text-blue-600 hover:text-blue-700 dark:text-amber-400 dark:hover:text-amber-300 font-semibold">
              Gérer &rarr;
            </a>
          </div>
          {stats.objectifsResume.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800/60 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-3">Aucun objectif défini</p>
            </div>
          ) : (
            <div className="space-y-5">
              {stats.objectifsResume.map((obj: any) => (
                <div key={obj.id} className="bg-gray-50/70 dark:bg-gray-800/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{obj.nom}</p>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      obj.progression >= 100
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                        : "bg-blue-100 text-blue-700 dark:bg-amber-500/15 dark:text-amber-400"
                    }`}>
                      {obj.progression}%
                    </span>
                  </div>
                  <ProgressBar
                    value={obj.progression}
                    color={obj.progression >= 100 ? "#10b981" : "#3b82f6"}
                    showLabel={false}
                    size="md"
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      {formatMontant(obj.totalCotisations)}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                      {formatMontant(obj.montantCible)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

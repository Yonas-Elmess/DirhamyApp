"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { formatMontant, getMoisNom, getCurrentMois, getCurrentAnnee } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import toast from "react-hot-toast";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [form, setForm] = useState({
    montant: "",
    mois: String(getCurrentMois()),
    annee: String(getCurrentAnnee()),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [budgetData, statsData] = await Promise.all([
        api.budgets.list(),
        api.stats.dashboard(),
      ]);
      setBudgets(budgetData.budgets);
      setStats(statsData);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      montant: "",
      mois: String(getCurrentMois()),
      annee: String(getCurrentAnnee()),
    });
    setModalOpen(true);
  };

  const openEdit = (b: any) => {
    setEditing(b);
    setForm({
      montant: String(b.montant),
      mois: String(b.mois),
      annee: String(b.annee),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      montant: parseFloat(form.montant),
      mois: parseInt(form.mois),
      annee: parseInt(form.annee),
    };
    try {
      if (editing) {
        await api.budgets.update(editing.id, payload);
        toast.success("Budget modifié");
      } else {
        await api.budgets.create(payload);
        toast.success("Budget défini");
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce budget ?")) return;
    try {
      await api.budgets.delete(id);
      toast.success("Budget supprimé");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const budgetActuel = stats?.budgetMois || 0;
  const depensesMois = stats?.depensesMois || 0;
  const budgetRestant = budgetActuel - depensesMois;
  const pourcentage = budgetActuel > 0 ? Math.round((depensesMois / budgetActuel) * 100) : 0;

  const statusColor = pourcentage > 100 ? "#ef4444" : pourcentage > 80 ? "#f59e0b" : "#22c55e";
  const statusLabel = pourcentage > 100 ? "Dépassé" : pourcentage > 80 ? "Attention" : "En bonne voie";

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">Gérez vos budgets mensuels</p>
        </div>
        <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Définir un budget
        </button>
      </div>

      {/* Current month summary */}
      {budgetActuel > 0 && (
        <div className="card space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-amber-500/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              {getMoisNom(getCurrentMois())} {getCurrentAnnee()}
            </h2>
            <span
              className="text-xs font-bold px-3 py-1.5 rounded-full"
              style={{
                backgroundColor: statusColor + "15",
                color: statusColor,
              }}
            >
              {statusLabel}
            </span>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-100/60 dark:border-blue-500/20">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-blue-600/80 dark:text-blue-400 uppercase tracking-wide">Budget</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatMontant(budgetActuel)}</p>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-500/10 dark:to-orange-500/10 border border-red-100/60 dark:border-red-500/20">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-red-600/80 dark:text-red-400 uppercase tracking-wide">Dépensé</p>
              </div>
              <p className="text-2xl font-bold text-danger-500">{formatMontant(depensesMois)}</p>
            </div>

            <div className="rounded-2xl p-4 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-500/10 dark:to-green-500/10 border border-emerald-100/60 dark:border-emerald-500/20">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400 uppercase tracking-wide">Restant</p>
              </div>
              <p
                className={`text-2xl font-bold ${
                  budgetRestant >= 0 ? "text-success-500" : "text-danger-500"
                }`}
              >
                {formatMontant(budgetRestant)}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Consommation du budget</span>
              <span className="text-sm font-bold" style={{ color: statusColor }}>{pourcentage}%</span>
            </div>
            <ProgressBar
              value={pourcentage}
              color={statusColor}
              size="lg"
              showLabel={false}
              gradient={true}
            />
          </div>

          {pourcentage > 100 && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
              <svg className="w-5 h-5 text-danger-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <p className="text-sm text-danger-500 font-semibold">
                Budget dépassé de {formatMontant(Math.abs(budgetRestant))} !
              </p>
            </div>
          )}
        </div>
      )}

      {/* Budget list */}
      {budgets.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185zM9.75 9h.008v.008H9.75V9zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 4.5h.008v.008h-.008V13.5zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          }
          title="Aucun budget défini"
          description="Définissez un budget mensuel pour mieux contrôler vos dépenses et atteindre vos objectifs"
          action={
            <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Définir un budget
            </button>
          }
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700/40 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
              </svg>
              Historique des budgets
            </h2>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/60 px-2.5 py-1 rounded-full">
              {budgets.length} budget{budgets.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700/40 bg-gray-50/50 dark:bg-gray-800/40">
                  <th className="table-header text-left px-6 py-3">
                    Mois
                  </th>
                  <th className="table-header text-left px-6 py-3">
                    Montant
                  </th>
                  <th className="table-header text-right px-6 py-3">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((b) => (
                  <tr
                    key={b.id}
                    className="table-row border-b border-gray-50 dark:border-gray-700/30 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="table-cell px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-amber-500/15 flex items-center justify-center">
                          <svg className="w-4 h-4 text-primary-600 dark:text-amber-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {getMoisNom(b.mois)} {b.annee}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell px-6 py-4">
                      <span className="text-sm font-bold text-primary-600 dark:text-amber-400 bg-primary-50 dark:bg-amber-500/15 px-2.5 py-1 rounded-lg">
                        {formatMontant(b.montant)}
                      </span>
                    </td>
                    <td className="table-cell px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="btn-ghost p-2 rounded-xl inline-flex items-center gap-1.5 text-sm"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="btn-danger p-2 rounded-xl inline-flex items-center gap-1.5 text-sm"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier le budget" : "Définir un budget"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Montant (MAD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              required
              placeholder="Ex: 5000.00"
              value={form.montant}
              onChange={(e) => setForm({ ...form, montant: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Mois
              </label>
              <select
                className="input-field"
                value={form.mois}
                onChange={(e) => setForm({ ...form, mois: e.target.value })}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {getMoisNom(i + 1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Année
              </label>
              <select
                className="input-field"
                value={form.annee}
                onChange={(e) => setForm({ ...form, annee: e.target.value })}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="submit" className="btn-primary flex-1 inline-flex items-center justify-center gap-2">
              {editing ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Modifier
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Définir
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

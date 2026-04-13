"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { formatMontant, formatDateShort } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import toast from "react-hot-toast";

export default function HistoriquePage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: "",
    categorieId: "",
    dateDebut: "",
    dateFin: "",
    search: "",
  });

  useEffect(() => {
    loadCategories();
    loadTransactions();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.categories.list();
      setCategories(data.categories);
    } catch {}
  };

  const loadTransactions = async (f = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (f.type) params.set("type", f.type);
      if (f.categorieId) params.set("categorieId", f.categorieId);
      if (f.dateDebut) params.set("dateDebut", f.dateDebut);
      if (f.dateFin) params.set("dateFin", f.dateFin);
      if (f.search) params.set("search", f.search);

      const data = await api.stats.transactions(params.toString());
      setTransactions(data.transactions);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadTransactions(filters);
  };

  const resetFilters = () => {
    const reset = { type: "", categorieId: "", dateDebut: "", dateFin: "", search: "" };
    setFilters(reset);
    loadTransactions(reset);
  };

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="page-title">Historique des transactions</h1>
          <p className="page-subtitle">
            {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card card-hover">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/50 dark:to-gray-700/30 flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
          </div>
          <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">Filtres</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Recherche
            </label>
            <div className="relative">
              <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                className="input-field text-sm pl-9"
                placeholder="Rechercher..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Type
            </label>
            <select
              className="input-field text-sm"
              value={filters.type}
              onChange={(e) =>
                setFilters({ ...filters, type: e.target.value })
              }
            >
              <option value="">Tous</option>
              <option value="revenu">Revenus</option>
              <option value="depense">Depenses</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Categorie
            </label>
            <select
              className="input-field text-sm"
              value={filters.categorieId}
              onChange={(e) =>
                setFilters({ ...filters, categorieId: e.target.value })
              }
            >
              <option value="">Toutes</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icone} {c.nom}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Date debut
            </label>
            <input
              type="date"
              className="input-field text-sm"
              value={filters.dateDebut}
              onChange={(e) =>
                setFilters({ ...filters, dateDebut: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
              Date fin
            </label>
            <input
              type="date"
              className="input-field text-sm"
              value={filters.dateFin}
              onChange={(e) =>
                setFilters({ ...filters, dateFin: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/40">
          <button onClick={handleFilter} className="btn-primary text-sm inline-flex items-center gap-2 rounded-xl">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filtrer
          </button>
          <button onClick={resetFilters} className="btn-ghost text-sm inline-flex items-center gap-2 rounded-xl">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
            Reinitialiser
          </button>
        </div>
      </div>

      {/* Transactions list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-10 h-10 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          title="Aucune transaction"
          description="Les transactions apparaitront ici une fois ajoutees"
        />
      ) : (
        <div className="card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gradient-to-r from-gray-50/80 to-gray-50/40 dark:from-gray-800/50 dark:to-gray-800/30 dark:border-gray-700/40">
                  <th className="table-header text-left px-6 py-3.5">Type</th>
                  <th className="table-header text-left px-6 py-3.5">Description</th>
                  <th className="table-header text-left px-6 py-3.5">Categorie</th>
                  <th className="table-header text-left px-6 py-3.5">Montant</th>
                  <th className="table-header text-left px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr
                    key={`${t.type}-${t.id}`}
                    className="table-row border-b border-gray-50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all duration-150"
                  >
                    <td className="table-cell px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                          t.type === "revenu"
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 ring-1 ring-green-200 dark:from-green-500/10 dark:to-emerald-500/10 dark:text-green-400 dark:ring-green-500/30"
                            : "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 ring-1 ring-red-200 dark:from-red-500/10 dark:to-rose-500/10 dark:text-red-400 dark:ring-red-500/30"
                        }`}
                      >
                        {t.type === "revenu" ? (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                          </svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
                          </svg>
                        )}
                        {t.type === "revenu" ? "Revenu" : "Depense"}
                      </span>
                    </td>
                    <td className="table-cell px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {t.description}
                    </td>
                    <td className="table-cell px-6 py-4 text-sm text-gray-500">
                      {t.categorie ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ring-1 ring-opacity-20"
                          style={{
                            backgroundColor: (t.categorie.couleur || "#6b7280") + "10",
                            color: t.categorie.couleur || "#6b7280",
                            ringColor: t.categorie.couleur || "#6b7280",
                          }}
                        >
                          {t.categorie.icone} {t.categorie.nom}
                        </span>
                      ) : (
                        <span className="text-gray-300">--</span>
                      )}
                    </td>
                    <td className="table-cell px-6 py-4">
                      <span
                        className={`text-sm font-bold ${
                          t.type === "revenu"
                            ? "text-success-500"
                            : "text-danger-500"
                        }`}
                      >
                        {t.type === "revenu" ? "+" : "-"}
                        {formatMontant(t.montant)}
                      </span>
                    </td>
                    <td className="table-cell px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        {formatDateShort(t.date)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { formatMontant, formatDateShort, formatDateInput } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import ProgressBar from "@/components/ui/ProgressBar";
import EmptyState from "@/components/ui/EmptyState";
import AIAnalysisModal from "@/components/ui/AIAnalysisModal";
import toast from "react-hot-toast";

export default function ObjectifsPage() {
  const [objectifs, setObjectifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cotisationModal, setCotisationModal] = useState(false);
  const [selectedObjectif, setSelectedObjectif] = useState<any>(null);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({
    nom: "",
    montantCible: "",
    dateDebut: "",
    dateFin: "",
  });
  const [cotisationForm, setCotisationForm] = useState({
    montant: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [aiObjectifNom, setAiObjectifNom] = useState("");

  useEffect(() => {
    loadObjectifs();
  }, []);

  const loadObjectifs = async () => {
    try {
      const data = await api.objectifs.list();
      setObjectifs(data.objectifs);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({
      nom: "",
      montantCible: "",
      dateDebut: new Date().toISOString().split("T")[0],
      dateFin: "",
    });
    setModalOpen(true);
  };

  const openEdit = (o: any) => {
    setEditing(o);
    setForm({
      nom: o.nom,
      montantCible: String(o.montantCible),
      dateDebut: formatDateInput(o.dateDebut),
      dateFin: formatDateInput(o.dateFin),
    });
    setModalOpen(true);
  };

  const openCotisation = (o: any) => {
    setSelectedObjectif(o);
    setCotisationForm({
      montant: "",
      date: new Date().toISOString().split("T")[0],
    });
    setCotisationModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nom: form.nom,
      montantCible: parseFloat(form.montantCible),
      dateDebut: form.dateDebut,
      dateFin: form.dateFin,
    };
    try {
      if (editing) {
        await api.objectifs.update(editing.id, payload);
        toast.success("Objectif modifié");
      } else {
        await api.objectifs.create(payload);
        toast.success("Objectif créé");
      }
      setModalOpen(false);
      loadObjectifs();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleCotisation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.cotisations.create({
        montant: parseFloat(cotisationForm.montant),
        date: cotisationForm.date,
        objectifId: selectedObjectif.id,
      });
      toast.success("Cotisation ajoutée");
      setCotisationModal(false);
      loadObjectifs();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAnalyze = async (o: any) => {
    setAiObjectifNom(o.nom);
    setAiAnalysis(null);
    setAiLoading(true);
    setAiModalOpen(true);
    try {
      const data = await api.objectifs.analyze(o.id);
      setAiAnalysis(data.analysis);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'analyse");
      setAiModalOpen(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet objectif et toutes ses cotisations ?")) return;
    try {
      await api.objectifs.delete(id);
      toast.success("Objectif supprimé");
      loadObjectifs();
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

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h1 className="page-title">Objectifs d&apos;epargne</h1>
            <p className="page-subtitle">
              {objectifs.length} objectif{objectifs.length !== 1 ? "s" : ""} en cours
            </p>
          </div>
        </div>
        <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2 shadow-lg shadow-primary-500/20">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nouvel objectif
        </button>
      </div>

      {objectifs.length === 0 ? (
        <EmptyState
          icon={
            <svg className="w-10 h-10 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          title="Aucun objectif"
          description="Créez un objectif d'épargne pour commencer à économiser vers vos rêves"
          action={
            <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Créer un objectif
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {objectifs.map((o) => {
            const isCompleted = o.progression >= 100;
            return (
              <div
                key={o.id}
                className="card card-hover group relative overflow-hidden"
              >
                {/* Decorative gradient top bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                  style={{
                    background: isCompleted
                      ? "linear-gradient(90deg, #22c55e, #10b981)"
                      : "linear-gradient(90deg, #3b82f6, #6366f1)",
                  }}
                />

                <div className="flex items-start justify-between mb-5 pt-1">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? "bg-gradient-to-br from-green-400 to-emerald-600"
                          : "bg-gradient-to-br from-blue-400 to-indigo-600"
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">
                        {o.nom}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {formatDateShort(o.dateDebut)} — {formatDateShort(o.dateFin)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
                      isCompleted
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 ring-1 ring-green-200 dark:from-green-500/10 dark:to-emerald-500/10 dark:text-green-400 dark:ring-green-500/30"
                        : "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 ring-1 ring-blue-200 dark:from-amber-500/10 dark:to-amber-500/5 dark:text-amber-400 dark:ring-amber-500/30"
                    }`}
                  >
                    {isCompleted ? "Atteint !" : `${o.progression}%`}
                  </span>
                </div>

                {/* Gradient progress bar */}
                <ProgressBar
                  value={o.progression}
                  color={isCompleted ? "#22c55e" : "#3b82f6"}
                  size="lg"
                  showLabel={false}
                  gradient
                />

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mt-5">
                  <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                      </svg>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Objectif</p>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatMontant(o.montantCible)}
                    </p>
                  </div>
                  <div className="bg-green-50/60 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-green-500 dark:text-green-400">Epargne</p>
                    </div>
                    <p className="text-sm font-bold text-success-500">
                      {formatMontant(o.totalCotisations)}
                    </p>
                  </div>
                  <div className="bg-amber-50/60 dark:bg-amber-500/10 rounded-xl p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-500 dark:text-amber-400">Restant</p>
                    </div>
                    <p className="text-sm font-bold text-warning-500">
                      {formatMontant(o.montantRestant)}
                    </p>
                  </div>
                </div>

                {/* Recent cotisations */}
                {o.cotisations.length > 0 && (
                  <div className="mt-5 border-t border-gray-100 dark:border-gray-700/40 pt-4">
                    <div className="flex items-center gap-1.5 mb-3">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                      </svg>
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Dernieres cotisations
                      </p>
                    </div>
                    <div className="space-y-2">
                      {o.cotisations.slice(0, 3).map((c: any) => (
                        <div
                          key={c.id}
                          className="flex justify-between items-center text-xs bg-gray-50/50 dark:bg-gray-800/40 rounded-lg px-3 py-2"
                        >
                          <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            {formatDateShort(c.date)}
                          </span>
                          <span className="font-semibold text-success-500">
                            +{formatMontant(c.montant)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Analyze button */}
                <button
                  onClick={() => handleAnalyze(o)}
                  className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 hover:from-purple-600 hover:via-violet-600 hover:to-indigo-600 text-white text-sm font-semibold shadow-md shadow-purple-500/20 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
                  </svg>
                  Analyser avec IA
                </button>

                {/* Actions */}
                <div className="flex gap-2 mt-3 pt-4 border-t border-gray-100 dark:border-gray-700/40">
                  <button
                    onClick={() => openCotisation(o)}
                    className="btn-success text-sm py-2.5 px-4 flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Cotisation
                  </button>
                  <button
                    onClick={() => openEdit(o)}
                    className="btn-ghost text-sm py-2.5 px-3 rounded-xl inline-flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(o.id)}
                    className="btn-danger text-sm py-2.5 px-3 rounded-xl inline-flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Objectif Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Modifier l'objectif" : "Nouvel objectif d'épargne"}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Nom de l&apos;objectif
            </label>
            <input
              type="text"
              className="input-field"
              required
              placeholder="Ex: Voyage, Voiture..."
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Montant cible (MAD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="input-field"
              required
              value={form.montantCible}
              onChange={(e) => setForm({ ...form, montantCible: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Date debut
              </label>
              <input
                type="date"
                className="input-field"
                required
                value={form.dateDebut}
                onChange={(e) => setForm({ ...form, dateDebut: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Date fin
              </label>
              <input
                type="date"
                className="input-field"
                required
                value={form.dateFin}
                onChange={(e) => setForm({ ...form, dateFin: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-3">
            <button type="submit" className="btn-primary flex-1 rounded-xl">
              {editing ? "Modifier" : "Créer"}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn-secondary rounded-xl"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>

      {/* AI Analysis Modal */}
      <AIAnalysisModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        loading={aiLoading}
        analysis={aiAnalysis}
        objectifNom={aiObjectifNom}
      />

      {/* Cotisation Modal */}
      <Modal
        open={cotisationModal}
        onClose={() => setCotisationModal(false)}
        title={`Ajouter une cotisation - ${selectedObjectif?.nom || ""}`}
      >
        <form onSubmit={handleCotisation} className="space-y-5">
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
              value={cotisationForm.montant}
              onChange={(e) =>
                setCotisationForm({ ...cotisationForm, montant: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Date
            </label>
            <input
              type="date"
              className="input-field"
              required
              value={cotisationForm.date}
              onChange={(e) =>
                setCotisationForm({ ...cotisationForm, date: e.target.value })
              }
            />
          </div>
          <div className="flex gap-3 pt-3">
            <button type="submit" className="btn-primary flex-1 rounded-xl">
              Ajouter
            </button>
            <button
              type="button"
              onClick={() => setCotisationModal(false)}
              className="btn-secondary rounded-xl"
            >
              Annuler
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

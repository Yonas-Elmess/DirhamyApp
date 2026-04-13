import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const now = new Date();
  const moisActuel = now.getMonth() + 1;
  const anneeActuelle = now.getFullYear();
  const debutMois = new Date(anneeActuelle, moisActuel - 1, 1);
  const finMois = new Date(anneeActuelle, moisActuel, 0, 23, 59, 59);

  // Total revenus & dépenses (all time)
  const [totalRevenus, totalDepenses] = await Promise.all([
    prisma.revenu.aggregate({
      where: { userId: auth.userId },
      _sum: { montant: true },
    }),
    prisma.depense.aggregate({
      where: { userId: auth.userId },
      _sum: { montant: true },
    }),
  ]);

  // Monthly totals
  const [revenusMois, depensesMois] = await Promise.all([
    prisma.revenu.aggregate({
      where: { userId: auth.userId, date: { gte: debutMois, lte: finMois } },
      _sum: { montant: true },
    }),
    prisma.depense.aggregate({
      where: { userId: auth.userId, date: { gte: debutMois, lte: finMois } },
      _sum: { montant: true },
    }),
  ]);

  // Budget du mois
  const budgetMois = await prisma.budget.findUnique({
    where: {
      userId_mois_annee: {
        userId: auth.userId,
        mois: moisActuel,
        annee: anneeActuelle,
      },
    },
  });

  // Dépenses par catégorie (mois actuel)
  const depensesParCategorie = await prisma.depense.groupBy({
    by: ["categorieId"],
    where: {
      userId: auth.userId,
      date: { gte: debutMois, lte: finMois },
    },
    _sum: { montant: true },
  });

  const categorieIds = depensesParCategorie
    .map((d) => d.categorieId)
    .filter(Boolean) as string[];

  const categories = await prisma.categorie.findMany({
    where: { id: { in: categorieIds } },
    select: { id: true, nom: true, icone: true, couleur: true },
  });

  const depensesCategories = depensesParCategorie.map((d) => {
    const cat = categories.find((c) => c.id === d.categorieId);
    return {
      categorie: cat?.nom || "Sans catégorie",
      icone: cat?.icone || "📁",
      couleur: cat?.couleur || "#6b7280",
      montant: d._sum.montant || 0,
    };
  });

  // Évolution mensuelle (6 derniers mois)
  const evolutionMensuelle = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(anneeActuelle, moisActuel - 1 - i, 1);
    const debut = new Date(date.getFullYear(), date.getMonth(), 1);
    const fin = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

    const [rev, dep] = await Promise.all([
      prisma.revenu.aggregate({
        where: { userId: auth.userId, date: { gte: debut, lte: fin } },
        _sum: { montant: true },
      }),
      prisma.depense.aggregate({
        where: { userId: auth.userId, date: { gte: debut, lte: fin } },
        _sum: { montant: true },
      }),
    ]);

    const moisNoms = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

    evolutionMensuelle.push({
      mois: moisNoms[date.getMonth()],
      revenus: rev._sum.montant || 0,
      depenses: dep._sum.montant || 0,
    });
  }

  // Transactions récentes
  const [revenusRecents, depensesRecentes] = await Promise.all([
    prisma.revenu.findMany({
      where: { userId: auth.userId },
      orderBy: { date: "desc" },
      take: 5,
    }),
    prisma.depense.findMany({
      where: { userId: auth.userId },
      orderBy: { date: "desc" },
      take: 5,
      include: { categorie: { select: { nom: true, icone: true } } },
    }),
  ]);

  const transactionsRecentes = [
    ...revenusRecents.map((r) => ({
      id: r.id,
      type: "revenu" as const,
      montant: r.montant,
      date: r.date,
      description: r.description || "Revenu",
    })),
    ...depensesRecentes.map((d) => ({
      id: d.id,
      type: "depense" as const,
      montant: d.montant,
      date: d.date,
      description: d.description || d.categorie?.nom || "Dépense",
      categorie: d.categorie?.nom,
      icone: d.categorie?.icone,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  // Objectifs d'épargne
  const objectifs = await prisma.objectif.findMany({
    where: { userId: auth.userId },
    include: { cotisations: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const objectifsResume = objectifs.map((obj) => {
    const total = obj.cotisations.reduce((sum, c) => sum + c.montant, 0);
    return {
      id: obj.id,
      nom: obj.nom,
      montantCible: obj.montantCible,
      totalCotisations: total,
      progression: obj.montantCible > 0
        ? Math.min(Math.round((total / obj.montantCible) * 100), 100)
        : 0,
    };
  });

  const totalRevenusVal = totalRevenus._sum.montant || 0;
  const totalDepensesVal = totalDepenses._sum.montant || 0;
  const depensesMoisVal = depensesMois._sum.montant || 0;
  const budgetMontant = budgetMois?.montant || 0;

  return NextResponse.json({
    totalRevenus: totalRevenusVal,
    totalDepenses: totalDepensesVal,
    solde: totalRevenusVal - totalDepensesVal,
    revenusMois: revenusMois._sum.montant || 0,
    depensesMois: depensesMoisVal,
    budgetMois: budgetMontant,
    budgetRestant: budgetMontant - depensesMoisVal,
    budgetDepasse: budgetMontant > 0 && depensesMoisVal > budgetMontant,
    depensesCategories,
    evolutionMensuelle,
    transactionsRecentes,
    objectifsResume,
  });
}

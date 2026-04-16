import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { analyzeObjectif, ObjectifAnalysisInput } from "@/lib/ai";

// Window for computing "average monthly" stats
const MONTHS_WINDOW = 6;

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // 1. Load the objectif (ensure it belongs to the user)
  const objectif = await prisma.objectif.findFirst({
    where: { id: params.id, userId: auth.userId },
    include: { cotisations: true },
  });

  if (!objectif) {
    return NextResponse.json({ error: "Objectif introuvable" }, { status: 404 });
  }

  // 2. Compute goal-level numbers
  const totalCotisations = objectif.cotisations.reduce((s, c) => s + c.montant, 0);
  const montantRestant = Math.max(objectif.montantCible - totalCotisations, 0);

  const now = new Date();
  const dateFin = new Date(objectif.dateFin);
  const monthsToDeadline = Math.max(
    Math.ceil(
      (dateFin.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    ),
    0
  );

  // 3. Compute user's financial averages over the last MONTHS_WINDOW months
  const windowStart = new Date();
  windowStart.setMonth(windowStart.getMonth() - MONTHS_WINDOW);

  const [revenus, depenses] = await Promise.all([
    prisma.revenu.findMany({
      where: { userId: auth.userId, date: { gte: windowStart } },
    }),
    prisma.depense.findMany({
      where: { userId: auth.userId, date: { gte: windowStart } },
      include: { categorie: true },
    }),
  ]);

  const totalRevenus = revenus.reduce((s, r) => s + r.montant, 0);
  const totalDepenses = depenses.reduce((s, d) => s + d.montant, 0);

  const revenuMensuelMoyen = Math.round(totalRevenus / MONTHS_WINDOW);
  const depenseMensuelleMoyenne = Math.round(totalDepenses / MONTHS_WINDOW);
  const epargneMensuelleMoyenne = revenuMensuelMoyen - depenseMensuelleMoyenne;
  const tauxEpargne =
    revenuMensuelMoyen > 0
      ? Math.round((epargneMensuelleMoyenne / revenuMensuelMoyen) * 100)
      : 0;

  // 4. Break down expenses by category
  const byCategorie = new Map<string, number>();
  for (const d of depenses) {
    const nom = d.categorie?.nom || "Non catégorisé";
    byCategorie.set(nom, (byCategorie.get(nom) || 0) + d.montant);
  }
  const depensesParCategorie = Array.from(byCategorie.entries())
    .map(([categorie, montant]) => ({
      categorie,
      montant: Math.round(montant),
      pourcentage:
        totalDepenses > 0 ? Math.round((montant / totalDepenses) * 100) : 0,
    }))
    .sort((a, b) => b.montant - a.montant);

  // 5. Build the input and call the analyzer
  const input: ObjectifAnalysisInput = {
    objectif: {
      nom: objectif.nom,
      montantCible: objectif.montantCible,
      dateDebut: objectif.dateDebut.toISOString(),
      dateFin: objectif.dateFin.toISOString(),
      totalCotisations,
      montantRestant,
    },
    stats: {
      revenuMensuelMoyen,
      depenseMensuelleMoyenne,
      epargneMensuelleMoyenne,
      tauxEpargne,
      moisRestants: monthsToDeadline,
      depensesParCategorie,
    },
  };

  try {
    const analysis = await analyzeObjectif(input);
    return NextResponse.json({ analysis, input });
  } catch (err) {
    console.error("Analyze objectif error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse" },
      { status: 500 }
    );
  }
}

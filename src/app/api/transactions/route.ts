import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const dateDebut = searchParams.get("dateDebut");
  const dateFin = searchParams.get("dateFin");
  const categorieId = searchParams.get("categorieId");
  const type = searchParams.get("type"); // "revenu" | "depense" | null
  const search = searchParams.get("search");

  const dateFilter: any = {};
  if (dateDebut) dateFilter.gte = new Date(dateDebut);
  if (dateFin) dateFilter.lte = new Date(dateFin + "T23:59:59");

  const transactions: any[] = [];

  // Revenus
  if (type !== "depense") {
    const revenus = await prisma.revenu.findMany({
      where: {
        userId: auth.userId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        ...(search
          ? { description: { contains: search, mode: "insensitive" } }
          : {}),
      },
      orderBy: { date: "desc" },
    });

    transactions.push(
      ...revenus.map((r) => ({
        id: r.id,
        type: "revenu",
        montant: r.montant,
        date: r.date,
        description: r.description || "Revenu",
        categorie: null,
      }))
    );
  }

  // Dépenses
  if (type !== "revenu") {
    const depenses = await prisma.depense.findMany({
      where: {
        userId: auth.userId,
        ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        ...(categorieId ? { categorieId } : {}),
        ...(search
          ? { description: { contains: search, mode: "insensitive" } }
          : {}),
      },
      include: {
        categorie: { select: { id: true, nom: true, icone: true, couleur: true } },
      },
      orderBy: { date: "desc" },
    });

    transactions.push(
      ...depenses.map((d) => ({
        id: d.id,
        type: "depense",
        montant: d.montant,
        date: d.date,
        description: d.description || d.categorie?.nom || "Dépense",
        categorie: d.categorie,
      }))
    );
  }

  // Sort by date descending
  transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return NextResponse.json({ transactions });
}

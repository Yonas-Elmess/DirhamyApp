import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { objectifSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const objectifs = await prisma.objectif.findMany({
    where: { userId: auth.userId },
    include: {
      cotisations: { orderBy: { date: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const objectifsAvecProgression = objectifs.map((obj) => {
    const totalCotisations = obj.cotisations.reduce((sum, c) => sum + c.montant, 0);
    const progression = obj.montantCible > 0
      ? Math.min(Math.round((totalCotisations / obj.montantCible) * 100), 100)
      : 0;
    return {
      ...obj,
      totalCotisations,
      progression,
      montantRestant: Math.max(obj.montantCible - totalCotisations, 0),
    };
  });

  return NextResponse.json({ objectifs: objectifsAvecProgression });
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = objectifSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const objectif = await prisma.objectif.create({
      data: {
        nom: parsed.data.nom,
        montantCible: parsed.data.montantCible,
        dateDebut: new Date(parsed.data.dateDebut),
        dateFin: new Date(parsed.data.dateFin),
        userId: auth.userId,
      },
    });

    return NextResponse.json({ objectif }, { status: 201 });
  } catch (error) {
    console.error("Create objectif error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

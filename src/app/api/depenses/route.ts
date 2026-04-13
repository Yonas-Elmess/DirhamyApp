import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { depenseSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const depenses = await prisma.depense.findMany({
    where: { userId: auth.userId },
    include: { categorie: { select: { id: true, nom: true, icone: true, couleur: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ depenses });
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = depenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const depense = await prisma.depense.create({
      data: {
        montant: parsed.data.montant,
        date: new Date(parsed.data.date),
        description: parsed.data.description || null,
        categorieId: parsed.data.categorieId || null,
        userId: auth.userId,
      },
      include: { categorie: { select: { id: true, nom: true, icone: true, couleur: true } } },
    });

    return NextResponse.json({ depense }, { status: 201 });
  } catch (error) {
    console.error("Create depense error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

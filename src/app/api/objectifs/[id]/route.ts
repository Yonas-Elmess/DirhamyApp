import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { objectifSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = objectifSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const result = await prisma.objectif.updateMany({
      where: { id: params.id, userId: auth.userId },
      data: {
        nom: parsed.data.nom,
        montantCible: parsed.data.montantCible,
        dateDebut: new Date(parsed.data.dateDebut),
        dateFin: new Date(parsed.data.dateFin),
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Objectif non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Objectif modifié" });
  } catch (error) {
    console.error("Update objectif error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const result = await prisma.objectif.deleteMany({
      where: { id: params.id, userId: auth.userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Objectif non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Objectif supprimé" });
  } catch (error) {
    console.error("Delete objectif error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

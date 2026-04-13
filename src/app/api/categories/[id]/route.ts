import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { categorieSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = categorieSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const result = await prisma.categorie.updateMany({
      where: { id: params.id, userId: auth.userId },
      data: {
        nom: parsed.data.nom,
        icone: parsed.data.icone || "📁",
        couleur: parsed.data.couleur || "#3b82f6",
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Catégorie modifiée" });
  } catch (error) {
    console.error("Update categorie error:", error);
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
    const result = await prisma.categorie.deleteMany({
      where: { id: params.id, userId: auth.userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Catégorie non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Catégorie supprimée" });
  } catch (error) {
    console.error("Delete categorie error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

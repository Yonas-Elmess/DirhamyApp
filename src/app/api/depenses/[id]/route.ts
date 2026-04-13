import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { depenseSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = depenseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const result = await prisma.depense.updateMany({
      where: { id: params.id, userId: auth.userId },
      data: {
        montant: parsed.data.montant,
        date: new Date(parsed.data.date),
        description: parsed.data.description || null,
        categorieId: parsed.data.categorieId || null,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Dépense non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Dépense modifiée" });
  } catch (error) {
    console.error("Update depense error:", error);
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
    const result = await prisma.depense.deleteMany({
      where: { id: params.id, userId: auth.userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Dépense non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ message: "Dépense supprimée" });
  } catch (error) {
    console.error("Delete depense error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

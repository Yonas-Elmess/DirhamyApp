import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { budgetSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = budgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const result = await prisma.budget.updateMany({
      where: { id: params.id, userId: auth.userId },
      data: { montant: parsed.data.montant, mois: parsed.data.mois, annee: parsed.data.annee },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Budget non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Budget modifié" });
  } catch (error) {
    console.error("Update budget error:", error);
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
    const result = await prisma.budget.deleteMany({
      where: { id: params.id, userId: auth.userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Budget non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Budget supprimé" });
  } catch (error) {
    console.error("Delete budget error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

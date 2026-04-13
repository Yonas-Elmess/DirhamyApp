import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { revenuSchema } from "@/lib/validations";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = revenuSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const revenu = await prisma.revenu.updateMany({
      where: { id: params.id, userId: auth.userId },
      data: {
        montant: parsed.data.montant,
        date: new Date(parsed.data.date),
        description: parsed.data.description || null,
      },
    });

    if (revenu.count === 0) {
      return NextResponse.json({ error: "Revenu non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Revenu modifié" });
  } catch (error) {
    console.error("Update revenu error:", error);
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
    const result = await prisma.revenu.deleteMany({
      where: { id: params.id, userId: auth.userId },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "Revenu non trouvé" }, { status: 404 });
    }

    return NextResponse.json({ message: "Revenu supprimé" });
  } catch (error) {
    console.error("Delete revenu error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    // Verify ownership via the objectif
    const cotisation = await prisma.cotisation.findUnique({
      where: { id: params.id },
      include: { objectif: { select: { userId: true } } },
    });

    if (!cotisation || cotisation.objectif.userId !== auth.userId) {
      return NextResponse.json({ error: "Cotisation non trouvée" }, { status: 404 });
    }

    await prisma.cotisation.delete({ where: { id: params.id } });

    return NextResponse.json({ message: "Cotisation supprimée" });
  } catch (error) {
    console.error("Delete cotisation error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

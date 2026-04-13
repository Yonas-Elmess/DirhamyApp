import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { cotisationSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const objectifId = searchParams.get("objectifId");

  const cotisations = await prisma.cotisation.findMany({
    where: {
      objectif: { userId: auth.userId },
      ...(objectifId ? { objectifId } : {}),
    },
    include: { objectif: { select: { nom: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ cotisations });
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = cotisationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    // Verify the objectif belongs to the user
    const objectif = await prisma.objectif.findFirst({
      where: { id: parsed.data.objectifId, userId: auth.userId },
    });
    if (!objectif) {
      return NextResponse.json({ error: "Objectif non trouvé" }, { status: 404 });
    }

    const cotisation = await prisma.cotisation.create({
      data: {
        montant: parsed.data.montant,
        date: new Date(parsed.data.date),
        objectifId: parsed.data.objectifId,
      },
    });

    return NextResponse.json({ cotisation }, { status: 201 });
  } catch (error) {
    console.error("Create cotisation error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

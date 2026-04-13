import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { categorieSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const categories = await prisma.categorie.findMany({
    where: { userId: auth.userId },
    include: { _count: { select: { depenses: true } } },
    orderBy: { nom: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = categorieSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const categorie = await prisma.categorie.create({
      data: {
        nom: parsed.data.nom,
        icone: parsed.data.icone || "📁",
        couleur: parsed.data.couleur || "#3b82f6",
        userId: auth.userId,
      },
    });

    return NextResponse.json({ categorie }, { status: 201 });
  } catch (error) {
    console.error("Create categorie error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

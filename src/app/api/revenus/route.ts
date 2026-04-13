import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { revenuSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const revenus = await prisma.revenu.findMany({
    where: { userId: auth.userId },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ revenus });
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = revenuSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const revenu = await prisma.revenu.create({
      data: {
        montant: parsed.data.montant,
        date: new Date(parsed.data.date),
        description: parsed.data.description || null,
        userId: auth.userId,
      },
    });

    return NextResponse.json({ revenu }, { status: 201 });
  } catch (error) {
    console.error("Create revenu error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

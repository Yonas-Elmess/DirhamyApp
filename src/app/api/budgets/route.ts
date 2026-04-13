import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { budgetSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const budgets = await prisma.budget.findMany({
    where: { userId: auth.userId },
    orderBy: [{ annee: "desc" }, { mois: "desc" }],
  });

  return NextResponse.json({ budgets });
}

export async function POST(request: Request) {
  const auth = getUserFromRequest(request);
  if (!auth) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = budgetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_mois_annee: {
          userId: auth.userId,
          mois: parsed.data.mois,
          annee: parsed.data.annee,
        },
      },
      update: { montant: parsed.data.montant },
      create: {
        montant: parsed.data.montant,
        mois: parsed.data.mois,
        annee: parsed.data.annee,
        userId: auth.userId,
      },
    });

    return NextResponse.json({ budget }, { status: 201 });
  } catch (error) {
    console.error("Create budget error:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

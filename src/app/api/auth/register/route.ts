import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, COOKIE_NAME } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const { nom, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { nom, email, password: hashedPassword },
    });

    // Copy global categories for the new user
    const globalCategories = await prisma.categorie.findMany({
      where: { isGlobal: true },
    });
    if (globalCategories.length > 0) {
      await prisma.categorie.createMany({
        data: globalCategories.map((cat) => ({
          nom: cat.nom,
          icone: cat.icone,
          couleur: cat.couleur,
          isGlobal: false,
          userId: user.id,
        })),
      });
    }

    const token = generateToken({ userId: user.id, email: user.email });

    const response = NextResponse.json(
      { message: "Inscription réussie", user: { id: user.id, nom: user.nom, email: user.email } },
      { status: 201 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}

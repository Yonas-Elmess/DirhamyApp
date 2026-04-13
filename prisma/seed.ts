import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categoriesParDefaut = [
  { nom: "Alimentation", icone: "🍔", couleur: "#ef4444" },
  { nom: "Transport", icone: "🚗", couleur: "#f59e0b" },
  { nom: "Logement", icone: "🏠", couleur: "#3b82f6" },
  { nom: "Santé", icone: "🏥", couleur: "#22c55e" },
  { nom: "Éducation", icone: "📚", couleur: "#8b5cf6" },
  { nom: "Loisirs", icone: "🎮", couleur: "#ec4899" },
  { nom: "Shopping", icone: "🛍️", couleur: "#f97316" },
  { nom: "Factures", icone: "📄", couleur: "#64748b" },
  { nom: "Épargne", icone: "💰", couleur: "#14b8a6" },
  { nom: "Autre", icone: "📁", couleur: "#6b7280" },
];

async function main() {
  console.log("Seeding des catégories par défaut...");

  for (const cat of categoriesParDefaut) {
    await prisma.categorie.upsert({
      where: { id: cat.nom.toLowerCase() },
      update: {},
      create: {
        id: cat.nom.toLowerCase(),
        nom: cat.nom,
        icone: cat.icone,
        couleur: cat.couleur,
        isGlobal: true,
      },
    });
  }

  console.log("Seed terminé !");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

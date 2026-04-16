import Anthropic from "@anthropic-ai/sdk";

/**
 * AI Analysis for Savings Goals
 *
 * This module analyzes a user's financial situation relative to a savings goal
 * and returns structured recommendations.
 *
 * It can operate in two modes:
 *  - MOCK mode (when ANTHROPIC_API_KEY is not set): returns a realistic fake
 *    response for development/testing without any API cost.
 *  - LIVE mode (when ANTHROPIC_API_KEY is set): calls Claude Haiku for real.
 */

export interface ObjectifAnalysisInput {
  objectif: {
    nom: string;
    montantCible: number;
    dateDebut: string; // ISO date
    dateFin: string; // ISO date
    totalCotisations: number;
    montantRestant: number;
  };
  stats: {
    revenuMensuelMoyen: number;
    depenseMensuelleMoyenne: number;
    epargneMensuelleMoyenne: number;
    tauxEpargne: number; // percentage (0-100)
    moisRestants: number;
    depensesParCategorie: { categorie: string; montant: number; pourcentage: number }[];
  };
}

export type ConseilType = "reduction" | "augmentation" | "alerte" | "positif";

export interface Conseil {
  type: ConseilType;
  titre: string;
  message: string;
}

export interface ObjectifAnalysisResult {
  statut: "en-bonne-voie" | "en-retard" | "atteint" | "impossible";
  resume: string; // short natural-language summary
  montantMensuelNecessaire: number; // MAD per month needed to hit the goal
  epargneActuelleMensuelle: number; // current monthly savings toward this goal
  ecartMensuel: number; // positive = surplus, negative = shortfall
  dateProjetee: string | null; // ISO date, when goal would be reached at current pace
  conseils: Conseil[];
  source: "mock" | "ai";
}

// ─────────────────────────────────────────────────────────────
// Mock response (used when no API key is configured)
// ─────────────────────────────────────────────────────────────
function buildMockAnalysis(input: ObjectifAnalysisInput): ObjectifAnalysisResult {
  const { objectif, stats } = input;
  const montantMensuelNecessaire =
    stats.moisRestants > 0 ? objectif.montantRestant / stats.moisRestants : objectif.montantRestant;

  const epargneActuelleMensuelle = Math.max(stats.epargneMensuelleMoyenne, 0);
  const ecartMensuel = epargneActuelleMensuelle - montantMensuelNecessaire;

  let statut: ObjectifAnalysisResult["statut"] = "en-bonne-voie";
  if (objectif.totalCotisations >= objectif.montantCible) {
    statut = "atteint";
  } else if (ecartMensuel < 0 && epargneActuelleMensuelle <= 0) {
    statut = "impossible";
  } else if (ecartMensuel < 0) {
    statut = "en-retard";
  }

  const dateProjetee =
    epargneActuelleMensuelle > 0
      ? new Date(
          Date.now() +
            (objectif.montantRestant / epargneActuelleMensuelle) * 30 * 24 * 60 * 60 * 1000
        ).toISOString()
      : null;

  const topCategorie = stats.depensesParCategorie[0];

  const conseils: Conseil[] = [];

  if (statut === "atteint") {
    conseils.push({
      type: "positif",
      titre: "Objectif atteint",
      message: "Félicitations ! Vous avez atteint votre objectif d'épargne. Pensez à définir un nouveau défi.",
    });
  } else if (statut === "en-bonne-voie") {
    conseils.push({
      type: "positif",
      titre: "Bon rythme",
      message: `Vous êtes sur la bonne voie. À ce rythme, vous atteindrez votre objectif avant l'échéance.`,
    });
    if (topCategorie) {
      conseils.push({
        type: "reduction",
        titre: "Optimisation possible",
        message: `Votre plus grande dépense est "${topCategorie.categorie}" (${topCategorie.pourcentage}% du total). Une légère réduction accélérerait encore l'atteinte de votre objectif.`,
      });
    }
  } else if (statut === "en-retard") {
    const manque = Math.round(Math.abs(ecartMensuel));
    conseils.push({
      type: "alerte",
      titre: "Écart mensuel",
      message: `Il vous manque environ ${manque} MAD d'épargne chaque mois pour tenir les délais.`,
    });
    if (topCategorie && topCategorie.pourcentage > 20) {
      const reductionSuggeree = Math.round((manque / topCategorie.montant) * 100);
      conseils.push({
        type: "reduction",
        titre: `Réduire "${topCategorie.categorie}"`,
        message: `Cette catégorie représente ${topCategorie.pourcentage}% de vos dépenses. Une réduction d'environ ${reductionSuggeree}% comblerait l'écart.`,
      });
    }
    conseils.push({
      type: "augmentation",
      titre: "Revenus complémentaires",
      message: "Envisagez une source de revenus supplémentaire ou la revente d'objets inutilisés pour accélérer l'épargne.",
    });
  } else {
    conseils.push({
      type: "alerte",
      titre: "Objectif irréaliste au rythme actuel",
      message: "Vos dépenses actuelles dépassent ou égalent vos revenus. Il est nécessaire de revoir votre budget avant de poursuivre cet objectif.",
    });
    conseils.push({
      type: "reduction",
      titre: "Revoir les dépenses",
      message: "Identifiez les catégories non-essentielles et fixez-vous un budget mensuel strict.",
    });
  }

  return {
    statut,
    resume: `Pour atteindre "${objectif.nom}", vous devez épargner environ ${Math.round(
      montantMensuelNecessaire
    )} MAD par mois. Votre épargne actuelle moyenne est de ${Math.round(
      epargneActuelleMensuelle
    )} MAD/mois.`,
    montantMensuelNecessaire: Math.round(montantMensuelNecessaire),
    epargneActuelleMensuelle: Math.round(epargneActuelleMensuelle),
    ecartMensuel: Math.round(ecartMensuel),
    dateProjetee,
    conseils,
    source: "mock",
  };
}

// ─────────────────────────────────────────────────────────────
// Real AI call (Claude Haiku)
// ─────────────────────────────────────────────────────────────
async function callClaudeAnalysis(
  input: ObjectifAnalysisInput
): Promise<ObjectifAnalysisResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Fallback to mock if key missing at runtime
    return buildMockAnalysis(input);
  }

  const client = new Anthropic({ apiKey });

  const { objectif, stats } = input;

  // Pre-compute the baseline numbers so the AI only handles the advice
  const base = buildMockAnalysis(input);

  const systemPrompt = `Tu es un conseiller financier personnel pour une application de budget marocaine (MAD).
Tu dois analyser la situation d'un utilisateur et donner 2 à 4 conseils concrets, bienveillants et actionnables en français.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, selon le schéma fourni.`;

  const userPrompt = `Analyse cet objectif d'épargne :

OBJECTIF
- Nom: ${objectif.nom}
- Montant cible: ${objectif.montantCible} MAD
- Déjà épargné: ${objectif.totalCotisations} MAD
- Restant: ${objectif.montantRestant} MAD
- Période: ${objectif.dateDebut} → ${objectif.dateFin} (${stats.moisRestants} mois restants)

SITUATION FINANCIÈRE MENSUELLE (moyennes sur 6 mois)
- Revenus: ${stats.revenuMensuelMoyen} MAD
- Dépenses: ${stats.depenseMensuelleMoyenne} MAD
- Épargne: ${stats.epargneMensuelleMoyenne} MAD
- Taux d'épargne: ${stats.tauxEpargne}%

TOP DÉPENSES PAR CATÉGORIE
${stats.depensesParCategorie
  .slice(0, 5)
  .map((c) => `- ${c.categorie}: ${c.montant} MAD (${c.pourcentage}%)`)
  .join("\n")}

CALCUL DE BASE
- Épargne mensuelle nécessaire: ${base.montantMensuelNecessaire} MAD
- Épargne actuelle: ${base.epargneActuelleMensuelle} MAD/mois
- Écart mensuel: ${base.ecartMensuel} MAD
- Statut: ${base.statut}

Réponds avec ce JSON exact :
{
  "resume": "phrase courte résumant la situation (1-2 phrases max)",
  "conseils": [
    {
      "type": "reduction" | "augmentation" | "alerte" | "positif",
      "titre": "titre court (max 5 mots)",
      "message": "conseil concret et chiffré si possible (1-2 phrases)"
    }
  ]
}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    return base;
  }

  try {
    // Strip any accidental markdown fencing
    const cleaned = textBlock.text
      .replace(/^```(?:json)?/i, "")
      .replace(/```$/, "")
      .trim();
    const parsed = JSON.parse(cleaned);

    return {
      ...base,
      resume: parsed.resume || base.resume,
      conseils: Array.isArray(parsed.conseils) && parsed.conseils.length > 0
        ? parsed.conseils
        : base.conseils,
      source: "ai",
    };
  } catch (err) {
    console.error("AI JSON parse error:", err);
    return base;
  }
}

// ─────────────────────────────────────────────────────────────
// Public entry point
// ─────────────────────────────────────────────────────────────
export async function analyzeObjectif(
  input: ObjectifAnalysisInput
): Promise<ObjectifAnalysisResult> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await callClaudeAnalysis(input);
    } catch (err) {
      console.error("AI call failed, falling back to mock:", err);
      return buildMockAnalysis(input);
    }
  }
  return buildMockAnalysis(input);
}

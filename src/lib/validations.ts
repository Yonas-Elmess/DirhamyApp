import { z } from "zod";

export const registerSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const revenuSchema = z.object({
  montant: z.number().positive("Le montant doit être positif"),
  date: z.string().min(1, "La date est requise"),
  description: z.string().optional(),
});

export const depenseSchema = z.object({
  montant: z.number().positive("Le montant doit être positif"),
  date: z.string().min(1, "La date est requise"),
  description: z.string().optional(),
  categorieId: z.string().optional(),
});

export const categorieSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  icone: z.string().optional(),
  couleur: z.string().optional(),
});

export const budgetSchema = z.object({
  montant: z.number().positive("Le montant doit être positif"),
  mois: z.number().min(1).max(12),
  annee: z.number().min(2020).max(2100),
});

export const objectifSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  montantCible: z.number().positive("Le montant cible doit être positif"),
  dateDebut: z.string().min(1, "La date de début est requise"),
  dateFin: z.string().min(1, "La date de fin est requise"),
});

export const cotisationSchema = z.object({
  montant: z.number().positive("Le montant doit être positif"),
  date: z.string().min(1, "La date est requise"),
  objectifId: z.string().min(1, "L'objectif est requis"),
});

export const profilSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
  newPassword: z
    .string()
    .min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
});

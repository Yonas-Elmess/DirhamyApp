# DirhamyApp 💰

A full-stack personal budget management web application built for Moroccan users — track income, expenses, budgets, and savings goals, with an AI-powered financial analysis feature.

> 🔗 **[Live Demo](https://dirhamy-app.vercel.app

---

## Features

- **Dashboard** — income/expense overview, 6-month bar chart, category pie chart, recent transactions, savings goals progress
- **Expenses & Income** — full CRUD with category filtering and totals
- **Monthly Budget** — set and track monthly budgets with status indicators (on track / warning / exceeded)
- **Categories** — custom emoji + color categories, 10 global defaults seeded
- **Savings Goals** — create goals, log contributions, track progress with projected completion dates
- **AI Analysis** — Claude AI analyzes your savings goals and returns actionable advice, required monthly savings, and a projected completion date
- **Transaction History** — unified view of all income and expenses
- **Authentication** — JWT-based auth with httpOnly cookies, protected routes via middleware

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14.2 (App Router) |
| Language | TypeScript 5.4 |
| Styling | Tailwind CSS 3.4 |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 5.14 |
| Auth | JWT + bcryptjs |
| Validation | Zod 3.23 |
| Charts | Recharts |
| AI | Anthropic Claude API (claude-haiku-4-5) |
| Deployment | Vercel |

---

## AI Integration

Powered by **Anthropic Claude (claude-haiku-4-5)**. Triggered per savings goal via `POST /api/objectifs/[id]/analyze`.

**Input:** goal metrics + 6-month financial averages (income, expenses, savings rate)

**Output:**
- Goal status: `atteint` / `en-bonne-voie` / `en-retard` / `impossible`
- French summary of the financial situation
- Required monthly savings amount
- Projected completion date
- 2–4 actionable advice items (reduction, augmentation, alerte, positif)

Fallback mock mode available for local development without an API key.

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login + Register
│   ├── api/             # REST API routes (auth, revenus, depenses,
│   │                    #   categories, budgets, objectifs, stats...)
│   ├── dashboard/
│   ├── depenses/
│   ├── revenus/
│   ├── budget/
│   ├── categories/
│   ├── objectifs/
│   ├── historique/
│   └── profil/
├── components/
│   ├── layout/          # AppLayout, Sidebar, Header
│   ├── charts/          # BarChart, PieChart
│   └── ui/              # Modal, StatCard, AIAnalysisModal, etc.
├── lib/
│   ├── ai.ts            # Claude API integration
│   ├── auth.ts          # JWT + password utils
│   ├── prisma.ts        # Prisma singleton
│   └── validations.ts   # Zod schemas
└── middleware.ts         # Route protection
```

---

## Getting Started

### Requirements
- Node.js 18+
- PostgreSQL database (or a free [Neon](https://neon.tech) instance)
- Anthropic API key (optional — falls back to mock mode)

### Setup

```bash
git clone https://github.com/Yonas-Elmess/DirhamyApp
cd DirhamyApp
npm install
```

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/dbname?sslmode=require"
JWT_SECRET="your-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ANTHROPIC_API_KEY="sk-ant-..."   # optional
```

```bash
npx prisma db push        # create tables
npx prisma db seed        # seed default categories
npm run dev               # start dev server
```

---

## Localization

- **Language:** French throughout (UI, API responses, error messages)
- **Currency:** Moroccan Dirham (MAD)
- **Date format:** dd/MM/yyyy
- **Target audience:** Moroccan users managing personal finances

---

## Project Context

Built as a 1ère année cycle ingénieur PFA (Projet de Fin d'Année) at ISGA (2025–2026).  
Currently in active development.

---

## License

MIT

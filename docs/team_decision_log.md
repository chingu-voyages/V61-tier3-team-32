# Team Decision Log

Key decisions made by Team 32 during Chingu Voyage 61.

| No. | Question / Decision | Answer / Decision Made |
| :--- | :--- | :--- |
| 1 | **Project** | ✅ FoodRescue — connecting surplus food to people who need it |
| 2 | **Tech Stack — Frontend** | React + Tailwind CSS |
| 3 | **Tech Stack — Backend** | Node.js + Express |
| 4 | **Tech Stack — Database** | PostgreSQL + Prisma ORM |
| 5 | **Tech Stack — Auth** | JWT + bcrypt (stateless, no vendor lock-in) |
| 6 | **Tech Stack — Real-time** | Supabase Realtime (Serverless-compatible) |
| 7 | **Tech Stack — Maps** | Leaflet.js (free, no billing surprises) |
| 8 | **Tech Stack — File Uploads** | Cloudinary (free tier, CDN delivery) |
| 9 | **Tech Stack — AI (optional)** | Anthropic Claude API (food auto-categorisation) |
| 10 | **Frontend Hosting** | Vercel (Git-integrated, free, instant previews) |
| 11 | **Backend Hosting** | Supabase (managed PostgreSQL available) |
| 12 | **Repo Organisation** | Monorepo — `client/` + `server/` in one repo |
| 13 | **Team Roles** | Daniele — PM / Jedi Initiate; Jonathan — Frontend Lead; David — Backend Lead; Anderson — Backend/Data |
| 14 | **Git Strategy** | `main` (prod) → `dev` (integration) → `feature/*`, `fix/*`, `chore/*` |
| 15 | **Definition of Done** | Code reviewed by ≥1 teammate, no lint errors in CI, works on mobile + desktop, correct API status codes, merged to `dev` with green preview |
| 16 | **Cron Job Frequency** | Every 5 minutes — auto-expire listings past `expiresAt` |
| 17 | **JWT Expiry** | 7 days (refresh strategy deferred to v1.1) |
| 18 | **Image Upload Limit** | 5MB max, compressed client-side before upload |
| 19 | **Out of Scope (v1.0)** | Payments, native mobile app, multi-language, admin panel, social sharing |
| 20 | **Sprint Duration** | 6 weeks (June 2026) |
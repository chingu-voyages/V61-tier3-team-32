# FoodRescue

> **Tagline**: Don't waste it. Share it.  
> **Chingu Voyage 61 — Tier 3 — Team 32**

FoodRescue is a real-time platform that connects **food donors** (restaurants, bakeries, caterers) with **claimers** (individuals, food banks, charities) to redistribute surplus food before it expires.

## Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS (Hosted on Vercel)
- **Backend**: Node.js + Express (Hosted as Vercel Serverless Functions)
- **Database**: PostgreSQL + Prisma (Hosted on Supabase)
- **Authentication**: Custom JWT + bcrypt
- **Real-time**: Supabase Realtime
- **Maps**: Leaflet.js
- **File Uploads**: Cloudinary

## Local Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd V61-tier3-team-32
   ```

2. **Install all dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Variables**
   Copy `.env.example` to `.env` in the root and fill in your Supabase connection string and other secrets.
   Also, create a `.env` in the `server` folder.

4. **Database Setup**
   ```bash
   cd server
   npx prisma generate
   npx prisma migrate dev
   cd ..
   ```

5. **Run the App (Client + Server)**
   ```bash
   npm run dev
   ```
   - Client runs on `http://localhost:5173`
   - Server runs on `http://localhost:5000`

## The Team
- Daniele Kafriyie: [GitHub](https://github.com/dk-afriyie) / [LinkedIn](https://linkedin.com/in/danielkafriyie/)
- Jonathan: [GitHub](https://github.com/jnini2076e)  / [LinkedIn](www.linkedin.com/in/jonathan-padilla7/)
- David Akanang: [GitHub](https://github.com/DavidBugger) / [LinkedIn](https://linkedin.com/in/david-akanang-0789771a4)
- Anderson Osayerie: [GitHub](https://github.com/andersonosayerie) / [LinkedIn](https://linkedin.com/in/anderson-osayerie)
- Ruthigwe Oruta: [GitHub](https://github.com/Xondacc) / [LinkedIn](https://linkedin.com/in/ruthigwe-oruta)
- Alwin Puche: [GitHub](https://github.com/awyyyn) / [LinkedIn](https://linkedin.com/in/alwin-puche-7295851b7/)
- Bathshua: [GitHub](https://github.com/bathshuabradley) / [LinkedIn](https://linkedin.com/in/Awsomgal/)



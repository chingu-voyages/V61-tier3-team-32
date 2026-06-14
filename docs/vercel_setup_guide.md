# Vercel Deployment Guide

Since FoodRescue is a **Monorepo** (it contains both a `client` folder for the frontend and a `server` folder for the backend in the same repository), we need to deploy them as **two separate projects** in Vercel. 

Here is the step-by-step guide to get both parts of the app live.

---

## Part 1: Deploying the Frontend (React + Vite)

1. Go to [Vercel.com](https://vercel.com/) and log in with your GitHub account.
2. Click **Add New** -> **Project**.
3. Import your `V61-tier3-team-32` repository from GitHub.
4. **Important Configurations:**
   - **Project Name:** `foodrescue-client` (or similar)
   - **Framework Preset:** Vite
   - **Root Directory:** Click "Edit" and select the `client` folder.
5. **Environment Variables:**
   - Expand the Environment Variables section.
   - Add `VITE_API_URL`. (For now, you can leave the value blank or point it to your future backend URL, e.g., `https://foodrescue-server.vercel.app/api`).
6. Click **Deploy**.
7. Once finished, Vercel will give you a live URL for your React app!

---

## Part 2: Deploying the Backend (Node.js + Express)

To host our Express backend on Vercel, we will deploy it as **Serverless Functions**.

1. Go back to the Vercel dashboard and click **Add New** -> **Project**.
2. Import the exact same `V61-tier3-team-32` repository again.
3. **Important Configurations:**
   - **Project Name:** `foodrescue-server` (or similar)
   - **Framework Preset:** Other
   - **Root Directory:** Click "Edit" and select the `server` folder.
   - **Build Command:** `npm install && npx prisma generate`
4. **Environment Variables:**
   - Expand the Environment Variables section and add all your backend secrets:
     - `DATABASE_URL` (Your Supabase Pooler URL, exactly as it is in your local `.env`)
     - `JWT_SECRET`
     - `JWT_EXPIRES_IN` (e.g., `7d`)
     - `CLIENT_URL` (Set this to the live URL of the frontend you deployed in Part 1. This allows CORS to work so your frontend can talk to your backend).
     - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
5. Click **Deploy**.

---

## ⚠️ Required Code Changes Before Backend Deployment

Before the backend will successfully run on Vercel, a developer needs to make a tiny tweak to the server code. Vercel expects serverless functions to be exported, rather than running a persistent `.listen()` server.

**When you are ready to deploy the backend, a developer needs to:**
1. Create a `vercel.json` file in the `server` folder to tell Vercel how to route traffic to Express.
2. Export the Express `app` instance at the bottom of `server/src/index.js` so Vercel can consume it.

*(If you want to handle this now, just let me know and I'll generate the `vercel.json` file and make the necessary tweaks to `index.js`!)*

---

## Part 3: Connecting the Two

Once both are deployed:
1. Copy the live URL of your **Server** deployment (e.g., `https://foodrescue-server.vercel.app`).
2. Go to your **Client** project in Vercel -> **Settings** -> **Environment Variables**.
3. Update the `VITE_API_URL` to point to your new server URL (e.g., `https://foodrescue-server.vercel.app/api`).
4. **Redeploy** the Client project so it picks up the new environment variable.

You're live! 🎉

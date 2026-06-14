# Manual Vercel Deployment Workflow

Because our team repository belongs to the `chingu-voyages` organization, Vercel requires a paid "Pro" plan to auto-deploy directly from it. 

To bypass this and keep our hosting free, we deploy our app through a **personal mirror repository**. Vercel is connected to that personal repository instead of the team organization.

When the team merges new features into the `development` (or `main`) branch of the official repo, Vercel will **not** automatically update. A developer must manually trigger the deployment by syncing the code to the personal mirror repository.

Here is the 2-step process to deploy the latest team updates:

---

## Step 1: Pull the latest team code
First, make sure your local codebase is completely up to date with the official team repository on GitHub.

```bash
# Make sure you are on the development branch
git checkout development

# Pull the latest changes from the team
git pull origin development
```

## Step 2: Push to the Personal Mirror Repo
Once you have the latest code locally, you push it to the `personal` remote (which is connected to Vercel). 

```bash
# Push your local development branch to the main branch of the personal repo
git push personal development:main
```

### What happens next?
The moment you run that push command, Vercel will detect the new code on your personal GitHub account and automatically begin building and deploying both the frontend and backend.

You can watch the deployment progress live on your Vercel Dashboard!

---

### ⚠️ One-Time Setup (If you haven't done this yet)
If you get an error saying `fatal: 'personal' does not appear to be a git repository`, it means you haven't added the personal remote to your computer yet. 

Run this command **once** to link it:
```bash
git remote add personal git@github.com:DavidBugger/foodrescue-deploy.git
```
Then try **Step 2** again!

# Luxury Clothings Store — Sanity.io Studio

This directory contains the complete **Sanity Studio v3** for managing the store catalog, promotions, site branding, and media.

---

## 🚀 How to Deploy to Sanity.io Studio

Sanity provides **free global cloud hosting** for your studio at `https://<your-subdomain>.sanity.studio`.

### Step 1: Install Dependencies
```bash
cd sanity-studio
npm install
```

### Step 2: Login to Sanity CLI
Authenticate your terminal with your Sanity account:
```bash
npx sanity login
```
*(This will open your browser to authorize with your Google, GitHub, or Email account)*.

### Step 3: Link or Create Project
If you already have a Sanity project:
```bash
# Add your Project ID to sanity.cli.js or set environment variable:
export SANITY_STUDIO_PROJECT_ID="your_project_id_here"
```

If you don't have one yet, run:
```bash
npx sanity init --bare
```

### Step 4: Deploy Live to Sanity Studio Hosting
```bash
npx sanity deploy
```
- It will prompt you for a studio hostname (e.g., `mens-clothing-store`).
- Sanity will compile and upload your Studio.
- Your Studio will be instantly live at:
  👉 **`https://mens-clothing-store.sanity.studio`**

---

## 📦 Data Migration (Seed from existing catalog)

To automatically migrate your existing catalog items into Sanity:
```bash
SANITY_PROJECT_ID="your_project_id" SANITY_API_TOKEN="your_write_token" node seed.js
```

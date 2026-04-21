# PTCL DC Assessment Portal – Deployment Guide

## 🚀 Deploy on Render.com (Free – No Credit Card)

### Step 1 — Push to GitHub
1. Create a new **private** GitHub repository (e.g. `ptcl-dc-quiz`)
2. Upload all files from this folder into the repo root:
   - `index.html`
   - `server.js`
   - `package.json`
   - `render.yaml`
   - `.gitignore`
   - `.env.example`
3. Do **NOT** upload `.env` (it's gitignored on purpose)

### Step 2 — Create Render Web Service
1. Go to **https://render.com** and sign in (free account)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account and select the repo
4. Render will auto-detect the `render.yaml` settings

### Step 3 — Set the Secret Email Password
1. In the Render dashboard for your service, go to **Environment**
2. Add the environment variable:
   - Key: `EMAIL_PASSWORD`
   - Value: `wivk ksfg eoqj dsgw`  ← your Gmail App Password
3. Click **Save** — Render will redeploy automatically

### Step 4 — Access Your Live URL
Render gives you a free URL like:
```
https://ptcl-dc-assessment.onrender.com
```
Share this URL with your team. The quiz is fully functional.

---

## 🔧 Run Locally

```bash
# Install dependencies
npm install

# Create .env from template
cp .env.example .env
# Edit .env and set your Gmail App Password

# Start server
npm start

# Open in browser
http://localhost:3000
```

---

## ✅ Changes Made (Bug Fixes)

| Issue | Fix |
|-------|-----|
| `index.html` hardcoded `http://localhost:3000/send-result` | Changed to relative `/send-result` — works on any host |
| Email password hardcoded in `server.js` | Moved to `process.env.EMAIL_PASSWORD` |
| No input validation on `/send-result` | Added basic 400 check for missing fields |
| Wrong HTML filename in server console log | Fixed to just show `http://localhost:PORT/` |
| No health check endpoint | Added `GET /health` for Render uptime monitoring |
| `dotenv` not in dependencies | Added to `package.json` |
| No Node engine version specified | Added `"engines": {"node": ">=18.0.0"}` |

---

## ⚠️ Security Note
Your Gmail App Password (`wivk ksfg eoqj dsgw`) should only live in Render's
environment variables dashboard, never in any file committed to GitHub.

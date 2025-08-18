# PermitPulse — Vercel-ready Site

A clean React + Vite + Tailwind landing page wired to your n8n signup webhook.

**Webhook:** `https://hudsonsawyer.app.n8n.cloud/webhook/signup`

## Local Dev
```bash
npm install
npm run dev
```

## Deploy on Vercel
1. Push this folder to a new GitHub repo.
2. Go to https://vercel.com → **New Project** → Import your repo.
3. Vercel will auto-detect Vite.
   - Build command: `npm run build`
   - Output: `dist`
4. Click **Deploy**.

### n8n CORS
If the browser blocks the request, add these headers to your **Respond to Webhook** node:
- `Access-Control-Allow-Origin: *`
- `Access-Control-Allow-Methods: POST, OPTIONS`

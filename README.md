# PermitPulse — Vercel-ready Site

A clean React + Vite + Tailwind landing page with a Vercel Edge proxy to n8n.cloud.

## Local Dev
```bash
npm install
npm run dev
```

## Vercel + n8n Proxy
This repo includes an Edge Function `api/n8n-proxy.ts` and a frontend helper `src/lib/n8nClient.js`.
The proxy forwards JSON to your n8n Webhook while keeping your webhook URL private and solving CORS.

### Required Environment Variables (Vercel → Project Settings → Environment Variables)
- N8N_BASE_URL = https://YOUR-SUBDOMAIN.n8n.cloud
- N8N_PROXY_SECRET = a long random string
- (optional) N8N_AUTH_HEADER = e.g. `Basic base64(user:pass)`
- (optional) N8N_WEBHOOK_PATH = default webhook path like `signup`
- (optional) N8N_WEBHOOK_PREFIX = webhook or webhook-test (defaults to webhook)

### Frontend Env (local .env.local and Vercel with VITE_ prefix)
- VITE_PROXY_PATH = /api/n8n-proxy
- VITE_N8N_PROXY_SECRET = same value as N8N_PROXY_SECRET

### Usage from the frontend
```
import { callN8n } from './src/lib/n8nClient'
await callN8n('signup', { email, company, phone })
```

## Deploy on Vercel
1. Push to GitHub (already done).
2. In Vercel: New Project → Import this repo.
3. Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add the environment variables above in Vercel.
5. Deploy.

## Stripe + Email (Resend)
Serverless functions:
- POST /api/checkout → creates a Stripe Checkout session
- POST /api/stripe-webhook → receives Stripe webhooks; on checkout.session.completed, sends welcome email via Resend

Environment variables (Vercel → Settings → Environment Variables):
- STRIPE_SECRET_KEY = sk_test_...
- STRIPE_PRICE_ID = price_...
- STRIPE_WEBHOOK_SECRET = whsec_... (from Stripe webhook settings)
- RESEND_API_KEY = re_... (optional, if you want email)
- APP_URL = https://YOUR_DOMAIN.vercel.app

Frontend flow:
- After signup, POST to /api/checkout with { customer_email, metadata }, then redirect to returned url.

Stripe Dashboard setup:
- Create Product+Price → copy Price ID
- Developers → Webhooks → Add endpoint → https://YOUR_DOMAIN/api/stripe-webhook → select checkout.session.completed → copy Signing secret → put into STRIPE_WEBHOOK_SECRET.

## Notes
If you call n8n directly from the browser, you may hit CORS. The proxy avoids that and lets you add auth and rate limits.

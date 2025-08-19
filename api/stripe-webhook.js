// Vercel Serverless Function (Node runtime) to receive Stripe webhooks
// Set STRIPE_WEBHOOK_SECRET in Vercel. Optionally set RESEND_API_KEY to send a welcome email.

import Stripe from 'stripe'

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body for signature verification
  },
}

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' })
  const sig = req.headers['stripe-signature']
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    return res.status(500).json({ error: 'Missing STRIPE_WEBHOOK_SECRET' })
  }

  let event
  try {
    const buf = await buffer(req)
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const email = session.customer_details?.email
        // Optionally send welcome email via Resend
        if (process.env.RESEND_API_KEY && email) {
          const { Resend } = await import('resend')
          const resend = new Resend(process.env.RESEND_API_KEY)
          await resend.emails.send({
            from: 'PermitPulse <hello@permitpulse.com>',
            to: email,
            subject: 'Welcome to PermitPulse',
            text: 'Thanks for subscribing! Your daily permit digests start tomorrow at 7 AM.',
          })
        }
        break
      }
      default:
        // ignore other events for now
        break
    }

    res.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error', err)
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}


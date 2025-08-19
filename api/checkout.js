// Vercel Serverless Function (Node runtime) to create a Stripe Checkout Session
// Expects env: STRIPE_SECRET_KEY, STRIPE_PRICE_ID, APP_URL

import Stripe from 'stripe'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY
  const priceId = process.env.STRIPE_PRICE_ID
  const appUrl = process.env.APP_URL || (req.headers.origin || '').replace(/\/$/, '')

  if (!stripeKey || !priceId) {
    return res.status(500).json({ error: 'Server not configured. Missing STRIPE_SECRET_KEY or STRIPE_PRICE_ID.' })
  }

  const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' })

  try {
    const { customer_email, metadata } = (req.body || {})

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${appUrl}/?checkout=success`,
      cancel_url: `${appUrl}/?checkout=cancel`,
      customer_email: customer_email,
      metadata: metadata || {},
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error', err)
    return res.status(500).json({ error: err.message || 'Checkout error' })
  }
}


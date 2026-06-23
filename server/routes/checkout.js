import express from 'express';
import Stripe from 'stripe';
import { db, newId } from '../db.js';

const router = express.Router();

// Stripe secret key lives ONLY here, on the server, read from an
// environment variable. It must never be sent to the browser.
// Initialized lazily so the rest of the app still works before a real
// key is configured (e.g. browsing products, admin panel).
let stripe = null;
function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });
  }
  return stripe;
}

// POST /api/checkout/create-session
// Body: { items: [{ productId, quantity }] }
// We re-look-up prices server-side from our own database — never trust
// prices sent from the browser, or anyone could pay $1 for a $2,000 watch.
router.post('/create-session', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  await db.read();

  const line_items = [];
  const orderItems = [];

  for (const { productId, quantity } of items) {
    const product = db.data.products.find((p) => p.id === productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${productId} no longer exists.` });
    }
    const qty = Math.max(1, Math.min(99, parseInt(quantity, 10) || 1));

    if (product.stock < qty) {
      return res.status(400).json({ error: `${product.name} only has ${product.stock} left in stock.` });
    }

    line_items.push({
      price_data: {
        currency: product.currency,
        product_data: {
          name: product.name,
          description: product.description?.slice(0, 300) || undefined,
          images: product.image ? [product.image] : undefined,
        },
        unit_amount: product.price,
      },
      quantity: qty,
    });

    orderItems.push({ productId, name: product.name, quantity: qty, price: product.price });
  }

  const orderId = newId();
  const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';

  const stripeClient = getStripe();
  if (!stripeClient) {
    return res.status(500).json({
      error: 'Stripe is not configured yet. Add STRIPE_SECRET_KEY to the server environment.',
    });
  }

  try {
    const session = await stripeClient.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items,
      success_url: `${origin}/order-confirmation?orderId=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: { orderId },
    });

    // Save a pending order; we'll mark it paid once Stripe confirms via webhook.
    db.data.orders.push({
      id: orderId,
      items: orderItems,
      total: orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0),
      status: 'pending',
      stripeSessionId: session.id,
      createdAt: new Date().toISOString(),
    });
    await db.write();

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe session creation failed:', err.message);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

// POST /api/checkout/webhook
// Stripe calls this directly when a payment completes. This is how we
// confirm payment actually succeeded — never trust the success_url redirect
// alone, since a user could land on it without actually paying.
// NOTE: this route needs the raw request body, configured in server.js.
router.post('/webhook', async (req, res) => {
  const stripeClient = getStripe();
  if (!stripeClient) {
    return res.status(500).send('Stripe is not configured on this server.');
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    if (webhookSecret) {
      event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    } else {
      // Webhook secret not yet configured (e.g. local dev) — parse directly.
      // Do this only for local testing; always set the secret in production.
      event = JSON.parse(req.body.toString());
    }
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send('Webhook signature verification failed.');
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    await db.read();
    const order = db.data.orders.find((o) => o.id === orderId);
    if (order && order.status !== 'paid') {
      order.status = 'paid';
      order.paidAt = new Date().toISOString();

      // Decrement stock now that payment is confirmed.
      for (const item of order.items) {
        const product = db.data.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      }
      await db.write();
    }
  }

  res.json({ received: true });
});

// GET /api/checkout/order/:orderId — used by the confirmation page
router.get('/order/:orderId', async (req, res) => {
  await db.read();
  const order = db.data.orders.find((o) => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json(order);
});

export default router;

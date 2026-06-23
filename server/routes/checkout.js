import express from 'express';
import { db, newId } from '../db.js';
import crypto from 'crypto';

const router = express.Router();

// POST /api/checkout/create-session
router.post('/create-session', async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty.' });
  }

  await db.read();

  const orderItems = [];
  let total = 0;

  for (const { productId, quantity } of items) {
    const product = db.data.products.find((p) => p.id === productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${productId} no longer exists.` });
    }

    const qty = Math.max(1, Math.min(99, parseInt(quantity, 10) || 1));

    if (product.stock < qty) {
      return res.status(400).json({
        error: `${product.name} only has ${product.stock} left in stock.`,
      });
    }

    orderItems.push({ productId, name: product.name, quantity: qty, price: product.price });
    total += product.price * qty;
  }

  const orderId = newId();
  const origin = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';

  // Check if Safepay is configured
  const safepayKey = process.env.SAFEPAY_SECRET_KEY;
  const safepayEnv = process.env.SAFEPAY_ENV || 'sandbox';

  if (!safepayKey) {
    return res.status(500).json({
      error: 'Safepay is not configured yet. Add SAFEPAY_SECRET_KEY to the server environment.',
    });
  }

  try {
    // Create Safepay payment tracker
    const safepayBaseUrl = safepayEnv === 'production'
      ? 'https://api.getsafepay.com'
      : 'https://sandbox.api.getsafepay.com';

    const trackerResponse = await fetch(`${safepayBaseUrl}/order/v1/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${safepayKey}`,
      },
      body: JSON.stringify({
        currency: 'PKR',
        amount: Math.round(total * 100), // amount in paisa
        order_id: orderId,
      }),
    });

    const trackerData = await trackerResponse.json();

    if (!trackerData.data?.tracker?.token) {
      throw new Error('Failed to create Safepay tracker');
    }

    const trackerToken = trackerData.data.tracker.token;

    // Save pending order
    db.data.orders.push({
      id: orderId,
      items: orderItems,
      total,
      status: 'pending',
      safepayTracker: trackerToken,
      createdAt: new Date().toISOString(),
    });
    await db.write();

    // Build Safepay checkout URL
    const safepayCheckoutBase = safepayEnv === 'production'
      ? 'https://getsafepay.com'
      : 'https://sandbox.getsafepay.com';

    const checkoutUrl = `${safepayCheckoutBase}/checkout/pay/${trackerToken}?order_id=${orderId}&success_url=${origin}/order-confirmation?orderId=${orderId}&cancel_url=${origin}/cart`;

    res.json({ url: checkoutUrl });
  } catch (err) {
    console.error('Safepay session creation failed:', err.message);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

// POST /api/checkout/webhook
router.post('/webhook', express.json(), async (req, res) => {
  const safepayKey = process.env.SAFEPAY_SECRET_KEY;
  if (!safepayKey) return res.status(500).send('Safepay not configured.');

  try {
    const { tracker, order_id } = req.body;

    if (!tracker || !order_id) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    await db.read();
    const order = db.data.orders.find((o) => o.id === order_id);

    if (order && order.status !== 'paid') {
      order.status = 'paid';
      order.paidAt = new Date().toISOString();

      // Decrement stock
      for (const item of order.items) {
        const product = db.data.products.find((p) => p.id === item.productId);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
        }
      }

      await db.write();
      // Send confirmation email
      try {
        const { sendOrderConfirmationEmail } = await import('../email.js');
        await sendOrderConfirmationEmail(
          order,
          order.customerEmail || 'customer@example.com',
          order.customerName || 'Valued Customer'
        );
      } catch (e) {
        console.error('Email error:', e.message);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/checkout/order/:orderId
router.get('/order/:orderId', async (req, res) => {
  await db.read();
  const order = db.data.orders.find((o) => o.id === req.params.orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }
  res.json(order);
});

export default router;

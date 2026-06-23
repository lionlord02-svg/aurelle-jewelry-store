import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db.js';

import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import checkoutRouter from './routes/checkout.js';
import ordersRouter from './routes/orders.js';
import adminRouter from './routes/admin.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));

// The Stripe webhook route needs the RAW request body (to verify the
// signature), so it must be registered before express.json() runs.
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
// Centralized error handler — keeps internal error details out of responses
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our end. Please try again.' });
});

async function start() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();

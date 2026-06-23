import express from 'express';
import { db } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = express.Router();

// GET /api/orders — admin only, most recent first
router.get('/', requireAdmin, async (req, res) => {
  await db.read();
  const orders = [...db.data.orders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
  res.json(orders);
});

export default router;

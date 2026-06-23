import express from 'express';
import { db, newId } from '../db.js';
import { requireAdmin } from '../auth.js';

const router = express.Router();

const VALID_CATEGORIES = ['jewelry', 'watches', 'bags', 'wallets'];

// GET /api/products — public, supports ?category= filter
router.get('/', async (req, res) => {
  await db.read();
  const { category, featured } = req.query;
  let items = db.data.products;

  if (category) {
    items = items.filter((p) => p.category === category);
  }
  if (featured === 'true') {
    items = items.filter((p) => p.featured);
  }

  res.json(items);
});

// GET /api/products/:id — public
router.get('/:id', async (req, res) => {
  await db.read();
  const product = db.data.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(product);
});

// POST /api/products — admin only
router.post('/', requireAdmin, async (req, res) => {
  const { name, description, price, currency, category, image, stock, featured } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required.' });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'Price must be a positive number, in cents.' });
  }

  await db.read();
  const product = {
    id: newId(),
    name,
    description: description || '',
    price,
    currency: currency || 'usd',
    category,
    image: image || '',
    stock: typeof stock === 'number' ? stock : 0,
    featured: !!featured,
  };
  db.data.products.push(product);
  await db.write();

  res.status(201).json(product);
});

// PUT /api/products/:id — admin only
router.put('/:id', requireAdmin, async (req, res) => {
  await db.read();
  const idx = db.data.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const { name, description, price, currency, category, image, stock, featured } = req.body;

  if (category && !VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }
  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    return res.status(400).json({ error: 'Price must be a positive number, in cents.' });
  }

  const existing = db.data.products[idx];
  db.data.products[idx] = {
    ...existing,
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(price !== undefined && { price }),
    ...(currency !== undefined && { currency }),
    ...(category !== undefined && { category }),
    ...(image !== undefined && { image }),
    ...(stock !== undefined && { stock }),
    ...(featured !== undefined && { featured: !!featured }),
  };
  await db.write();

  res.json(db.data.products[idx]);
});

// DELETE /api/products/:id — admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  await db.read();
  const idx = db.data.products.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  const [removed] = db.data.products.splice(idx, 1);
  await db.write();
  res.json({ deleted: removed.id });
});

export default router;

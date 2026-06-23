import express from 'express';
import { db, newId } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();

const requireAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (!decoded.isAdmin) return res.status(403).json({ error: 'Not admin' });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Setup first admin
router.post('/setup', async (req, res) => {
  try {
    await db.read();
    if (db.data.admin) return res.status(400).json({ error: 'Admin already exists' });
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    db.data.admin = { email, password: hash };
    await db.write();
    res.json({ success: true, message: 'Admin created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    await db.read();
    const { email, password } = req.body;
    const admin = db.data.admin;
    if (!admin || admin.email !== email)
      return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign(
      { email: admin.email, isAdmin: true },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products
router.get('/products', requireAdmin, async (req, res) => {
  await db.read();
  res.json(db.data.products);
});

// Add product
router.post('/products', requireAdmin, async (req, res) => {
  await db.read();
  const { name, description, price, category, image_url, stock } = req.body;
  const product = { id: newId(), name, description, price, category, image_url, stock: stock || 0 };
  db.data.products.push(product);
  await db.write();
  res.json({ product, message: 'Product added!' });
});

// Update product
router.put('/products/:id', requireAdmin, async (req, res) => {
  await db.read();
  const index = db.data.products.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Product not found' });
  db.data.products[index] = { ...db.data.products[index], ...req.body };
  await db.write();
  res.json({ message: 'Product updated!' });
});

// Delete product
router.delete('/products/:id', requireAdmin, async (req, res) => {
  await db.read();
  db.data.products = db.data.products.filter(p => p.id !== req.params.id);
  await db.write();
  res.json({ message: 'Product deleted!' });
});

// Get all orders
router.get('/orders', requireAdmin, async (req, res) => {
  await db.read();
  res.json(db.data.orders);
});

// Update order status
router.put('/orders/:id/status', requireAdmin, async (req, res) => {
  await db.read();
  const order = db.data.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  order.status = req.body.status;
  await db.write();
  res.json({ message: 'Order updated!' });
});

export default router;

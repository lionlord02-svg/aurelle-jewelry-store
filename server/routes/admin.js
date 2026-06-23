import express from 'express';
import { getDb } from '../db.js';
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

// Setup first admin (only works if no admin exists)
router.post('/setup', async (req, res) => {
  try {
    const db = getDb();
    const existing = db.prepare('SELECT * FROM admins LIMIT 1').get();
    if (existing) return res.status(400).json({ error: 'Admin already exists' });
    const { email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    db.prepare('INSERT INTO admins (email, password) VALUES (?, ?)').run(email, hash);
    res.json({ success: true, message: 'Admin created!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin login
router.post('/login', async (req, res) => {
  try {
    const db = getDb();
    const { email, password } = req.body;
    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin.id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all products
router.get('/products', requireAdmin, (req, res) => {
  const db = getDb();
  const products = db.prepare('SELECT * FROM products ORDER BY created_at DESC').all();
  res.json(products);
});

// Add product
router.post('/products', requireAdmin, (req, res) => {
  const db = getDb();
  const { name, description, price, category, image_url, stock } = req.body;
  const result = db.prepare(
    'INSERT INTO products (name, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(name, description, price, category, image_url, stock || 0);
  res.json({ id: result.lastInsertRowid, message: 'Product added!' });
});

// Update product
router.put('/products/:id', requireAdmin, (req, res) => {
  const db = getDb();
  const { name, description, price, category, image_url, stock } = req.body;
  db.prepare(
    'UPDATE products SET name=?, description=?, price=?, category=?, image_url=?, stock=? WHERE id=?'
  ).run(name, description, price, category, image_url, stock, req.params.id);
  res.json({ message: 'Product updated!' });
});

// Delete product
router.delete('/products/:id', requireAdmin, (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ message: 'Product deleted!' });
});

// Get all orders
router.get('/orders', requireAdmin, (req, res) => {
  const db = getDb();
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders);
});

// Update order status
router.put('/orders/:id/status', requireAdmin, (req, res) => {
  const db = getDb();
  db.prepare('UPDATE orders SET status=? WHERE id=?').run(req.body.status, req.params.id);
  res.json({ message: 'Order updated!' });
});

export default router;

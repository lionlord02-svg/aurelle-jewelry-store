import express from 'express';
import { db } from '../db.js';
import { hashPassword, verifyPassword, signToken, requireAdmin } from '../auth.js';

const router = express.Router();

// POST /api/auth/setup — one-time: create the admin account.
// Only works if no admin exists yet, so it can't be used to take over later.
router.post('/setup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  await db.read();
  if (db.data.admin) {
    return res.status(403).json({ error: 'Admin account already exists.' });
  }

  const passwordHash = await hashPassword(password);
  db.data.admin = { username, passwordHash };
  await db.write();

  res.status(201).json({ message: 'Admin account created. You can now log in.' });
});

// GET /api/auth/setup-status — lets the frontend know if setup is needed
router.get('/setup-status', async (req, res) => {
  await db.read();
  res.json({ needsSetup: !db.data.admin });
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  await db.read();

  if (!db.data.admin) {
    return res.status(400).json({ error: 'No admin account exists yet. Complete setup first.' });
  }
  if (username !== db.data.admin.username) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  const valid = await verifyPassword(password, db.data.admin.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  const token = signToken({ role: 'admin', username });
  res.json({ token });
});

// GET /api/auth/me — verify current token is valid
router.get('/me', requireAdmin, async (req, res) => {
  res.json({ username: req.admin.username });
});


// POST /api/auth/register - Customer registration
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  await db.read();
  db.data.customers = db.data.customers || [];
  const exists = db.data.customers.find(c => c.email === email);
  if (exists) {
    return res.status(400).json({ error: 'Email already registered.' });
  }
  const passwordHash = await hashPassword(password);
  const customer = { id: Date.now().toString(), name, email, passwordHash, createdAt: new Date().toISOString() };
  db.data.customers.push(customer);
  await db.write();
  const token = signToken({ role: 'customer', id: customer.id, email, name });
  res.status(201).json({ token, user: { id: customer.id, name, email } });
});

// POST /api/auth/customer-login - Customer login
router.post('/customer-login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  await db.read();
  db.data.customers = db.data.customers || [];
  const customer = db.data.customers.find(c => c.email === email);
  if (!customer) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const valid = await verifyPassword(password, customer.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = signToken({ role: 'customer', id: customer.id, email, name: customer.name });
  res.json({ token, user: { id: customer.id, name: customer.name, email } });
});

export default router;

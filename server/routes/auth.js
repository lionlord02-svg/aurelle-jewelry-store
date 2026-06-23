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

export default router;

const express = require('express');
const bcrypt = require('bcryptjs');
const store = require('../services/store');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

function validate(email, password) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'A valid email address is required';
  if (!password || password.length < 6) return 'Password must be at least 6 characters';
  return null;
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    const error = validate(email, password);
    if (error) return res.status(400).json({ message: error });

    const existing = await store.findUserByEmail(email);
    if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await store.createUser({
      name: (name || email.split('@')[0]).trim(),
      email,
      passwordHash,
      role: 'supervisor'
    });
    const safe = store.toSafe(user);
    return res.status(201).json({ token: signToken(safe), user: safe });
  } catch (err) {
    return res.status(500).json({ message: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await store.findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const safe = store.toSafe(user);
    return res.json({ token: signToken(safe), user: safe });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  const user = await store.findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ user: store.toSafe(user) });
});

module.exports = router;

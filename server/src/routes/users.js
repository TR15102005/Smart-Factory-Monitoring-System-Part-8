const express = require('express');
const bcrypt = require('bcryptjs');
const store = require('../services/store');
const simulation = require('../services/simulation');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

router.get('/', async (req, res) => {
  const [users, workers, robots, incidents] = await Promise.all([
    store.listUsers(),
    store.list('workers'),
    store.list('robots'),
    store.list('incidents')
  ]);
  res.json({
    users,
    overview: {
      users: users.length,
      workers: workers.length,
      robots: robots.length,
      openIncidents: incidents.filter((i) => i.status === 'OPEN').length,
      robotUtilization: simulation.snapshot().summary.robotUtilization
    }
  });
});

router.post('/', async (req, res) => {
  const { name, email, password, role } = req.body || {};
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Valid name and email are required' });
  }
  if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
  const existing = await store.findUserByEmail(email);
  if (existing) return res.status(409).json({ message: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await store.createUser({
    name,
    email,
    passwordHash,
    role: role === 'admin' ? 'admin' : 'supervisor'
  });
  res.status(201).json({ user: store.toSafe(user) });
});

module.exports = router;

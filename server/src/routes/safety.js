const express = require('express');
const store = require('../services/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const DAY = 24 * 60 * 60 * 1000;

router.get('/incidents', async (req, res) => {
  const { status, severity } = req.query;
  let docs = await store.list('incidents', { createdAt: -1 });
  if (status) docs = docs.filter((d) => d.status === status);
  if (severity) docs = docs.filter((d) => d.severity === severity);
  const all = await store.list('incidents');
  const openHigh = all.filter((d) => d.status === 'OPEN' && d.severity === 'HIGH').length;
  res.json({ incidents: docs, meta: { openHigh, openTotal: all.filter((d) => d.status === 'OPEN').length } });
});

router.get('/incidents/stats', async (req, res) => {
  const docs = await store.list('incidents');
  const now = Date.now();

  const byZone = {};
  docs
    .filter((d) => now - new Date(d.createdAt).getTime() < 7 * DAY)
    .forEach((d) => { byZone[d.zone] = (byZone[d.zone] || 0) + 1; });

  const byDay = [];
  for (let i = 13; i >= 0; i -= 1) {
    const dayStart = new Date(now - i * DAY);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = dayStart.getTime() + DAY;
    const inDay = docs.filter((d) => {
      const t = new Date(d.createdAt).getTime();
      return t >= dayStart.getTime() && t < dayEnd;
    });
    byDay.push({
      label: dayStart.toISOString().slice(5, 10),
      HIGH: inDay.filter((d) => d.severity === 'HIGH').length,
      MEDIUM: inDay.filter((d) => d.severity === 'MEDIUM').length,
      LOW: inDay.filter((d) => d.severity === 'LOW').length
    });
  }

  res.json({ byZone, byDay });
});

router.post('/incidents', async (req, res) => {
  const { zone, type, severity, description } = req.body || {};
  if (!zone || !description) return res.status(400).json({ message: 'Zone and description are required' });
  const docs = await store.list('incidents');
  const nextNum = 2042 + docs.length;
  const doc = await store.create('incidents', {
    incidentId: `INC-${nextNum}`,
    zone,
    type: type || 'reported',
    severity: ['HIGH', 'MEDIUM', 'LOW'].includes(severity) ? severity : 'MEDIUM',
    description,
    status: 'OPEN',
    reportedBy: req.user.name || 'user',
    createdAt: new Date()
  });
  res.status(201).json({ incident: doc });
});

router.post('/incidents/:id/resolve', async (req, res) => {
  const doc = await store.update('incidents', req.params.id, { status: 'RESOLVED', resolvedAt: new Date() });
  if (!doc) return res.status(404).json({ message: 'Incident not found' });
  res.json({ incident: doc });
});

module.exports = router;

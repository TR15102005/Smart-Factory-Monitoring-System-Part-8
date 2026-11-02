const express = require('express');
const store = require('../services/store');
const simulation = require('../services/simulation');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const docs = await store.list('reports', { createdAt: -1 });
  res.json({ reports: docs });
});

router.get('/:id', async (req, res) => {
  const doc = await store.get('reports', req.params.id);
  if (!doc) return res.status(404).json({ message: 'Report not found' });
  res.json({ report: doc });
});

router.post('/', async (req, res) => {
  const { title, workspace, from, to } = req.body || {};
  if (!title) return res.status(400).json({ message: 'Report title is required' });
  const [workers, robots, incidents] = await Promise.all([
    store.list('workers'),
    store.list('robots'),
    store.list('incidents')
  ]);
  const live = simulation.snapshot();
  const docs = await store.list('reports');
  const doc = await store.create('reports', {
    reportId: `RPT-${101 + docs.length}`,
    title,
    workspace: workspace || 'Main Plant',
    from: from || '',
    to: to || '',
    createdBy: req.user.name || 'user',
    createdAt: new Date(),
    summary: {
      workers: workers.length,
      activeWorkers: live.summary.workers,
      robots: robots.length,
      robotUtilization: live.summary.robotUtilization,
      openIncidents: incidents.filter((i) => i.status === 'OPEN').length,
      compliance: live.summary.compliance
    }
  });
  res.status(201).json({ report: doc });
});

module.exports = router;

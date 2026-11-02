const express = require('express');
const store = require('../services/store');
const simulation = require('../services/simulation');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const STATE_FROM_STATUS = { RUNNING: 'working', IDLE: 'idle', CHARGING: 'charging', MAINTENANCE: 'maintenance' };

router.get('/', async (req, res) => {
  const docs = await store.list('robots', { robotId: 1 });
  const live = Object.fromEntries(simulation.snapshot().robots.map((r) => [r.id, r]));
  res.json({
    robots: docs.map((d) => {
      const l = live[d.id];
      return {
        ...d,
        liveStatus: l ? simulation.STATUS_FROM_STATE[l.state] : d.status,
        battery: l ? l.battery : d.battery,
        task: l ? l.task : 0,
        liveZone: l ? l.zone : d.zone
      };
    })
  });
});

router.post('/', async (req, res) => {
  const { name, model, zone, workstation } = req.body || {};
  if (!name || !model) return res.status(400).json({ message: 'Name and model are required' });
  const docs = await store.list('robots');
  const nextNum = docs.length + 1;
  const doc = await store.create('robots', {
    robotId: `RB-${String(nextNum).padStart(3, '0')}`,
    name, model,
    zone: zone || 'charging',
    workstation: workstation || 'WS-D1',
    status: 'IDLE',
    battery: 100,
    uptimeHours: 0
  });
  simulation.addRobot(doc);
  res.status(201).json({ robot: doc });
});

router.patch('/:id', async (req, res) => {
  const { status, zone } = req.body || {};
  const patch = {};
  if (status && STATE_FROM_STATUS[status]) patch.status = status;
  if (zone) patch.zone = zone;
  const doc = await store.update('robots', req.params.id, patch);
  if (!doc) return res.status(404).json({ message: 'Robot not found' });
  simulation.setRobot(doc.id, { state: STATE_FROM_STATUS[patch.status], zone: patch.zone });
  res.json({ robot: doc });
});

module.exports = router;

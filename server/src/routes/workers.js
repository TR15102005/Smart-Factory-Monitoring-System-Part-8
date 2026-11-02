const express = require('express');
const store = require('../services/store');
const simulation = require('../services/simulation');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const docs = await store.list('workers', { employeeId: 1 });
  const live = Object.fromEntries(simulation.snapshot().workers.map((w) => [w.id, w]));
  res.json({
    workers: docs.map((d) => ({
      ...d,
      liveZone: live[d.id] ? live[d.id].zone : null,
      onFloor: Boolean(live[d.id])
    }))
  });
});

router.post('/', async (req, res) => {
  const { name, role, department, zone, workstation, shift } = req.body || {};
  if (!name || !role || !department) return res.status(400).json({ message: 'Name, role and department are required' });
  const docs = await store.list('workers');
  const nextNum = 1001 + docs.length;
  const doc = await store.create('workers', {
    employeeId: `EMP-${nextNum}`,
    name, role, department,
    zone: zone || 'assembly',
    workstation: workstation || 'WS-A1',
    shift: shift === 'Night' ? 'Night' : 'Day',
    status: 'ACTIVE',
    lastActivity: new Date().toISOString().slice(0, 16).replace('T', ' ')
  });
  simulation.addWorker(doc);
  res.status(201).json({ worker: doc });
});

router.patch('/:id', async (req, res) => {
  const { status, zone } = req.body || {};
  const patch = {};
  if (status && ['ACTIVE', 'TRAINING', 'OFFLINE'].includes(status)) patch.status = status;
  if (zone) patch.zone = zone;
  const doc = await store.update('workers', req.params.id, patch);
  if (!doc) return res.status(404).json({ message: 'Worker not found' });

  if (patch.status === 'OFFLINE') simulation.removeWorker(doc.id);
  else if (patch.status) simulation.addWorker(doc);
  if (patch.zone) simulation.setWorkerZone(doc.id, patch.zone);
  res.json({ worker: doc });
});

module.exports = router;

const express = require('express');
const store = require('../services/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const docs = await store.list('maintenance', { date: -1 });
  res.json({ records: docs });
});

router.post('/', async (req, res) => {
  const { asset, type, technician, notes, durationHours } = req.body || {};
  if (!asset || !technician) return res.status(400).json({ message: 'Asset and technician are required' });
  const docs = await store.list('maintenance');
  const nextNum = 3013 + docs.length;
  const doc = await store.create('maintenance', {
    recordId: `MR-${nextNum}`,
    asset,
    type: ['PREVENTIVE', 'CORRECTIVE', 'CALIBRATION'].includes(type) ? type : 'PREVENTIVE',
    technician,
    durationHours: Number(durationHours) || 0,
    notes: notes || '',
    status: 'SCHEDULED',
    date: new Date()
  });
  res.status(201).json({ record: doc });
});

router.patch('/:id', async (req, res) => {
  const { status } = req.body || {};
  if (!['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  const doc = await store.update('maintenance', req.params.id, { status });
  if (!doc) return res.status(404).json({ message: 'Record not found' });
  res.json({ record: doc });
});

module.exports = router;

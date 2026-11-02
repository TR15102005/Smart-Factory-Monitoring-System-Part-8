const express = require('express');
const store = require('../services/store');
const simulation = require('../services/simulation');
const layout = require('../data/layout');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const zones = await store.allZones();
  res.json({ zones, corridors: layout.corridors, hazards: layout.hazards, vents: layout.vents, teamBases: layout.teamBases });
});

router.get('/live', requireAuth, (req, res) => {
  res.json(simulation.snapshot());
});

module.exports = router;

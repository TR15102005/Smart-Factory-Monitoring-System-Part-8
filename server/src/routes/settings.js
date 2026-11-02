const express = require('express');
const store = require('../services/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  res.json({ settings: await store.getSettings() });
});

router.put('/', async (req, res) => {
  const { workspaceName, timezone, alertEmail, theme, shiftHandover } = req.body || {};
  const patch = {};
  if (workspaceName) patch.workspaceName = workspaceName;
  if (timezone) patch.timezone = timezone;
  if (alertEmail) patch.alertEmail = alertEmail;
  if (theme) patch.theme = theme;
  if (shiftHandover) patch.shiftHandover = shiftHandover;
  res.json({ settings: await store.updateSettings(patch) });
});

module.exports = router;

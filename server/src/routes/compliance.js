const express = require('express');
const store = require('../services/store');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const STANDARDS = [
  { code: 'ISO 10218-1', title: 'Industrial robot safety', met: 42, total: 42, status: 'PASSED' },
  { code: 'ISO/TS 15066', title: 'Collaborative robot operations', met: 38, total: 40, status: 'PASSED WITH FINDINGS' },
  { code: 'ANSI/RIA R15.08', title: 'Mobile industrial robots', met: 27, total: 27, status: 'PASSED' },
  { code: 'OSHA 1910.212', title: 'Machine guarding', met: 18, total: 20, status: 'PASSED WITH FINDINGS' },
  { code: 'ISO 13849-1', title: 'Safety-related control systems', met: 33, total: 33, status: 'PASSED' }
];

const ZONE_SNAPSHOT = [
  { zone: 'assembly', items: [{ code: 'ISO 10218-1', status: 'PASSED' }, { code: 'ISO/TS 15066', status: 'PASSED WITH FINDINGS' }] },
  { zone: 'welding', items: [{ code: 'OSHA 1910.212', status: 'PASSED WITH FINDINGS' }, { code: 'ISO 13849-1', status: 'PASSED' }] },
  { zone: 'cnc', items: [{ code: 'OSHA 1910.212', status: 'PASSED' }, { code: 'ISO 13849-1', status: 'PASSED' }] },
  { zone: 'paint', items: [{ code: 'OSHA 1910.212', status: 'PASSED WITH FINDINGS' }] },
  { zone: 'packaging', items: [{ code: 'ISO 10218-1', status: 'PASSED' }, { code: 'ISO/TS 15066', status: 'PASSED' }] },
  { zone: 'warehouse', items: [{ code: 'ANSI/RIA R15.08', status: 'PASSED' }] },
  { zone: 'charging', items: [{ code: 'ANSI/RIA R15.08', status: 'PASSED' }, { code: 'ISO 13849-1', status: 'PASSED' }] }
];

const DAY = 24 * 60 * 60 * 1000;

router.get('/', async (req, res) => {
  const certs = await store.list('certifications');
  const now = Date.now();
  res.json({
    standards: STANDARDS,
    zoneSnapshot: ZONE_SNAPSHOT,
    certifications: certs.map((c) => {
      const days = Math.round((new Date(c.expiresAt).getTime() - now) / DAY);
      let status = 'VALID';
      if (days < 0) status = 'EXPIRED';
      else if (days <= 30) status = 'EXPIRING';
      return { ...c, days, status };
    })
  });
});

module.exports = router;

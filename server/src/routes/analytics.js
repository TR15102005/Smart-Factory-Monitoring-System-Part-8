const express = require('express');
const store = require('../services/store');
const simulation = require('../services/simulation');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const DAY = 24 * 60 * 60 * 1000;

router.get('/', async (req, res) => {
  const [incidents, robots, maintenance] = await Promise.all([
    store.list('incidents'),
    store.list('robots'),
    store.list('maintenance')
  ]);
  const live = simulation.snapshot();

  const utilizationTrend = Array.from({ length: 14 }, (_, i) => ({
    label: new Date(Date.now() - (13 - i) * DAY).toISOString().slice(5, 10),
    value: Math.round(64 + i * 1.4 + Math.sin(i * 1.1) * 9)
  }));

  const statusDistribution = ['working', 'idle', 'charging', 'maintenance'].reduce((acc, s) => {
    acc[s] = live.robots.filter((r) => r.state === s).length;
    return acc;
  }, {});

  const byDay = [];
  for (let i = 13; i >= 0; i -= 1) {
    const start = new Date(Date.now() - i * DAY);
    start.setHours(0, 0, 0, 0);
    const end = start.getTime() + DAY;
    const inDay = incidents.filter((d) => {
      const t = new Date(d.createdAt).getTime();
      return t >= start.getTime() && t < end;
    });
    byDay.push({
      label: start.toISOString().slice(5, 10),
      HIGH: inDay.filter((d) => d.severity === 'HIGH').length,
      MEDIUM: inDay.filter((d) => d.severity === 'MEDIUM').length,
      LOW: inDay.filter((d) => d.severity === 'LOW').length
    });
  }

  const operatingHours = robots
    .map((r) => ({ label: r.name, value: r.uptimeHours }))
    .sort((a, b) => b.value - a.value);

  const alertFrequency = Object.entries(
    incidents.reduce((acc, d) => ({ ...acc, [d.zone]: (acc[d.zone] || 0) + 1 }), {})
  )
    .map(([zone, value]) => ({ label: zone, value }))
    .sort((a, b) => b.value - a.value);

  const maintenanceResponse = maintenance
    .filter((m) => m.status === 'COMPLETED')
    .slice(0, 8)
    .map((m) => ({ label: m.recordId, value: m.durationHours }));

  const weeklyTrend = Array.from({ length: 4 }, (_, w) => {
    const from = Date.now() - (3 - w) * 7 * DAY;
    const to = from + 7 * DAY;
    return {
      label: `W${w + 1}`,
      value: incidents.filter((d) => {
        const t = new Date(d.createdAt).getTime();
        return t >= from - 7 * DAY && t < to - 7 * DAY + 7 * DAY && t >= from && t < to;
      }).length
    };
  });

  res.json({
    utilizationTrend,
    statusDistribution,
    incidentsBySeverity: byDay,
    operatingHours,
    alertFrequency,
    maintenanceResponse,
    weeklyTrend,
    robotUtilization: live.summary.robotUtilization
  });
});

module.exports = router;

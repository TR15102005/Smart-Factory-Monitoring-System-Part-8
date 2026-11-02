require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getMode } = require('./config/db');
const store = require('./services/store');
const simulation = require('./services/simulation');
const authRoutes = require('./routes/auth');
const zoneRoutes = require('./routes/zones');
const workerRoutes = require('./routes/workers');
const robotRoutes = require('./routes/robots');
const safetyRoutes = require('./routes/safety');
const maintenanceRoutes = require('./routes/maintenance');
const analyticsRoutes = require('./routes/analytics');
const complianceRoutes = require('./routes/compliance');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const settingsRoutes = require('./routes/settings');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true, storage: getMode(), uptime: process.uptime() });
});
app.use('/api/auth', authRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/robots', robotRoutes);
app.use('/api', safetyRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

const PORT = process.env.PORT || 5001;

(async () => {
  await connectDB();
  await store.seedIfEmpty();
  const [workerDocs, robotDocs] = await Promise.all([store.list('workers'), store.list('robots')]);
  simulation.start(workerDocs, robotDocs);
  app.listen(PORT, () => {
    console.log(`[api] Smart Factory Monitor API listening on http://localhost:${PORT} (storage: ${getMode()})`);
  });
})();

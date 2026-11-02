const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  asset: { type: String, required: true },
  type: { type: String, enum: ['PREVENTIVE', 'CORRECTIVE', 'CALIBRATION'], default: 'PREVENTIVE' },
  technician: { type: String, required: true },
  durationHours: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'], default: 'SCHEDULED' },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MaintenanceRecord', maintenanceSchema);

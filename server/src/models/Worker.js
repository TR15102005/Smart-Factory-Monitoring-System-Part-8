const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, required: true },
  department: { type: String, required: true },
  zone: { type: String, default: 'assembly' },
  workstation: String,
  shift: { type: String, enum: ['Day', 'Night'], default: 'Day' },
  status: { type: String, enum: ['ACTIVE', 'TRAINING', 'OFFLINE'], default: 'ACTIVE' },
  lastActivity: { type: String, default: '' }
});

module.exports = mongoose.model('Worker', workerSchema);

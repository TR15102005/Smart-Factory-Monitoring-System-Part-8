const mongoose = require('mongoose');

const robotSchema = new mongoose.Schema({
  robotId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  model: { type: String, required: true },
  zone: { type: String, default: 'assembly' },
  workstation: String,
  status: { type: String, enum: ['RUNNING', 'IDLE', 'CHARGING', 'MAINTENANCE'], default: 'IDLE' },
  battery: { type: Number, default: 100 },
  uptimeHours: { type: Number, default: 0 }
});

module.exports = mongoose.model('Robot', robotSchema);

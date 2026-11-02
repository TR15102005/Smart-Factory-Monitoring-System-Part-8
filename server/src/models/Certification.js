const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  workerName: { type: String, required: true },
  role: String,
  certification: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('Certification', certificationSchema);

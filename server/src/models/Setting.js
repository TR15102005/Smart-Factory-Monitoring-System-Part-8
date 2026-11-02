const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  workspaceName: String,
  timezone: String,
  alertEmail: String,
  theme: String,
  shiftHandover: String
});

module.exports = mongoose.model('Setting', settingSchema);

const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  workspace: { type: String, default: 'Main Plant' },
  from: String,
  to: String,
  createdBy: String,
  createdAt: { type: Date, default: Date.now },
  summary: { type: Object, default: {} }
});

module.exports = mongoose.model('Report', reportSchema);

const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  zoneId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  x: Number,
  y: Number,
  w: Number,
  h: Number,
  capacity: { type: Number, required: true }
});

module.exports = mongoose.model('Zone', zoneSchema);

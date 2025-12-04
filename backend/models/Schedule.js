const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  timeSlot: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Schedule', scheduleSchema);


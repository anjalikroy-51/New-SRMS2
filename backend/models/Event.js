const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventType: {
    type: String,
    enum: ['exam', 'holiday', 'deadline', 'workshop', 'hackathon', 'seminar', 'fest'],
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);


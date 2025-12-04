const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  eventType: {
    type: String,
    required: true,
    enum: ['Exam', 'Holiday', 'Deadline', 'Workshop', 'Hackathon', 'Seminar', 'Tech Fest']
  },
  description: {
    type: String,
    trim: true
  },
  colorTag: {
    type: String,
    default: '#6366f1'
  }
}, {
  timestamps: true
});

// Index for date queries
academicCalendarSchema.index({ date: 1 });

module.exports = mongoose.model('AcademicCalendar', academicCalendarSchema);


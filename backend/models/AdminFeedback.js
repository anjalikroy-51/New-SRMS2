const mongoose = require('mongoose');

const adminFeedbackSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feedback: {
    type: String,
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
adminFeedbackSchema.index({ studentId: 1 });
adminFeedbackSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AdminFeedback', adminFeedbackSchema);


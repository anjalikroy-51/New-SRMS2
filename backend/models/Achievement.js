const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  achievementDate: {
    type: Date,
    required: true
  },
  fileUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Approved', 'Pending', 'Rejected'],
    default: 'Pending'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
achievementSchema.index({ studentId: 1 });
achievementSchema.index({ status: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);


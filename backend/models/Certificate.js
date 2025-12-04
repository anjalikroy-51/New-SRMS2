const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    default: ''
  },
  issueDate: {
    type: Date
  },
  certificateUrl: {
    type: String,
    default: ''
  },
  verification: {
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    submittedOn: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Certificate', certificateSchema);


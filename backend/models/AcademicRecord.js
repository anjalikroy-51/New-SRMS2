const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  subjectName: {
    type: String,
    required: true,
    trim: true
  },
  grade: {
    type: String,
    required: true,
    trim: true
  },
  credits: {
    type: Number,
    default: 0
  }
}, { _id: false });

const academicRecordSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile',
    required: true
  },
  semester: {
    type: String,
    required: true,
    trim: true
  },
  subjects: {
    type: [subjectSchema],
    default: []
  },
  sgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
academicRecordSchema.index({ studentId: 1, semester: 1 });

module.exports = mongoose.model('AcademicRecord', academicRecordSchema);


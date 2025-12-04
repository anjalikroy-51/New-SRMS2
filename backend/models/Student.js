const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sgpa: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  subjects: {
    type: String,
    default: ''
  }
});

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
});

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  course: {
    type: String,
    required: true
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  backlogs: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Active', 'On Hold', 'Graduated'],
    default: 'Active'
  },
  photo: {
    type: String,
    default: ''
  },
  attendancePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  semesters: [semesterSchema],
  skills: [skillSchema],
  feedback: {
    text: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);


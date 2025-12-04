const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
  userId: {
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
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  dob: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  nationality: {
    type: String,
    trim: true
  },
  bloodGroup: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  guardianName: {
    type: String,
    trim: true
  },
  guardianPhone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  state: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  course: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  batch: {
    type: String,
    trim: true
  },
  semester: {
    type: Number
  },
  section: {
    type: String,
    trim: true
  },
  rollNo: {
    type: String,
    trim: true
  },
  cgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  sgpa: {
    type: Number,
    min: 0,
    max: 10
  },
  backlogs: {
    type: String,
    default: '0'
  },
  mentor: {
    type: String,
    trim: true
  },
  skills: {
    type: String,
    trim: true
  },
  languages: {
    type: String,
    trim: true
  },
  projects: {
    type: String,
    trim: true
  },
  idCard: {
    type: String,
    default: ''
  },
  bonafideCertificate: {
    type: String,
    default: ''
  },
  feeReceipt: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    trim: true
  },
  emergencyRelation: {
    type: String,
    trim: true
  },
  medicalNotes: {
    type: String,
    trim: true
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved'],
    default: 'Pending'
  },
  studentStatus: {
    type: String,
    enum: ['Active', 'Graduated', 'On Hold'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);


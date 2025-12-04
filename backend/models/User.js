const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    required: true,
    default: 'student'
  },
  contactInfo: {
    primaryEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    alternateEmail: {
      type: String,
      trim: true,
      lowercase: true
    },
    mobileNumber: {
      type: String,
      trim: true
    },
    guardianNumber: {
      type: String,
      trim: true
    }
  },
  preferences: {
    examAlerts: {
      type: Boolean,
      default: true
    },
    assignmentReminders: {
      type: Boolean,
      default: true
    },
    eventUpdates: {
      type: Boolean,
      default: false
    },
    showCgpa: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      enum: ['en', 'hi'],
      default: 'en'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


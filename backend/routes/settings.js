const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Student = require('../models/Student');
const { authenticateToken } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'profiles');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF)'));
    }
  }
});

// Get current user settings
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const student = await Student.findOne({ user: req.user._id });
    
    res.json({
      user: {
        username: user.username,
        email: user.email,
        contactInfo: user.contactInfo || {},
        preferences: user.preferences || {}
      },
      student: student ? {
        name: student.name,
        studentId: student.studentId,
        course: student.course,
        photo: student.photo
      } : null
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update password
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'All password fields are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New passwords do not match' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    user.updatedAt = new Date();
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update contact information
router.put('/contact', authenticateToken, async (req, res) => {
  try {
    const { primaryEmail, alternateEmail, mobileNumber, guardianNumber } = req.body;

    const user = await User.findById(req.user._id);
    
    // Update contact info
    user.contactInfo = {
      primaryEmail: primaryEmail || user.contactInfo?.primaryEmail || user.email,
      alternateEmail: alternateEmail || user.contactInfo?.alternateEmail || '',
      mobileNumber: mobileNumber || user.contactInfo?.mobileNumber || '',
      guardianNumber: guardianNumber || user.contactInfo?.guardianNumber || ''
    };
    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: 'Contact information updated successfully',
      contactInfo: user.contactInfo
    });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const {
      examAlerts,
      assignmentReminders,
      eventUpdates,
      showCgpa,
      language
    } = req.body;

    const user = await User.findById(req.user._id);
    
    // Update preferences
    user.preferences = {
      examAlerts: examAlerts !== undefined ? examAlerts : user.preferences?.examAlerts ?? true,
      assignmentReminders: assignmentReminders !== undefined ? assignmentReminders : user.preferences?.assignmentReminders ?? true,
      eventUpdates: eventUpdates !== undefined ? eventUpdates : user.preferences?.eventUpdates ?? false,
      showCgpa: showCgpa !== undefined ? showCgpa : user.preferences?.showCgpa ?? true,
      language: language || user.preferences?.language || 'en'
    };
    user.updatedAt = new Date();
    await user.save();

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload profile photo
router.post('/photo', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const student = await Student.findOne({ user: req.user._id });
    
    if (!student) {
      // Delete uploaded file if student not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Delete old photo if exists
    if (student.photo) {
      const oldPhotoPath = path.join(__dirname, '..', student.photo);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update student photo path (relative to uploads root)
    // Server serves /uploads from backend/uploads, so path should be /uploads/profiles/...
    const photoPath = `/uploads/profiles/${req.file.filename}`;
    student.photo = photoPath;
    student.lastUpdated = new Date();
    await student.save();

    res.json({
      message: 'Profile photo uploaded successfully',
      photo: photoPath
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    // Delete uploaded file on error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


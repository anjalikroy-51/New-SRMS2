const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Achievement = require('../models/Achievement');
const StudentProfile = require('../models/StudentProfile');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/achievements';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ach-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png) and PDF files are allowed'));
  }
});

// Get achievements for current student
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const achievements = await Achievement.find({ studentId: studentProfile._id })
      .sort({ achievementDate: -1 });

    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create achievement
router.post('/', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { title, description, position, category, achievementDate } = req.body;

    if (!title || !achievementDate) {
      return res.status(400).json({ error: 'Title and achievement date are required' });
    }

    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const achievement = new Achievement({
      studentId: studentProfile._id,
      title,
      description: description || '',
      position: position || '',
      category: category || '',
      achievementDate: new Date(achievementDate),
      fileUrl: req.file ? `/uploads/achievements/${req.file.filename}` : '',
      status: 'Pending'
    });

    await achievement.save();

    res.status(201).json({
      message: 'Achievement added successfully',
      achievement
    });
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete achievement
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const achievement = await Achievement.findById(id);

    if (!achievement) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    // Check access
    const studentProfile = await StudentProfile.findById(achievement.studentId);
    if (req.user.role === 'student' && studentProfile.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file if exists
    if (achievement.fileUrl) {
      const filePath = path.join(__dirname, '..', achievement.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Achievement.findByIdAndDelete(id);

    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


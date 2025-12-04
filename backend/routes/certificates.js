const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Certificate = require('../models/Certificate');
const Student = require('../models/Student');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/certificates';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'cert-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
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

// Get all certificates (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate('student', 'studentId name')
      .populate('verification.reviewedBy', 'username')
      .sort({ 'verification.submittedOn': -1 });

    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get certificates for current student
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const certificates = await Certificate.find({ student: student._id })
      .populate('verification.reviewedBy', 'username')
      .sort({ 'verification.submittedOn': -1 });

    res.json(certificates);
  } catch (error) {
    console.error('Error fetching certificates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create certificate request
router.post('/', authenticateToken, upload.single('certificate'), async (req, res) => {
  try {
    const { title, issuer, issueDate } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const certificate = new Certificate({
      student: student._id,
      title,
      issuer: issuer || '',
      issueDate: issueDate || new Date(),
      certificateUrl: req.file ? `/uploads/certificates/${req.file.filename}` : ''
    });

    await certificate.save();
    await certificate.populate('student', 'studentId name');

    res.status(201).json({
      message: 'Certificate request submitted',
      certificate
    });
  } catch (error) {
    console.error('Error creating certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update certificate verification status (admin only)
router.put('/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    certificate.verification.status = status;
    certificate.verification.reviewedBy = req.user._id;
    certificate.verification.reviewedAt = new Date();

    await certificate.save();
    await certificate.populate('student', 'studentId name');
    await certificate.populate('verification.reviewedBy', 'username');

    res.json({
      message: 'Certificate verification updated',
      certificate
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete certificate
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id);

    if (!certificate) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    // Check access
    const student = await Student.findById(certificate.student);
    if (req.user.role === 'student' && student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Delete file if exists
    if (certificate.certificateUrl) {
      const filePath = path.join(__dirname, '..', certificate.certificateUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Certificate.findByIdAndDelete(id);

    res.json({ message: 'Certificate deleted successfully' });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


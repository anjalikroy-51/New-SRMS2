const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Student = require('../models/Student');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Configure multer for document uploads
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'doc-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadDocuments = multer({
  storage: documentStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
}).fields([
  { name: 'idCard', maxCount: 1 },
  { name: 'bonafide', maxCount: 1 },
  { name: 'feeReceipt', maxCount: 1 }
]);

const router = express.Router();

// Get all students (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, course, status } = req.query;

    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    if (course) {
      query.course = course;
    }

    if (status) {
      query.status = status;
    }

    const students = await Student.find(query)
      .populate('user', 'username email')
      .sort({ lastUpdated: -1 });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get student count
router.get('/count', authenticateToken, async (req, res) => {
  try {
    const count = await Student.countDocuments();
    res.json({ total: count });
  } catch (error) {
    console.error('Error counting students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending students
router.get('/pending', authenticateToken, async (req, res) => {
  try {
    const students = await Student.find({ status: { $in: ['On Hold', 'Active'] } })
      .select('studentId name')
      .sort({ name: 1 });
    
    res.json(students.map(s => ({ roll: s.studentId, name: s.name })));
  } catch (error) {
    console.error('Error fetching pending students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single student by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({
      $or: [{ _id: id }, { studentId: id }]
    }).populate('user', 'username email');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current student's profile
router.get('/profile/me', authenticateToken, async (req, res) => {
  try {
    // Try to get from StudentProfile first
    let studentProfile = await StudentProfile.findOne({ userId: req.user._id })
      .populate('userId', 'username email');

    if (studentProfile) {
      // Return in format expected by frontend
      return res.json({
        _id: studentProfile._id,
        studentId: studentProfile.studentId,
        name: studentProfile.fullName,
        fullName: studentProfile.fullName,
        course: studentProfile.course,
        email: studentProfile.email || studentProfile.userId?.email,
        photo: studentProfile.idCard || '',
        cgpa: studentProfile.cgpa,
        backlogs: studentProfile.backlogs,
        status: studentProfile.studentStatus,
        attendancePercentage: 0 // Will be fetched from attendance collection
      });
    }

    // Fallback to old Student model
    const student = await Student.findOne({ user: req.user._id })
      .populate('user', 'username email');

    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get full student profile details
router.get('/profile/full', authenticateToken, async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    res.json(studentProfile);
  } catch (error) {
    console.error('Error fetching full profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update student profile
router.put('/profile/update', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Update all fields
    Object.keys(updates).forEach(key => {
      if (updates[key] !== null && updates[key] !== undefined && updates[key] !== '') {
        studentProfile[key] = updates[key];
      }
    });

    await studentProfile.save();

    res.json({
      message: 'Profile updated successfully',
      profile: studentProfile
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload profile documents
router.post('/profile/documents', authenticateToken, uploadDocuments, async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    if (req.files.idCard) {
      studentProfile.idCard = `/uploads/documents/${req.files.idCard[0].filename}`;
    }
    if (req.files.bonafide) {
      studentProfile.bonafideCertificate = `/uploads/documents/${req.files.bonafide[0].filename}`;
    }
    if (req.files.feeReceipt) {
      studentProfile.feeReceipt = `/uploads/documents/${req.files.feeReceipt[0].filename}`;
    }

    await studentProfile.save();

    res.json({
      message: 'Documents uploaded successfully',
      profile: studentProfile
    });
  } catch (error) {
    console.error('Error uploading documents:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new student (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { studentId, name, course, cgpa, backlogs, status, userId } = req.body;

    if (!studentId || !name || !course) {
      return res.status(400).json({ error: 'Student ID, name, and course are required' });
    }

    const student = new Student({
      user: userId || null,
      studentId,
      name,
      course,
      cgpa: cgpa || null,
      backlogs: backlogs || 0,
      status: status || 'Active'
    });

    await student.save();
    await student.populate('user', 'username email');

    res.status(201).json({
      message: 'Student created successfully',
      student
    });
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Student ID already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update student
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if user is admin or the student themselves
    const student = await Student.findOne({
      $or: [{ _id: id }, { studentId: id }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Students can only update their own profile
    if (req.user.role === 'student' && student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Admin can update anything, students can update limited fields
    if (req.user.role === 'student') {
      const allowedFields = ['name', 'photo', 'skills'];
      Object.keys(updates).forEach(key => {
        if (!allowedFields.includes(key)) delete updates[key];
      });
    }

    updates.lastUpdated = new Date();
    const updatedStudent = await Student.findByIdAndUpdate(
      student._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'username email');

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete student (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOneAndDelete({
      $or: [{ _id: id }, { studentId: id }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add semester to student (admin only)
router.post('/:id/semesters', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sgpa, subjects } = req.body;

    const student = await Student.findOne({
      $or: [{ _id: id }, { studentId: id }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.semesters.push({ name, sgpa, subjects: subjects || '' });
    await student.save();

    res.status(201).json({
      message: 'Semester added successfully',
      student
    });
  } catch (error) {
    console.error('Error adding semester:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add skill to student
router.post('/:id/skills', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, level } = req.body;

    const student = await Student.findOne({
      $or: [{ _id: id }, { studentId: id }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check access
    if (req.user.role === 'student' && student.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    student.skills.push({ name, level });
    await student.save();

    res.status(201).json({
      message: 'Skill added successfully',
      student
    });
  } catch (error) {
    console.error('Error adding skill:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update feedback (admin only)
router.put('/:id/feedback', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { feedback_text } = req.body;

    const student = await Student.findOne({
      $or: [{ _id: id }, { studentId: id }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    student.feedback = {
      text: feedback_text || '',
      updatedAt: new Date()
    };
    await student.save();

    res.json({
      message: 'Feedback updated successfully',
      student
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


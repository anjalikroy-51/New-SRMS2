const express = require('express');
const Student = require('../models/Student');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

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


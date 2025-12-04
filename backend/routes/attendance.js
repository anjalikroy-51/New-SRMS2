const express = require('express');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get attendance for current student
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const { start_date, end_date } = req.query;
    let query = { student: student._id };

    if (start_date) {
      query.date = { ...query.date, $gte: new Date(start_date) };
    }

    if (end_date) {
      query.date = { ...query.date, $lte: new Date(end_date) };
    }

    const attendance = await Attendance.find(query).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance for a student (admin only)
router.get('/student/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({
      $or: [{ _id: id }, { studentId: id }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const attendance = await Attendance.find({ student: student._id }).sort({ date: -1 });

    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add attendance record (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { student_id, date, status, subject } = req.body;

    if (!student_id || !date || !status) {
      return res.status(400).json({ error: 'Student ID, date, and status are required' });
    }

    const student = await Student.findOne({
      $or: [{ _id: student_id }, { studentId: student_id }]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const attendance = new Attendance({
      student: student._id,
      date: new Date(date),
      status,
      subject: subject || ''
    });

    await attendance.save();

    // Update attendance percentage
    const totalRecords = await Attendance.countDocuments({ student: student._id });
    const presentRecords = await Attendance.countDocuments({
      student: student._id,
      status: 'Present'
    });
    const percentage = totalRecords > 0 ? (presentRecords / totalRecords) * 100 : 0;

    student.attendancePercentage = percentage;
    await student.save();

    res.status(201).json({
      message: 'Attendance recorded',
      attendance,
      attendancePercentage: percentage
    });
  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


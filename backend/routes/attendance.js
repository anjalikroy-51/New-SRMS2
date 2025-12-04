const express = require('express');
const Attendance = require('../models/Attendance');
const StudentProfile = require('../models/StudentProfile');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get attendance for current student
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const attendance = await Attendance.findOne({ studentId: studentProfile._id });

    if (!attendance) {
      return res.json({
        semesterAttendance: 0,
        lowAttendanceSubjects: []
      });
    }

    res.json({
      semesterAttendance: attendance.semesterAttendance,
      lowAttendanceSubjects: attendance.lowAttendanceSubjects || []
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get attendance for a student (admin only)
router.get('/student/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const studentProfile = await StudentProfile.findOne({
      $or: [{ _id: id }, { studentId: id }]
    });

    if (!studentProfile) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const attendance = await Attendance.findOne({ studentId: studentProfile._id });

    if (!attendance) {
      return res.json({
        semesterAttendance: 0,
        lowAttendanceSubjects: []
      });
    }

    res.json({
      semesterAttendance: attendance.semesterAttendance,
      lowAttendanceSubjects: attendance.lowAttendanceSubjects || []
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update attendance (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { studentId, semesterAttendance, lowAttendanceSubjects } = req.body;

    if (!studentId || semesterAttendance === undefined) {
      return res.status(400).json({ error: 'Student ID and semester attendance are required' });
    }

    const studentProfile = await StudentProfile.findOne({
      $or: [{ _id: studentId }, { studentId: studentId }]
    });

    if (!studentProfile) {
      return res.status(404).json({ error: 'Student not found' });
    }

    let attendance = await Attendance.findOne({ studentId: studentProfile._id });

    if (attendance) {
      attendance.semesterAttendance = semesterAttendance;
      attendance.lowAttendanceSubjects = lowAttendanceSubjects || [];
      attendance.updatedAt = new Date();
      await attendance.save();
    } else {
      attendance = new Attendance({
        studentId: studentProfile._id,
        semesterAttendance,
        lowAttendanceSubjects: lowAttendanceSubjects || []
      });
      await attendance.save();
    }

    res.status(201).json({
      message: 'Attendance updated',
      attendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

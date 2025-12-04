const express = require('express');
const ClassSchedule = require('../models/ClassSchedule');
const StudentProfile = require('../models/StudentProfile');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get class schedule for current student
router.get('/', authenticateToken, async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    const schedules = await ClassSchedule.find({ studentId: studentProfile._id })
      .sort({ day: 1 });

    // Format for frontend
    const formattedSchedule = [];
    schedules.forEach(schedule => {
      if (schedule.timeSlots) {
        schedule.timeSlots.forEach((subject, timeSlot) => {
          formattedSchedule.push({
            day: schedule.day,
            timeSlot: timeSlot,
            subject: subject
          });
        });
      }
    });

    res.json(formattedSchedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create/Update schedule (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { studentId, day, timeSlots } = req.body;

    if (!studentId || !day || !timeSlots) {
      return res.status(400).json({ error: 'StudentId, day, and timeSlots are required' });
    }

    const studentProfile = await StudentProfile.findOne({
      $or: [{ _id: studentId }, { studentId: studentId }]
    });

    if (!studentProfile) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check if schedule already exists
    let schedule = await ClassSchedule.findOne({ 
      studentId: studentProfile._id, 
      day 
    });

    if (schedule) {
      // Update timeSlots
      schedule.timeSlots = new Map(Object.entries(timeSlots));
      await schedule.save();
    } else {
      schedule = new ClassSchedule({
        studentId: studentProfile._id,
        day,
        timeSlots: new Map(Object.entries(timeSlots))
      });
      await schedule.save();
    }

    res.status(201).json({
      message: 'Schedule updated successfully',
      schedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete schedule entry (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await ClassSchedule.findByIdAndDelete(id);

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


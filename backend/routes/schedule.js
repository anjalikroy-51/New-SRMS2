const express = require('express');
const Schedule = require('../models/Schedule');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get class schedule
router.get('/', authenticateToken, async (req, res) => {
  try {
    const schedule = await Schedule.find().sort({ day: 1, timeSlot: 1 });
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create/Update schedule (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { day, timeSlot, subject } = req.body;

    if (!day || !timeSlot || !subject) {
      return res.status(400).json({ error: 'Day, timeSlot, and subject are required' });
    }

    // Check if schedule already exists
    let schedule = await Schedule.findOne({ day, timeSlot });

    if (schedule) {
      schedule.subject = subject;
      await schedule.save();
    } else {
      schedule = new Schedule({ day, timeSlot, subject });
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
    const schedule = await Schedule.findByIdAndDelete(id);

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


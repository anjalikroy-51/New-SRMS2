const express = require('express');
const AcademicCalendar = require('../models/AcademicCalendar');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get academic calendar events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { start_date, end_date, eventType } = req.query;

    let query = {};

    if (start_date && end_date) {
      query.date = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    } else if (start_date) {
      query.date = { $gte: new Date(start_date) };
    } else if (end_date) {
      query.date = { $lte: new Date(end_date) };
    }

    if (eventType) {
      query.eventType = eventType;
    }

    const events = await AcademicCalendar.find(query).sort({ date: 1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching academic calendar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create academic calendar event (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, date, eventType, description, colorTag } = req.body;

    if (!title || !date || !eventType) {
      return res.status(400).json({ error: 'Title, date, and eventType are required' });
    }

    const event = new AcademicCalendar({
      title,
      date: new Date(date),
      eventType,
      description: description || '',
      colorTag: colorTag || '#6366f1'
    });

    await event.save();

    res.status(201).json({
      message: 'Academic calendar event created successfully',
      event
    });
  } catch (error) {
    console.error('Error creating academic calendar event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update academic calendar event (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.date) {
      updates.date = new Date(updates.date);
    }

    const event = await AcademicCalendar.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Academic calendar event updated successfully',
      event
    });
  } catch (error) {
    console.error('Error updating academic calendar event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete academic calendar event (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await AcademicCalendar.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Academic calendar event deleted successfully' });
  } catch (error) {
    console.error('Error deleting academic calendar event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


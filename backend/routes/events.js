const express = require('express');
const Event = require('../models/Event');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all events
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, start_date, end_date } = req.query;

    let query = {};

    if (type) {
      query.eventType = type;
    }

    if (start_date) {
      query.eventDate = { ...query.eventDate, $gte: new Date(start_date) };
    }

    if (end_date) {
      query.eventDate = { ...query.eventDate, $lte: new Date(end_date) };
    }

    const events = await Event.find(query).sort({ eventDate: 1 });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming events
router.get('/upcoming', authenticateToken, async (req, res) => {
  try {
    const events = await Event.find({
      eventDate: { $gte: new Date() }
    })
      .sort({ eventDate: 1 })
      .limit(10);

    res.json(events);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create event (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, eventDate, eventType } = req.body;

    if (!title || !eventDate || !eventType) {
      return res.status(400).json({ error: 'Title, eventDate, and eventType are required' });
    }

    const event = new Event({
      title,
      description: description || '',
      eventDate: new Date(eventDate),
      eventType
    });

    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update event (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.eventDate) {
      updates.eventDate = new Date(updates.eventDate);
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      message: 'Event updated successfully',
      event
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete event (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


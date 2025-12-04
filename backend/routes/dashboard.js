const express = require('express');
const StudentProfile = require('../models/StudentProfile');
const ClassSchedule = require('../models/ClassSchedule');
const Attendance = require('../models/Attendance');
const AcademicCalendar = require('../models/AcademicCalendar');
const Event = require('../models/Event');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get complete dashboard data for student
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Get student profile
    const studentProfile = await StudentProfile.findOne({ userId: req.user._id });
    
    if (!studentProfile) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Get class schedule
    const schedules = await ClassSchedule.find({ studentId: studentProfile._id })
      .sort({ day: 1 });

    // Format schedule for display
    const scheduleMap = {};
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const timeSlots = ['9-10 AM', '10-11 AM', '11-1 PM', '2-4 PM'];
    
    days.forEach(day => {
      scheduleMap[day] = {};
      timeSlots.forEach(slot => {
        scheduleMap[day][slot] = '-';
      });
    });

    schedules.forEach(schedule => {
      if (schedule.timeSlots && schedule.timeSlots instanceof Map) {
        schedule.timeSlots.forEach((value, key) => {
          scheduleMap[schedule.day] = scheduleMap[schedule.day] || {};
          scheduleMap[schedule.day][key] = value;
        });
      } else if (schedule.timeSlots && typeof schedule.timeSlots === 'object') {
        // Handle case when timeSlots is a plain object
        Object.entries(schedule.timeSlots).forEach(([key, value]) => {
          scheduleMap[schedule.day] = scheduleMap[schedule.day] || {};
          scheduleMap[schedule.day][key] = value;
        });
      }
    });

    // Get attendance
    const attendance = await Attendance.findOne({ studentId: studentProfile._id });

    // Get academic calendar events for current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const calendarEvents = await AcademicCalendar.find({
      date: {
        $gte: startOfMonth,
        $lte: endOfMonth
      }
    }).sort({ date: 1 });

    // Get upcoming events (next 30 days)
    const upcomingEvents = await Event.find({
      date: {
        $gte: new Date()
      }
    })
    .sort({ date: 1 })
    .limit(10)
    .populate('createdBy', 'username');

    res.json({
      studentProfile: {
        _id: studentProfile._id,
        studentId: studentProfile.studentId,
        fullName: studentProfile.fullName,
        course: studentProfile.course,
        email: studentProfile.email,
        phone: studentProfile.phone
      },
      schedule: scheduleMap,
      attendance: attendance ? {
        semesterAttendance: attendance.semesterAttendance,
        lowAttendanceSubjects: attendance.lowAttendanceSubjects || []
      } : {
        semesterAttendance: 0,
        lowAttendanceSubjects: []
      },
      calendarEvents: calendarEvents.map(event => ({
        _id: event._id,
        title: event.title,
        date: event.date,
        eventType: event.eventType,
        description: event.description,
        colorTag: event.colorTag
      })),
      upcomingEvents: upcomingEvents.map(event => ({
        _id: event._id,
        title: event.title,
        category: event.category,
        date: event.date,
        description: event.description
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;


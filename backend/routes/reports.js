const express = require('express');
const Student = require('../models/Student');
const Certificate = require('../models/Certificate');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get student report (for student viewing their own report)
router.get('/student', authenticateToken, async (req, res) => {
  try {
    const { semester } = req.query;
    
    // Get current student
    const student = await Student.findOne({ user: req.user._id });
    
    if (!student) {
      return res.status(404).json({ error: 'Student profile not found' });
    }

    // Filter semesters if specified
    let filteredSemesters = student.semesters || [];
    if (semester && semester !== 'all') {
      filteredSemesters = filteredSemesters.filter(s => s.name === semester);
    }

    // Parse academic data from semesters
    const academic = [];
    filteredSemesters.forEach(sem => {
      if (sem.subjects) {
        const subjects = sem.subjects.split(',').filter(s => s.trim());
        subjects.forEach(sub => {
          const parts = sub.split(':');
          if (parts.length === 2) {
            const [subject, grade] = parts.map(s => s.trim());
            // Convert grade to numeric value for chart
            const gradeValue = getGradeValue(grade);
            academic.push({
              subject,
              grade,
              gradeValue
            });
          }
        });
      }
    });

    // Calculate SGPA and CGPA
    const sgpa = filteredSemesters.length > 0 ? filteredSemesters[0].sgpa : null;
    const cgpa = student.cgpa || null;

    // Get skills
    const skills = student.skills || [];

    // Get feedback
    const feedback = {
      text: student.feedback?.text || 'No feedback yet.',
      lastUpdated: student.feedback?.updatedAt 
        ? new Date(student.feedback.updatedAt).toLocaleDateString()
        : '--'
    };

    // Get certificates
    const certificates = await Certificate.find({ student: student._id })
      .select('title status adminComments')
      .sort({ createdAt: -1 });

    res.json({
      academic,
      sgpa,
      cgpa,
      skills,
      feedback,
      certificates,
      semesters: student.semesters || []
    });
  } catch (error) {
    console.error('Error fetching student report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get admin report for a specific student
router.get('/admin/:studentId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester } = req.query;
    
    const student = await Student.findOne({
      $or: [{ _id: studentId }, { studentId: studentId }]
    }).populate('user', 'username email');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Filter semesters if specified
    let filteredSemesters = student.semesters || [];
    if (semester && semester !== 'all') {
      filteredSemesters = filteredSemesters.filter(s => s.name === semester);
    }

    // Parse academic data
    const academic = [];
    filteredSemesters.forEach(sem => {
      if (sem.subjects) {
        const subjects = sem.subjects.split(',').filter(s => s.trim());
        subjects.forEach(sub => {
          const parts = sub.split(':');
          if (parts.length === 2) {
            const [subject, grade] = parts.map(s => s.trim());
            academic.push({
              subject,
              grade
            });
          }
        });
      }
    });

    // Calculate SGPA and CGPA
    const sgpa = filteredSemesters.length > 0 ? filteredSemesters[0].sgpa : null;
    const cgpa = student.cgpa || null;

    // Get skills
    const skills = student.skills || [];

    // Get feedback
    const feedback = {
      text: student.feedback?.text || 'No feedback yet.',
      lastUpdated: student.feedback?.updatedAt 
        ? new Date(student.feedback.updatedAt).toLocaleDateString()
        : '--'
    };

    // Get certificates
    const certificates = await Certificate.find({ student: student._id })
      .select('title status adminComments')
      .sort({ createdAt: -1 });

    res.json({
      student: {
        _id: student._id,
        studentId: student.studentId,
        name: student.name,
        course: student.course,
        cgpa: student.cgpa,
        backlogs: student.backlogs,
        status: student.status
      },
      academic,
      sgpa,
      cgpa,
      skills,
      feedback,
      certificates,
      semesters: student.semesters || []
    });
  } catch (error) {
    console.error('Error fetching admin report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to convert grade to numeric value
function getGradeValue(grade) {
  const gradeMap = {
    'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6,
    'C+': 5, 'C': 4, 'D': 3, 'F': 0, 'P': 5, 'NP': 0
  };
  return gradeMap[grade.toUpperCase()] || 0;
}

module.exports = router;


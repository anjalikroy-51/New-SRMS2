/**
 * Update Existing Data Script
 * 
 * HOW TO USE:
 * 1. Modify the values below to what you want
 * 2. Run: node backend/updateData.js
 * 
 * This script updates existing data WITHOUT deleting it
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');

// Import models
const StudentProfile = require('./models/StudentProfile');
const ClassSchedule = require('./models/ClassSchedule');
const Attendance = require('./models/Attendance');
const AcademicCalendar = require('./models/AcademicCalendar');
const Event = require('./models/Event');

// Connect to database
connectDB();

async function updateData() {
  try {
    console.log('🔄 Starting data update...\n');

    // ============================================
    // MODIFY THESE VALUES TO CHANGE YOUR DATA
    // ============================================
    
    const STUDENT_ID = 'STU2025001'; // Change this to your student ID
    
    // Student Profile Updates
    const PROFILE_UPDATES = {
      fullName: 'Yuvan',              // Change student name
      course: 'B.Tech – AI & Data Science',  // Change course
      cgpa: 8.5,                       // Change CGPA
      sgpa: 8.7,                       // Change SGPA
      semester: 3,                     // Change semester
      // Add more fields as needed
    };

    // Attendance Updates
    const ATTENDANCE_UPDATES = {
      semesterAttendance: 82,         // Change attendance percentage (0-100)
      lowAttendanceSubjects: ['DBMS']  // Subjects with low attendance
    };

    // Class Schedule Updates (for Monday)
    const MONDAY_SCHEDULE = {
      '9-10 AM': 'AI',      // Change subject
      '10-11 AM': 'AI',     // Change subject
      '11-1 PM': 'Python',  // Change subject
      '2-4 PM': '-'         // Change subject
    };

    // ============================================
    // END OF MODIFICATIONS
    // ============================================

    // Find student
    const student = await StudentProfile.findOne({ studentId: STUDENT_ID });
    
    if (!student) {
      console.log('❌ Student not found with ID:', STUDENT_ID);
      console.log('💡 Available students:');
      const allStudents = await StudentProfile.find({}, 'studentId fullName');
      allStudents.forEach(s => {
        console.log(`   - ${s.studentId}: ${s.fullName}`);
      });
      process.exit(1);
    }

    console.log(`✅ Found student: ${student.fullName} (${student.studentId})\n`);

    // Update student profile
    console.log('Updating student profile...');
    Object.keys(PROFILE_UPDATES).forEach(key => {
      student[key] = PROFILE_UPDATES[key];
    });
    await student.save();
    console.log('✅ Student profile updated\n');

    // Update attendance
    console.log('Updating attendance...');
    let attendance = await Attendance.findOne({ studentId: student._id });
    
    if (!attendance) {
      // Create if doesn't exist
      attendance = new Attendance({
        studentId: student._id,
        ...ATTENDANCE_UPDATES
      });
      await attendance.save();
      console.log('✅ Attendance record created\n');
    } else {
      Object.keys(ATTENDANCE_UPDATES).forEach(key => {
        attendance[key] = ATTENDANCE_UPDATES[key];
      });
      await attendance.save();
      console.log('✅ Attendance updated\n');
    }

    // Update class schedule for Monday
    console.log('Updating Monday schedule...');
    let mondaySchedule = await ClassSchedule.findOne({ 
      studentId: student._id, 
      day: 'Mon' 
    });
    
    if (!mondaySchedule) {
      // Create if doesn't exist
      mondaySchedule = new ClassSchedule({
        studentId: student._id,
        day: 'Mon',
        timeSlots: new Map(Object.entries(MONDAY_SCHEDULE))
      });
      await mondaySchedule.save();
      console.log('✅ Monday schedule created\n');
    } else {
      // Update existing schedule
      Object.entries(MONDAY_SCHEDULE).forEach(([time, subject]) => {
        mondaySchedule.timeSlots.set(time, subject);
      });
      await mondaySchedule.save();
      console.log('✅ Monday schedule updated\n');
    }

    console.log('✅ All data updated successfully!');
    console.log('\n📝 Updated Values:');
    console.log(`   Name: ${student.fullName}`);
    console.log(`   Course: ${student.course}`);
    console.log(`   CGPA: ${student.cgpa}`);
    console.log(`   Attendance: ${attendance.semesterAttendance}%`);
    console.log('\n🔄 Refresh your browser to see the changes!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating data:', error);
    process.exit(1);
  }
}

// Run the update function
updateData();


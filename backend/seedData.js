/**
 * Seed Script - Populate Database with Sample Data
 * 
 * HOW TO RUN:
 * 1. Make sure MongoDB is running
 * 2. Make sure backend server dependencies are installed (npm install)
 * 3. Run this script: node backend/seedData.js
 * 
 * This will create:
 * - Sample student profile
 * - Class schedules
 * - Attendance records
 * - Academic calendar events
 * - Upcoming events
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');

// Import models
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const ClassSchedule = require('./models/ClassSchedule');
const Attendance = require('./models/Attendance');
const AcademicCalendar = require('./models/AcademicCalendar');
const Event = require('./models/Event');
const AcademicRecord = require('./models/AcademicRecord');
const Skill = require('./models/Skill');

// Connect to database
connectDB();

async function seedData() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await StudentProfile.deleteMany({});
    await ClassSchedule.deleteMany({});
    await Attendance.deleteMany({});
    await AcademicCalendar.deleteMany({});
    await Event.deleteMany({});
    await AcademicRecord.deleteMany({});
    await Skill.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Create a test student user
    console.log('Creating test student user...');
    const studentUser = new User({
      username: 'teststudent',
      email: 'student@test.com',
      password: 'password123',
      role: 'student'
    });
    await studentUser.save();
    console.log('✅ Student user created:', studentUser.username);

    // Create student profile
    console.log('Creating student profile...');
    const studentProfile = new StudentProfile({
      userId: studentUser._id,
      studentId: 'STU2025001',
      fullName: 'Yuvan',
      dob: new Date('2003-05-15'),
      gender: 'Male',
      nationality: 'Indian',
      bloodGroup: 'B+',
      category: 'General',
      email: 'student@test.com',
      phone: '+91-9876543210',
      guardianName: 'Parent Name',
      guardianPhone: '+91-9876543211',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      course: 'B.Tech – AI & Data Science',
      department: 'Computer Science',
      batch: '2024-2027',
      semester: 3,
      section: 'A',
      rollNo: 'CS2024001',
      cgpa: 8.5,
      sgpa: 8.7,
      backlogs: '0',
      mentor: 'Dr. John Doe',
      skills: 'Python, Java, AI, Machine Learning, DBMS',
      languages: 'English, Hindi',
      projects: 'AI Chatbot, E-commerce Website',
      studentStatus: 'Active',
      approvalStatus: 'Approved'
    });
    await studentProfile.save();
    console.log('✅ Student profile created:', studentProfile.fullName);

    // Create class schedules
    console.log('Creating class schedules...');
    const scheduleData = [
      { day: 'Mon', timeSlots: new Map([['9-10 AM', 'AI'], ['10-11 AM', 'AI'], ['11-1 PM', 'Python']]) },
      { day: 'Tue', timeSlots: new Map([['10-11 AM', 'DBMS'], ['11-1 PM', 'DBMS']]) },
      { day: 'Wed', timeSlots: new Map([['9-10 AM', 'Java'], ['10-11 AM', 'Java'], ['11-1 PM', 'AI']]) },
      { day: 'Thu', timeSlots: new Map([['10-11 AM', 'Python'], ['11-1 PM', 'Python'], ['2-4 PM', 'DBMS']]) },
      { day: 'Fri', timeSlots: new Map([['9-10 AM', 'Project'], ['11-1 PM', 'Project']]) }
    ];

    for (const schedule of scheduleData) {
      const classSchedule = new ClassSchedule({
        studentId: studentProfile._id,
        day: schedule.day,
        timeSlots: schedule.timeSlots
      });
      await classSchedule.save();
    }
    console.log('✅ Class schedules created');

    // Create attendance record
    console.log('Creating attendance record...');
    const attendance = new Attendance({
      studentId: studentProfile._id,
      semesterAttendance: 82,
      lowAttendanceSubjects: ['DBMS']
    });
    await attendance.save();
    console.log('✅ Attendance record created');

    // Create academic calendar events
    console.log('Creating academic calendar events...');
    const now = new Date();
    const calendarEvents = [
      {
        title: 'Mid-Term Exam - AI',
        date: new Date(now.getFullYear(), now.getMonth(), 15),
        eventType: 'Exam',
        description: 'Mid-term examination for Artificial Intelligence',
        colorTag: '#ef4444'
      },
      {
        title: 'Diwali Holiday',
        date: new Date(now.getFullYear(), now.getMonth(), 20),
        eventType: 'Holiday',
        description: 'Diwali festival holiday',
        colorTag: '#3b82f6'
      },
      {
        title: 'Project Submission Deadline',
        date: new Date(now.getFullYear(), now.getMonth(), 25),
        eventType: 'Deadline',
        description: 'Final project submission deadline',
        colorTag: '#f59e0b'
      }
    ];

    for (const event of calendarEvents) {
      const calendarEvent = new AcademicCalendar(event);
      await calendarEvent.save();
    }
    console.log('✅ Academic calendar events created');

    // Create upcoming events
    console.log('Creating upcoming events...');
    const events = [
      {
        title: 'AI Workshop',
        category: 'Workshop',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        description: 'Hands-on workshop on AI and Machine Learning',
        createdBy: studentUser._id
      },
      {
        title: 'Hackathon 2025',
        category: 'Hackathon',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        description: 'Annual coding hackathon competition',
        createdBy: studentUser._id
      },
      {
        title: 'Tech Seminar',
        category: 'Seminar',
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        description: 'Seminar on latest technology trends',
        createdBy: studentUser._id
      }
    ];

    for (const event of events) {
      const newEvent = new Event(event);
      await newEvent.save();
    }
    console.log('✅ Upcoming events created');

    // Create academic records
    console.log('Creating academic records...');
    const academicRecord = new AcademicRecord({
      studentId: studentProfile._id,
      semester: 'Semester 2',
      subjects: [
        { subjectName: 'Data Structures', grade: 'A', credits: 4 },
        { subjectName: 'Database Management', grade: 'B+', credits: 3 },
        { subjectName: 'Operating Systems', grade: 'A', credits: 4 },
        { subjectName: 'Computer Networks', grade: 'B', credits: 3 }
      ],
      sgpa: 8.7,
      cgpa: 8.5
    });
    await academicRecord.save();
    console.log('✅ Academic records created');

    // Create skills
    console.log('Creating skills...');
    const skills = [
      { skillName: 'Python', proficiency: 8 },
      { skillName: 'Java', proficiency: 7 },
      { skillName: 'AI/ML', proficiency: 6 },
      { skillName: 'DBMS', proficiency: 7 },
      { skillName: 'Web Development', proficiency: 8 }
    ];

    for (const skill of skills) {
      const newSkill = new Skill({
        studentId: studentProfile._id,
        skillName: skill.skillName,
        proficiency: skill.proficiency
      });
      await newSkill.save();
    }
    console.log('✅ Skills created');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('   Username: teststudent');
    console.log('   Password: password123');
    console.log('\n🚀 You can now login and see the populated data!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData();


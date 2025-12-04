# 📝 How to Modify Database Data

## Option 1: Modify Seed Script (Recommended for Initial Setup)

**Location:** `backend/seedData.js`

### To Change What Gets Created:

1. **Open the file:** `backend/seedData.js`

2. **Modify the data** in the seed script. For example:

```javascript
// Change student name
const studentProfile = new StudentProfile({
  userId: studentUser._id,
  studentId: 'STU2025001',
  fullName: 'YOUR_NAME_HERE',  // ← Change this
  // ... other fields
});

// Change class schedule
const scheduleData = [
  { day: 'Mon', timeSlots: new Map([['9-10 AM', 'YOUR_SUBJECT']]) },  // ← Change subjects
  // ...
];

// Change attendance percentage
const attendance = new Attendance({
  studentId: studentProfile._id,
  semesterAttendance: 85,  // ← Change this (0-100)
  lowAttendanceSubjects: []  // ← Add subjects here if needed
});
```

3. **Re-run the seed script:**
```bash
node backend/seedData.js
```

⚠️ **Note:** This will DELETE all existing data and create new data!

---

## Option 2: Update Existing Data in MongoDB (Without Deleting)

### Method A: Using MongoDB Compass (GUI Tool)

1. **Download MongoDB Compass** (if you don't have it):
   - https://www.mongodb.com/try/download/compass

2. **Connect to your database:**
   - Connection string: `mongodb://localhost:27017/srms`
   - Or check your `.env` file for `MONGODB_URI`

3. **Navigate to collections:**
   - Click on `studentprofiles` collection
   - Find your student document
   - Click "Edit Document"
   - Modify fields directly
   - Click "Update"

### Method B: Create an Update Script

**Create a new file:** `backend/updateData.js`

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');
const StudentProfile = require('./models/StudentProfile');
const ClassSchedule = require('./models/ClassSchedule');
const Attendance = require('./models/Attendance');

connectDB();

async function updateData() {
  try {
    // Find student by studentId
    const student = await StudentProfile.findOne({ studentId: 'STU2025001' });
    
    if (!student) {
      console.log('Student not found!');
      return;
    }

    // Update student profile
    student.fullName = 'New Name Here';
    student.cgpa = 9.0;
    student.semester = 4;
    await student.save();
    console.log('✅ Student profile updated');

    // Update attendance
    const attendance = await Attendance.findOne({ studentId: student._id });
    if (attendance) {
      attendance.semesterAttendance = 90;
      attendance.lowAttendanceSubjects = [];
      await attendance.save();
      console.log('✅ Attendance updated');
    }

    // Update class schedule
    const schedule = await ClassSchedule.findOne({ 
      studentId: student._id, 
      day: 'Mon' 
    });
    if (schedule) {
      schedule.timeSlots.set('9-10 AM', 'New Subject Name');
      await schedule.save();
      console.log('✅ Schedule updated');
    }

    console.log('\n✅ Data updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateData();
```

**Run it:**
```bash
node backend/updateData.js
```

---

## Option 3: Modify Seed Script to NOT Delete Existing Data

**Edit `backend/seedData.js`:**

Find this section (around line 30):
```javascript
// Clear existing data (optional - comment out if you want to keep existing data)
console.log('Clearing existing data...');
await User.deleteMany({});
await StudentProfile.deleteMany({});
// ... etc
```

**Comment it out:**
```javascript
// Clear existing data (optional - comment out if you want to keep existing data)
// console.log('Clearing existing data...');
// await User.deleteMany({});
// await StudentProfile.deleteMany({});
// ... etc
```

Now when you run the seed script, it will ADD data without deleting existing data.

---

## Option 4: Direct MongoDB Commands (Using MongoDB Shell)

1. **Open MongoDB Shell:**
```bash
mongosh
```

2. **Switch to your database:**
```javascript
use srms
```

3. **Update a student:**
```javascript
db.studentprofiles.updateOne(
  { studentId: "STU2025001" },
  { $set: { fullName: "New Name", cgpa: 9.0 } }
)
```

4. **Update attendance:**
```javascript
db.attendances.updateOne(
  { studentId: ObjectId("YOUR_STUDENT_ID") },
  { $set: { semesterAttendance: 90 } }
)
```

---

## 📋 Common Modifications

### Change Student Name:
**In seedData.js:**
```javascript
fullName: 'Your New Name',
```

### Change Course:
```javascript
course: 'B.Tech – Computer Science',
```

### Change Class Schedule:
```javascript
const scheduleData = [
  { day: 'Mon', timeSlots: new Map([['9-10 AM', 'Math'], ['10-11 AM', 'Physics']]) },
  // Add more days...
];
```

### Change Attendance:
```javascript
semesterAttendance: 95,  // Change percentage
lowAttendanceSubjects: ['Math']  // Add subjects with low attendance
```

### Add More Events:
```javascript
const calendarEvents = [
  {
    title: 'Your Event Name',
    date: new Date(2025, 0, 15),  // Year, Month (0-11), Day
    eventType: 'Exam',  // or 'Holiday', 'Deadline'
    description: 'Event description',
    colorTag: '#ef4444'
  },
  // Add more events...
];
```

---

## 🎯 Quick Reference

| What to Change | File Location | Field Name |
|---------------|---------------|------------|
| Student Name | `backend/seedData.js` | `fullName` |
| Student ID | `backend/seedData.js` | `studentId` |
| Course | `backend/seedData.js` | `course` |
| CGPA | `backend/seedData.js` | `cgpa` |
| Attendance % | `backend/seedData.js` | `semesterAttendance` |
| Class Schedule | `backend/seedData.js` | `scheduleData` array |
| Calendar Events | `backend/seedData.js` | `calendarEvents` array |
| Skills | `backend/seedData.js` | `skills` array |

---

## 💡 Best Practice

**For Development/Testing:**
- Use the seed script (`backend/seedData.js`) to quickly reset and repopulate data

**For Production/Real Data:**
- Use MongoDB Compass or update scripts to modify individual records
- Never run the seed script on production data (it deletes everything!)

---

## 🔧 Need Help?

If you want to modify something specific, tell me what you want to change and I'll show you exactly where and how to do it!


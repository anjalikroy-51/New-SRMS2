# 🌱 Database Seeding Instructions

## How to Populate Sample Data

I've created a seed script that will populate your database with sample data so you can see the dashboard working immediately.

### 📍 Where to Run the Script

**Location:** `backend/seedData.js`

### 🚀 Steps to Run:

1. **Make sure MongoDB is running**
   ```bash
   # Windows
   net start MongoDB
   
   # Mac/Linux
   sudo systemctl start mongod
   ```

2. **Navigate to your project root directory**
   ```bash
   cd C:\Users\LENOVO\OneDrive\Desktop\NTCC\NewSRMS
   ```

3. **Run the seed script**
   ```bash
   node backend/seedData.js
   ```

### ✅ What the Script Creates:

- ✅ **Test Student User**
  - Username: `teststudent`
  - Password: `password123`
  - Email: `student@test.com`

- ✅ **Student Profile** (Complete profile with all fields)

- ✅ **Class Schedules** (Monday-Friday schedule with subjects)

- ✅ **Attendance Record** (82% attendance with low attendance warning)

- ✅ **Academic Calendar Events** (Exams, Holidays, Deadlines)

- ✅ **Upcoming Events** (Workshops, Hackathons, Seminars)

- ✅ **Academic Records** (Semester grades and subjects)

- ✅ **Skills** (Python, Java, AI/ML, DBMS, Web Development)

### 🔑 Login Credentials After Seeding:

```
Username: teststudent
Password: password123
```

### 📝 Notes:

- The script will **clear all existing data** before seeding
- If you want to keep existing data, comment out the deletion lines in `seedData.js`
- You can run this script multiple times - it will reset and repopulate the data

### 🎯 After Running:

1. Start your backend server:
   ```bash
   cd backend
   npm start
   ```

2. Open `Login.html` in your browser

3. Login with the test credentials above

4. You should now see:
   - ✅ Dashboard with populated data
   - ✅ Class schedule filled in
   - ✅ Attendance percentage displayed
   - ✅ Academic calendar with events
   - ✅ Upcoming events listed

### 🛠️ Troubleshooting:

**Error: Cannot find module**
- Make sure you're in the project root directory
- Run `npm install` in the `backend` folder first

**Error: MongoDB connection failed**
- Make sure MongoDB is running
- Check your `.env` file has correct `MONGODB_URI`

**No data showing after seeding**
- Make sure you're logged in with the test account
- Check browser console for errors
- Verify backend server is running

---

**That's it!** Your database is now populated with sample data and ready to use! 🎉


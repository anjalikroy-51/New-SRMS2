# 🚀 Complete Setup Guide - SRMS with MongoDB

## Prerequisites

1. **Node.js** (v14 or higher) - Download from https://nodejs.org/
2. **MongoDB** - Download from https://www.mongodb.com/try/download/community
   - Or use MongoDB Atlas (cloud) - https://www.mongodb.com/cloud/atlas

## Step-by-Step Setup

### 1. Install MongoDB

**Option A: Local MongoDB**
- Download and install MongoDB Community Server
- Start MongoDB service:
  - Windows: `net start MongoDB`
  - Mac/Linux: `sudo systemctl start mongod`

**Option B: MongoDB Atlas (Cloud)**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment

Create `backend/.env` file:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/srms
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/srms
```

### 4. Start Backend Server

```bash
cd backend
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

You should see:
```
Server is running on http://localhost:3000
MongoDB Connected: ...
```

### 5. Open Frontend

Open `Login.html` in your browser or navigate to:
```
http://localhost:3000
```

## First Time Usage

### Create Admin Account

1. Go to Login page
2. Click "Sign Up"
3. Select "Admin" role
4. Fill in details and create account

### Create Student Account

1. Go to Login page
2. Click "Sign Up"
3. Select "Student" role
4. Fill in details and create account

## Features

### Student Features
- ✅ View and update profile
- ✅ View academic records (semesters, CGPA)
- ✅ Manage skills and progress
- ✅ Upload and view certificates
- ✅ View attendance records
- ✅ View academic calendar and events
- ✅ View class schedule

### Admin Features
- ✅ Manage all student accounts
- ✅ View student performance metrics
- ✅ Verify/reject certificates
- ✅ Add/update student records
- ✅ Manage academic events
- ✅ Update class schedule
- ✅ Record attendance
- ✅ Add feedback for students

## API Endpoints

All API calls use AJAX and return JSON responses:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Students**: `/api/students/*`
- **Certificates**: `/api/certificates/*`
- **Events**: `/api/events/*`
- **Schedule**: `/api/schedule/*`
- **Attendance**: `/api/attendance/*`

## Troubleshooting

**MongoDB connection error:**
- Make sure MongoDB is running
- Check MONGODB_URI in `.env` file
- For Atlas, check username/password in connection string

**Port already in use:**
- Change PORT in `.env` file
- Update `api.js` to use new port

**CORS errors:**
- Backend is configured to allow CORS
- Make sure backend server is running

**File upload errors:**
- Check `uploads/certificates/` folder exists
- Verify file size (max 5MB)
- Check file format (JPEG, PNG, PDF only)

## Project Structure

```
backend/
├── config/
│   └── database.js       # MongoDB connection
├── models/              # Mongoose schemas
│   ├── User.js
│   ├── Student.js
│   ├── Certificate.js
│   ├── Event.js
│   ├── Attendance.js
│   └── Schedule.js
├── routes/              # API routes
│   ├── auth.js
│   ├── students.js
│   ├── certificates.js
│   ├── events.js
│   ├── schedule.js
│   └── attendance.js
├── middleware/
│   └── auth.js          # JWT authentication
├── uploads/             # File uploads
├── server.js            # Express server
└── package.json

Frontend:
├── api.js               # AJAX utility
├── script.js            # Login/Signup
├── dashboard.js         # Student dashboard
├── admin_dashboard.js   # Admin dashboard
└── ... (other frontend files)
```

## Security Notes

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt
- File uploads are validated (type and size)
- Role-based access control enforced
- All API routes require authentication (except login/register)

## Next Steps

1. Start MongoDB
2. Start backend server
3. Open frontend in browser
4. Create accounts and start using!

For detailed API documentation, see `backend/README.md`


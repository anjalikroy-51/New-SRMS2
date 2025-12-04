# 🚀 Quick Start Guide

## Prerequisites
1. **Node.js** installed (https://nodejs.org/)
2. **MongoDB** installed and running (https://www.mongodb.com/try/download/community)

## Setup Steps

### 1. Start MongoDB
```bash
# Windows
net start MongoDB

# Mac/Linux  
sudo systemctl start mongod
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Create .env File
Create `backend/.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/srms
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
```

### 4. Start Backend
```bash
npm start
```

### 5. Open Frontend
Open `Login.html` in browser or visit `http://localhost:3000`

## Features Implemented

✅ **Backend (Node.js + Express + MongoDB)**
- JWT Authentication
- Student Management (CRUD)
- Certificate Management with File Uploads
- Event Management
- Attendance Tracking
- Class Schedule Management
- Role-based Access Control

✅ **Frontend (HTML + CSS + JavaScript + AJAX)**
- Real-time data loading via AJAX
- Student Dashboard
- Admin Dashboard
- Student Profile Management
- Certificate Upload/View
- Event Calendar
- Attendance Viewing

## API Communication

All frontend-backend communication uses **AJAX** with JSON responses:
- Login/Register → `/api/auth/*`
- Student Data → `/api/students/*`
- Certificates → `/api/certificates/*`
- Events → `/api/events/*`
- Schedule → `/api/schedule/*`
- Attendance → `/api/attendance/*`

## Default Credentials

After first signup, you can create:
- **Admin account** - Full access
- **Student account** - Limited access to own data

## File Structure

```
backend/
├── models/          # MongoDB schemas
├── routes/          # API endpoints
├── middleware/      # Authentication
├── config/          # Database config
└── server.js        # Main server

Frontend/
├── api.js           # AJAX utility
├── script.js        # Login/Signup
├── dashboard.js     # Student dashboard
└── ... (other pages)
```

For detailed setup, see `SETUP_GUIDE.md`


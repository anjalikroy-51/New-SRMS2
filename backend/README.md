# SRMS Backend - Node.js + Express + MongoDB

Student Record Management System - Backend API

## Features

- User authentication (JWT-based)
- Student management (CRUD operations)
- Certificate management with file uploads
- Event and academic calendar management
- Attendance tracking
- Class schedule management
- Skills and semester tracking
- Role-based access control (Student/Admin)

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

## Setup Instructions

### 1. Install MongoDB

Download and install MongoDB from: https://www.mongodb.com/try/download/community

Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 2. Install Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/srms
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/srms
```

### 4. Start MongoDB

**Local MongoDB:**
```bash
# Windows
net start MongoDB

# Mac/Linux
sudo systemctl start mongod
```

### 5. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students (Admin only)
- `GET /api/students/count` - Get student count
- `GET /api/students/pending` - Get pending students
- `GET /api/students/:id` - Get student by ID
- `GET /api/students/profile/me` - Get current student's profile
- `POST /api/students` - Create student (Admin only)
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student (Admin only)
- `POST /api/students/:id/semesters` - Add semester (Admin only)
- `POST /api/students/:id/skills` - Add skill
- `PUT /api/students/:id/feedback` - Update feedback (Admin only)

### Certificates
- `GET /api/certificates` - Get all certificates (Admin only)
- `GET /api/certificates/me` - Get current student's certificates
- `POST /api/certificates` - Create certificate request (with file upload)
- `PUT /api/certificates/:id/verify` - Verify certificate (Admin only)
- `DELETE /api/certificates/:id` - Delete certificate

### Events
- `GET /api/events` - Get all events
- `GET /api/events/upcoming` - Get upcoming events
- `POST /api/events` - Create event (Admin only)
- `PUT /api/events/:id` - Update event (Admin only)
- `DELETE /api/events/:id` - Delete event (Admin only)

### Schedule
- `GET /api/schedule` - Get class schedule
- `POST /api/schedule` - Create/Update schedule (Admin only)
- `DELETE /api/schedule/:id` - Delete schedule (Admin only)

### Attendance
- `GET /api/attendance/me` - Get current student's attendance
- `GET /api/attendance/student/:id` - Get student's attendance (Admin only)
- `POST /api/attendance` - Record attendance (Admin only)

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## File Uploads

Certificate uploads are stored in `backend/uploads/certificates/`
- Supported formats: JPEG, JPG, PNG, PDF
- Max file size: 5MB

## Database Models

- **User** - Authentication and user accounts
- **Student** - Student records with semesters, skills, feedback
- **Certificate** - Student certificates with verification
- **Event** - Academic events and calendar
- **Attendance** - Attendance records
- **Schedule** - Class schedule

## Frontend Integration

The frontend uses AJAX to communicate with these APIs. All responses are in JSON format.

Example:
```javascript
fetch('http://localhost:3000/api/students/profile/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log(data));
```


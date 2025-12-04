# 🚀 How to Initialize and Start Your Web Application

## Step-by-Step Initialization

### Step 1: Install MongoDB (If Not Already Installed)

**Download MongoDB:**
- Go to: https://www.mongodb.com/try/download/community
- Download and install MongoDB Community Server
- During installation, make sure to install as a service

**Or Use MongoDB Atlas (Cloud - Easier):**
- Go to: https://www.mongodb.com/cloud/atlas
- Sign up for free
- Create a free cluster
- Get your connection string

### Step 2: Start MongoDB

**If using Local MongoDB:**

**Windows:**
```bash
# Open Command Prompt as Administrator
net start MongoDB
```

**Mac/Linux:**
```bash
sudo systemctl start mongod
```

**If using MongoDB Atlas:**
- No need to start anything, it's in the cloud!

### Step 3: Install Backend Dependencies

Open Command Prompt/Terminal and run:

```bash
cd backend
npm install
```

Wait for installation to complete (1-2 minutes).

### Step 4: Create Environment File

Create a file named `.env` in the `backend` folder:

**For Local MongoDB:**
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/srms
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/srms
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

### Step 5: Start the Backend Server

In the same terminal (still in `backend` folder):

```bash
npm start
```

You should see:
```
Server is running on http://localhost:3000
MongoDB Connected: ...
API endpoints available at http://localhost:3000/api
```

**⚠️ IMPORTANT:** Keep this terminal window open! Don't close it.

### Step 6: Open in Browser

Now open your web browser and go to:

```
http://localhost:3000
```

OR

```
http://localhost:3000/Login.html
```

You should see your login page!

---

## ✅ Yes, Localhost Setup is Done!

The backend server is configured to:
- ✅ Serve your frontend files automatically
- ✅ Handle all API requests
- ✅ Connect to MongoDB database
- ✅ Run on `http://localhost:3000`

When you visit `http://localhost:3000`, it will automatically show your `Login.html` page.

---

## Quick Test

1. **Start MongoDB** (if local)
2. **Start backend server** (`npm start` in backend folder)
3. **Open browser** → `http://localhost:3000`
4. **You should see:** Login page
5. **Try signing up** with a new account!

---

## Troubleshooting

**"Cannot connect to MongoDB"**
- Make sure MongoDB is running
- Check MONGODB_URI in `.env` file
- For Atlas, verify username/password

**"Port 3000 already in use"**
- Another program is using port 3000
- Change PORT in `.env` to 3001
- Update `api.js` to use port 3001

**"Cannot GET /"**
- Make sure backend server is running
- Check terminal for errors
- Verify you're going to `http://localhost:3000`

**Page loads but shows errors**
- Open browser console (F12)
- Check for API errors
- Make sure backend is running

---

## Summary

✅ Backend server serves frontend automatically  
✅ No need to set up separate web server  
✅ Just start MongoDB → Start backend → Open browser  
✅ Visit `http://localhost:3000` and you're ready!

The localhost setup is **complete** - you just need to start the services!



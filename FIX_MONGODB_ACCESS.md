# Fix: "Access is Denied" Error for MongoDB

## Problem
You're getting "System error 5 - Access is denied" when trying to start MongoDB.

## Solution: Run CMD as Administrator

### Method 1: Open CMD as Administrator

1. **Press Windows Key**
2. **Type:** `cmd`
3. **Right-click** on "Command Prompt"
4. **Select:** "Run as administrator"
5. **Click:** "Yes" when asked for permission

Now try again:
```cmd
net start MongoDB
```

---

### Method 2: Check if MongoDB is Already Running

MongoDB might already be running! Try this:

```cmd
sc query MongoDB
```

If you see "RUNNING", MongoDB is already started - skip to Step 3!

---

### Method 3: Use MongoDB Atlas (Cloud - No Installation Needed!)

If you don't want to deal with local MongoDB, use the cloud version:

1. **Go to:** https://www.mongodb.com/cloud/atlas
2. **Sign up** for free account
3. **Create a free cluster** (takes 5 minutes)
4. **Get connection string** (looks like: `mongodb+srv://username:password@cluster.mongodb.net/srms`)
5. **Update `.env` file** with the connection string

Then you can skip Step 2 (starting MongoDB) entirely!

---

## Quick Fix Steps

### Option A: Run as Admin (Recommended)

1. Close current CMD window
2. Press `Windows Key`
3. Type `cmd`
4. Right-click → "Run as administrator"
5. Click "Yes"
6. Try: `net start MongoDB` again

### Option B: Use MongoDB Atlas

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string
4. Update `backend/.env` file:
   ```
   MONGODB_URI=mongodb+srv://your-connection-string-here
   ```
5. Skip the `net start MongoDB` step!

---

## After Fixing

Once MongoDB is running (or using Atlas), continue with:

```cmd
cd "C:\Users\LENOVO\OneDrive\Desktop\NTCC\NewSRMS\backend"
npm install
npm start
```

Then open browser to `http://localhost:3000`









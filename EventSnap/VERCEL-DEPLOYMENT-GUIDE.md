# 🚀 Vercel Deployment Guide for EventSnap Frontend

## ✅ Step 1: Prepare Your Project

Your frontend is already configured for Vercel deployment!

### Files Created:
- ✅ `vercel.json` - Deployment configuration
- ✅ `.vercelignore` - Files to ignore during deployment

---

## 📋 Step 2: Deploy to Vercel (Automatic via GitHub)

### Option A: Using Git & GitHub (RECOMMENDED)

**Prerequisites:**
- GitHub account (free)
- Your code pushed to GitHub

**Steps:**

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Prepare for Vercel deployment"
   git remote add origin https://github.com/YOUR_USERNAME/eventsnap.git
   git push -u origin master
   ```

2. **Go to Vercel**
   - Visit https://vercel.com
   - Click "Sign Up" → Choose "GitHub"
   - Authorize Vercel to access your GitHub

3. **Import Your Project**
   - Click "New Project"
   - Select your "eventsnap" repository
   - **Framework:** Select "Create React App" (auto-detected)
   - **Root Directory:** `frontend`
   - Click "Deploy"

4. **Wait for Deployment**
   - Vercel will build and deploy automatically
   - You'll get a URL like: `https://eventsnap-xxxx.vercel.app`

---

### Option B: Using Vercel CLI (MANUAL)

**Prerequisites:**
- Node.js and npm installed

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Frontend**
   ```bash
   cd "E:\Full Stack Project\EventSnap\frontend"
   vercel
   ```

4. **Answer the prompts:**
   - Set project name: `eventsnap`
   - Set production branch: `master`
   - Link existing project: No
   - Build command: `npm run build`
   - Output directory: `build`
   - Root directory: `./`

5. **Copy Your Vercel URL**
   - After deployment succeeds, you'll get: `https://eventsnap-xxxx.vercel.app`

---

## 🔧 Step 3: Update Backend Configuration

Once you have your Vercel URL, update your backend `.env` file:

**File:** `E:\Full Stack Project\EventSnap\backend\.env`

```
FRONTEND_URL=https://YOUR_VERCEL_URL
```

**Example:**
```
FRONTEND_URL=https://eventsnap-abc123.vercel.app
```

### How to Update:

1. Replace the FRONTEND_URL line with your Vercel domain
2. Save the file
3. Restart backend server

---

## 🧪 Step 4: Test Everything

### Test 1: QR Code Generation
1. Go to Admin Dashboard
2. Create a new event
3. The QR code should now contain: `https://YOUR_VERCEL_URL/upload/{eventId}`

### Test 2: Mobile Data Access
1. **Turn OFF WiFi** on your phone
2. **Use only mobile data** (4G/5G)
3. **Scan the QR code** with your camera
4. You should see the clean professional upload page

### Test 3: Upload Functionality
1. Upload photos/videos
2. Enter your name, email, caption
3. Click "Upload"
4. Should see success message

---

## 📊 What Your QR Code Will Look Like

**Before (Local - Doesn't work on mobile data):**
```
http://192.168.0.106:3000/upload/abc123
❌ Only works on local WiFi
```

**After (Vercel - Works everywhere):**
```
https://eventsnap-abc123.vercel.app/upload/abc123
✅ Works on mobile data, any device, anywhere
```

---

## 🔄 Automatic Redeploy

After your first deployment:
- Every time you push code to GitHub → Vercel automatically rebuilds
- No manual deployment needed
- Your URL stays the same

---

## 🚨 Troubleshooting

### Issue: "Build failed on Vercel"
**Solution:** Check build logs in Vercel dashboard
- Go to https://vercel.com/dashboard
- Select your project
- Check "Deployments" tab for error messages

### Issue: "API calls not working"
**Solution:** Make sure backend FRONTEND_URL matches your Vercel URL

### Issue: "QR code still shows old URL"
**Solution:** 
1. Update backend .env file
2. Restart backend server
3. Click "Regenerate QR Codes" button in admin dashboard
4. Redeploy to Vercel: `git push origin master`

---

## ✨ Your New Setup

```
Frontend:  https://eventsnap-xxxx.vercel.app (PUBLIC)
          ↓ (CORS enabled)
Backend:   http://localhost:5000 (LOCAL for now)
          ↓
Database:  MongoDB (LOCAL)
```

---

## 📱 Final Result

✅ **QR codes work on mobile data**
✅ **Anyone can scan and upload photos**
✅ **Professional upload UI opens instantly**
✅ **No WiFi dependency**
✅ **Works worldwide**

---

## 🎉 Next Steps

1. Sign up on Vercel
2. Deploy frontend
3. Update backend FRONTEND_URL
4. Test with mobile data
5. Share QR codes with others!


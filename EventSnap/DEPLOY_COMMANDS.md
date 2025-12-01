# EventSnap Production Deployment Commands

## 🚀 STEP 1: Deploy Backend to Render

### Manual Deployment via Render Dashboard:

1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect GitHub repo: `Dhanushc22/EventSnap-Backend`

**Service Configuration:**
```
Name: eventsnap-backend
Runtime: Node
Build Command: npm install
Start Command: npm start
```

**Environment Variables:**
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://eventsnap.vercel.app
JWT_SECRET=your-super-secret-jwt-key-32-chars-long
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eventsnap
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GMAIL_USER=dhanush.c.s.dev@gmail.com
GMAIL_APP_PASSWORD=lqzy dfbu iofa igcc
```

---

## 🌐 STEP 2: Deploy Frontend to Vercel

### Option A: Vercel Dashboard
1. Go to https://vercel.com
2. Import project: `Dhanushc22/EventSnap-Frontend`
3. Framework: Create React App
4. Root Directory: ./

**Environment Variables:**
```
REACT_APP_API_URL=https://eventsnap-backend.onrender.com/api
```

### Option B: Vercel CLI (Run these commands)
```bash
cd "E:\Full Stack Project\EventSnap\frontend"
npm install -g vercel
vercel login
vercel
```

---

## 🗄️ STEP 3: MongoDB Atlas Setup

1. Go to https://mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Database Access → Add User: `eventsnap-admin`
4. Network Access → Allow All IPs (0.0.0.0/0)
5. Get connection string and update Render MONGODB_URI

---

## ✅ STEP 4: Test Deployment

1. Create new event in admin dashboard
2. Download QR code
3. Scan with phone on mobile data
4. Should open: https://eventsnap.vercel.app/upload/evt_xxx
5. Upload photo and verify it appears

---

## 🛠️ Quick Deploy Commands (Copy-Paste Ready)

### For Render (Backend):
```bash
# Git commands to ensure latest code is pushed
cd "E:\Full Stack Project\EventSnap\backend"
git add .
git commit -m "Deploy to Render"
git push origin master
```

### For Vercel (Frontend):
```bash
# Git commands to ensure latest code is pushed  
cd "E:\Full Stack Project\EventSnap\frontend"
git add .
git commit -m "Deploy to Vercel"
git push origin master

# Then use Vercel dashboard or CLI
vercel --prod
```

---

## 📋 Environment Variables Template

Copy these exact values to your deployment dashboards:

**Render Backend:**
```
PORT=5000
NODE_ENV=production  
FRONTEND_URL=https://eventsnap.vercel.app
JWT_SECRET=generate-32-character-random-string-here
MONGODB_URI=mongodb+srv://eventsnap-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/eventsnap?retryWrites=true&w=majority
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key  
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GMAIL_USER=dhanush.c.s.dev@gmail.com
GMAIL_APP_PASSWORD=lqzy dfbu iofa igcc
```

**Vercel Frontend:**
```
REACT_APP_API_URL=https://eventsnap-backend.onrender.com/api
```

Replace the placeholder values with your actual credentials.

## 🎯 Success Checklist

After deployment:
- [ ] Backend health check: https://eventsnap-backend.onrender.com/api/health
- [ ] Frontend loads: https://eventsnap.vercel.app  
- [ ] Admin login works
- [ ] Create test event
- [ ] QR code shows production URL (NOT localhost)
- [ ] Mobile scan works on mobile data
- [ ] Photo upload succeeds
- [ ] Photo appears in dashboard

Your EventSnap app will be live and globally accessible! 🎉
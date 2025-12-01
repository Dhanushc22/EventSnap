# EventSnap Production Deployment Guide

## 🎯 Deployment Overview

Deploy EventSnap to production using:
- **Frontend**: Vercel (React app) → `https://eventsnap.vercel.app`
- **Backend**: Render (Node.js API) → `https://eventsnap-backend.onrender.com`
- **Database**: MongoDB Atlas (cloud database)
- **QR Codes**: Will work globally on mobile data after deployment

## ⚡ Quick Deployment Steps

### 1. Deploy Backend to Render

1. **Create Render Account** → [render.com](https://render.com)
2. **New Web Service** → Connect GitHub → Select `EventSnap` repo
3. **Configure Service**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Set Environment Variables** in Render Dashboard:
   ```env
   PORT=5000
   NODE_ENV=production
   FRONTEND_URL=https://eventsnap.vercel.app
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/eventsnap
   JWT_SECRET=your-production-jwt-secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   GMAIL_USER=dhanush.c.s.dev@gmail.com
   GMAIL_APP_PASSWORD=lqzy dfbu iofa igcc
   ```

### 2. Deploy Frontend to Vercel

1. **Create Vercel Account** → [vercel.com](https://vercel.com)
2. **Import Project** → Connect GitHub → Select `EventSnap` repo
3. **Configure Project**:
   - Root Directory: `frontend`
   - Framework: Create React App

4. **Set Environment Variable** in Vercel Dashboard:
   ```env
   REACT_APP_API_URL=https://eventsnap-backend.onrender.com/api
   ```

### 3. Test QR Code Flow

After deployment:
1. Login as admin → Create test event
2. Download QR code
3. **CRITICAL TEST**: Scan with phone on **mobile data**
4. Should open: `https://eventsnap.vercel.app/upload/evt_xxx`
5. Upload test photo
6. Verify photo appears in dashboard

## ✅ Success Indicators

- QR codes show: `https://eventsnap.vercel.app/upload/...` (NOT localhost)
- Mobile scan works on any network (WiFi or mobile data)
- Photo upload succeeds from mobile
- No CORS errors in browser console

---

## 📋 Prerequisites

Before starting, create accounts on:
1. [Vercel](https://vercel.com) - For frontend hosting
2. [Render](https://render.com) - For backend hosting
3. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) - For cloud database
4. [Cloudinary](https://cloudinary.com) - For image storage (optional, if using images)

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. **Create a Cluster**:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Click "Build a Database" → Choose FREE tier (M0)
   - Select a cloud provider and region (closest to your users)
   - Name your cluster (e.g., `eventsnap-cluster`)

2. **Create Database User**:
   - Go to "Database Access" → "Add New Database User"
   - Create username and password (save these!)
   - Grant "Read and write to any database" permission

3. **Allow Network Access**:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This allows Render to connect to your database

4. **Get Connection String**:
   - Go to "Database" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<username>` and `<password>` with your database user credentials
   - Add database name: `mongodb+srv://user:pass@cluster.mongodb.net/eventsnap?retryWrites=true&w=majority`

---

## 🖥️ Step 2: Deploy Backend to Render

### A. Prepare Backend for Deployment

1. **Ensure your backend is ready**:
   - ✅ Server binds to `0.0.0.0` (already configured)
   - ✅ CORS allows production domains (already configured)
   - ✅ Environment variables are used (already configured)

2. **Create/Update `package.json` scripts** (if not already present):
   ```json
   {
     "scripts": {
       "start": "node server.js",
       "dev": "nodemon server.js"
     }
   }
   ```

### B. Deploy to Render

1. **Push code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Create Web Service on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `EventSnap` repository

3. **Configure the Service**:
   - **Name**: `eventsnap-backend` (or your choice)
   - **Region**: Choose closest to your users
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend` (point to backend folder)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

4. **Add Environment Variables**:
   Click "Advanced" → Add the following environment variables:
   
   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/eventsnap?retryWrites=true&w=majority
   JWT_SECRET=your_production_jwt_secret_change_this
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=https://your-app-name.vercel.app
   GMAIL_USER=your_email@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password
   ```
   
   **Important Notes**:
   - Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
   - Generate a strong `JWT_SECRET` (use: `openssl rand -base64 32`)
   - You'll update `FRONTEND_URL` after deploying the frontend (Step 3)

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment to complete (2-5 minutes)
   - Copy your backend URL (e.g., `https://eventsnap-backend.onrender.com`)

---

## 🌐 Step 3: Deploy Frontend to Vercel

### A. Prepare Frontend

1. **Create `.env.production` file** in `frontend/` folder:
   ```env
   REACT_APP_API_URL=https://eventsnap-backend.onrender.com/api
   ```
   Replace with your actual Render backend URL from Step 2.

2. **Verify `package.json` has build script**:
   ```json
   {
     "scripts": {
       "build": "react-scripts build",
       "start": "react-scripts start"
     }
   }
   ```

### B. Deploy to Vercel

1. **Install Vercel CLI** (optional, or use dashboard):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard** (recommended):
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the `EventSnap` repository

3. **Configure Project**:
   - **Framework Preset**: Create React App (auto-detected)
   - **Root Directory**: `frontend` (point to frontend folder)
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `build` (or leave default)

4. **Add Environment Variables**:
   Go to "Environment Variables" section and add:
   ```
   REACT_APP_API_URL=https://eventsnap-backend.onrender.com/api
   ```
   Replace with your actual Render backend URL.

5. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (1-3 minutes)
   - Copy your frontend URL (e.g., `https://eventsnap.vercel.app`)

---

## 🔗 Step 4: Connect Frontend and Backend

1. **Update Backend FRONTEND_URL**:
   - Go back to your Render dashboard
   - Navigate to your backend service → "Environment"
   - Update `FRONTEND_URL` to your Vercel URL:
     ```
     FRONTEND_URL=https://eventsnap.vercel.app
     ```
   - Save changes (this will redeploy your backend)

2. **Verify CORS Configuration**:
   Your backend `server.js` should already have:
   ```javascript
   const allowedOrigins = [
     process.env.FRONTEND_URL,
     /\.vercel\.app$/,
     // ... other origins
   ];
   ```
   This allows your Vercel domain to access the backend API.

---

## ✅ Step 5: Test Your Deployment

### Test Checklist:

1. **Frontend Access**:
   - Visit your Vercel URL: `https://your-app.vercel.app`
   - Verify the home page loads correctly

2. **Admin Login**:
   - Go to `/admin-login`
   - Login with: `dhanushc092@gmail.com` / `Dhanush123`
   - Verify you can access the admin dashboard

3. **Create Event**:
   - Login as admin
   - Create a new event
   - Verify QR code is generated

4. **QR Code Test** (CRITICAL):
   - Download/display the QR code
   - Scan with your phone using mobile data (not WiFi)
   - Verify it opens: `https://your-app.vercel.app/upload/[eventId]`
   - Verify NO localtunnel password page appears
   - Test photo upload functionality

5. **Host Login**:
   - Go to `/host-login`
   - Use the event credentials from created event
   - Verify host dashboard loads with event details

---

## 🐛 Troubleshooting

### Issue: "Network Error" or API calls failing

**Solution**: Check CORS configuration
- Verify `FRONTEND_URL` in Render matches your Vercel URL exactly
- Check Render logs for CORS errors: Dashboard → Service → Logs
- Ensure no trailing slash in URLs

### Issue: QR Code not scanning or shows 404

**Solution**: Check QR code generation
- Verify `FRONTEND_URL` environment variable in Render
- Check that `/upload/:eventId` route exists in frontend
- Inspect QR code URL (should be: `https://your-app.vercel.app/upload/[eventId]`)

### Issue: Database connection fails

**Solution**: Check MongoDB Atlas
- Verify connection string has correct username/password
- Check that "Allow Access from Anywhere" (0.0.0.0/0) is enabled in Network Access
- Test connection string locally first

### Issue: Images not uploading

**Solution**: Check Cloudinary configuration
- Verify Cloudinary credentials in Render environment variables
- Check Cloudinary dashboard for errors
- Ensure you're on a paid plan if free tier limits exceeded

---

## 📊 Monitoring and Maintenance

### Render Dashboard:
- Monitor backend logs: Service → Logs
- Check service health: Service → Events
- View resource usage: Service → Metrics

### Vercel Dashboard:
- Monitor deployments: Project → Deployments
- Check build logs: Deployment → Build Logs
- View analytics: Project → Analytics

### MongoDB Atlas:
- Monitor database metrics: Cluster → Metrics
- Check database size: Cluster → Collections
- Set up alerts: Alerts → Create Alert

---

## 🔐 Security Best Practices

1. **Environment Variables**:
   - Never commit `.env` files to version control
   - Use different secrets for production vs development
   - Rotate JWT secrets periodically

2. **Database Security**:
   - Use strong passwords for MongoDB users
   - Limit network access (use Render IPs if possible)
   - Enable database backups in MongoDB Atlas

3. **API Security**:
   - Keep CORS restrictive (only allow your Vercel domain)
   - Use HTTPS for all production URLs
   - Implement rate limiting (future enhancement)

---

## 🚀 Redeployment

### Updating Backend:
1. Push changes to GitHub
2. Render automatically redeploys (if auto-deploy enabled)
3. Or manually trigger: Render Dashboard → Service → Manual Deploy

### Updating Frontend:
1. Push changes to GitHub
2. Vercel automatically redeploys
3. Or manually trigger: Vercel Dashboard → Project → Redeploy

---

## 📞 Support

If you encounter issues:
- Check Render logs for backend errors
- Check Vercel build logs for frontend errors
- Verify all environment variables are set correctly
- Test locally first before deploying to production

---

## ✨ Success!

Your EventSnap app is now live in production! 🎉

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://eventsnap-backend.onrender.com
- **Database**: MongoDB Atlas cloud instance

Users can now:
- Access the app from anywhere
- Scan QR codes on mobile data
- Upload photos to events
- Manage events via admin dashboard

---

**Note**: This deployment uses free tiers. For production use with high traffic, consider upgrading to paid plans for better performance and reliability.

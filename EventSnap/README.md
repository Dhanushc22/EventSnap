<div align="center">
  <img src="https://via.placeholder.com/150x150/9333ea/ffffff?text=📸" alt="EventSnap Logo" width="120" height="120">
  
  # EventSnap
  
  ### 📸 QR-Based Event Photo Collection System
  
  **Capture Every Moment. Transform your events into unforgettable memories.**
  
  [![Node.js](https://img.shields.io/badge/Node.js-16+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
  [![License](https://img.shields.io/badge/License-MIT-purple)](LICENSE)

  [Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Usage](#-usage) • [Tech Stack](#-tech-stack)

</div>

---

## ✨ Features

### 🎯 Core Functionality
- **🔐 Secure Authentication** - Admin and event host login with JWT tokens
- **📅 Event Management** - Create, edit, and manage multiple events
- **📱 QR Code Generation** - Automatic QR code creation for each event
- **📸 Photo Upload** - Drag-and-drop or camera capture for instant uploads
- **✅ Photo Moderation** - Approve, reject, or delete uploaded photos
- **🖼️ Beautiful Galleries** - Responsive photo galleries for each event
- **📊 Real-time Statistics** - Track total photos, approved photos, and active events
- **👤 Anonymous Uploads** - Allow guests to upload photos without accounts

### 🎨 Modern UI/UX
- **Glassmorphic Design** - Stunning glass-effect cards with blur effects
- **Gradient Animations** - Smooth color transitions and hover effects
- **Responsive Layout** - Perfect on desktop, tablet, and mobile devices
- **Dark Purple Theme** - Professional purple gradient background
- **Interactive Elements** - 3D transforms and smooth animations

### 🔧 Advanced Features
- **Real-time Photo Processing** - Thumbnail generation for faster loading
- **Event-specific URLs** - Unique upload and gallery URLs per event
- **Photo Metadata** - Capture uploader name, email, and timestamps
- **Bulk Operations** - Regenerate QR codes for multiple events
- **CORS Support** - Secure cross-origin requests

---

## 📸 Demo

### Landing Page
<div align="center">
  <img src="screenshots/landing-page.png" alt="Landing Page" width="800">
  <p><em>Beautiful landing page with glassmorphic design and gradient animations</em></p>
</div>

### Admin Dashboard
<div align="center">
  <img src="screenshots/admin-dashboard.png" alt="Admin Dashboard" width="800">
  <p><em>Comprehensive dashboard showing event statistics and management options</em></p>
</div>

### Event Details & Photo Management
<div align="center">
  <img src="screenshots/event-photos.png" alt="Event Photos" width="800">
  <p><em>View and moderate photos with approve/reject actions</em></p>
</div>

---

## 📁 Project Structure

```
EventSnap/
├── backend/
│   ├── config/              # Configuration files
│   │   └── cloudinary.js    # Cloudinary setup
│   ├── controllers/         # Business logic
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   └── photoController.js
│   ├── middleware/          # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   └── upload.js        # File upload handling
│   ├── models/              # MongoDB schemas
│   │   ├── Event.js
│   │   ├── EventHost.js
│   │   ├── Photo.js
│   │   └── User.js
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── eventRoutes.js
│   │   └── photoRoutes.js
│   ├── scripts/             # Utility scripts
│   │   ├── seedAdmin.js
│   │   └── regenerateQRCodes.js
│   ├── utils/               # Helper functions
│   │   ├── qrGenerator.js
│   │   ├── emailService.js
│   │   └── eventUtils.js
│   ├── server.js            # Express server
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   │   ├── Navbar.js
│   │   │   └── LoadingSpinner.js
│   │   ├── pages/           # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── HostDashboard.js
│   │   │   ├── EventDetails.js
│   │   │   ├── CreateEvent.js
│   │   │   ├── PhotoUpload.js
│   │   │   └── Gallery.js
│   │   ├── context/         # React context
│   │   │   └── AuthContext.js
│   │   ├── services/        # API services
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css        # Tailwind + custom styles
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v6.0 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/EventSnap.git
cd EventSnap
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Backend `.env` Configuration:**

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventsnap
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:3000

# Cloudinary (Optional - for cloud storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail (Optional - for email notifications)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file
nano .env
```

**Frontend `.env` Configuration:**

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Step 4: Database Setup

```bash
# Start MongoDB (if not running)
mongod

# Seed admin user (in backend directory)
cd backend
node scripts/seedAdmin.js
```

**Default Admin Credentials:**
- Email: `admin@eventsnap.com`
- Password: `admin123`

### Step 5: Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server running at http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# App running at http://localhost:3000
```

---

## 🎯 Usage

### For Event Organizers

1. **Login** - Use admin credentials or create a host account
2. **Create Event** - Click "Create New Event" and fill in details
3. **Generate QR Code** - Automatically generated for each event
4. **Share QR Code** - Display at your event venue or share digitally
5. **Manage Photos** - Approve, reject, or delete uploaded photos
6. **View Gallery** - See all approved photos in a beautiful gallery

### For Event Participants

1. **Scan QR Code** - Use your mobile device to scan the event QR code
2. **Upload Photos** - Drag & drop or use camera to capture moments
3. **Add Details** (Optional) - Include your name, email, and caption
4. **View Gallery** - Access the public gallery to see all photos

---

## 📱 Mobile Network Setup

To use QR codes on mobile devices connected to the same WiFi network:

### Update Configuration

1. **Find your computer's local IP address:**
   ```bash
   # Windows
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   
   # Mac/Linux
   ifconfig
   # Look for inet address
   ```

2. **Update backend `.env`:**
   ```env
   FRONTEND_URL=http://192.168.1.100:3000
   ```

3. **Update frontend `.env`:**
   ```env
   REACT_APP_API_URL=http://192.168.1.100:5000/api
   HOST=0.0.0.0
   ```

4. **Add Windows Firewall rules** (Run PowerShell as Administrator):
   ```powershell
   netsh advfirewall firewall add rule name="EventSnap Backend" dir=in action=allow protocol=TCP localport=5000
   netsh advfirewall firewall add rule name="EventSnap Frontend" dir=in action=allow protocol=TCP localport=3000
   ```

5. **Regenerate QR Codes:**
   ```bash
   cd backend
   node scripts/regenerateQRCodes.js
   ```

6. **Access from mobile:**
   - Ensure mobile is on same WiFi network
   - Open: `http://192.168.1.100:3000`

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v7** - Navigation
- **TanStack Query** - Data fetching & caching
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS
- **React Dropzone** - File uploads
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Multer** - File uploads
- **QRCode** - QR generation
- **Nodemailer** - Email service
- **Cloudinary** - Cloud storage (optional)

---

## 📝 API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@eventsnap.com",
  "password": "admin123"
}
```

### Event Endpoints

#### Get All Events
```http
GET /api/events
Authorization: Bearer <token>
```

#### Create Event
```http
POST /api/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Wedding Celebration",
  "description": "John & Jane's Wedding",
  "date": "2025-12-31"
}
```

#### Get Event Details
```http
GET /api/events/:eventId
```

#### Update Event
```http
PUT /api/events/:id
Authorization: Bearer <token>
```

#### Delete Event
```http
DELETE /api/events/:id
Authorization: Bearer <token>
```

### Photo Endpoints

#### Upload Photos
```http
POST /api/photos/:eventId/upload
Content-Type: multipart/form-data

{
  "photos": [file1, file2],
  "uploaderName": "John Doe",
  "uploaderEmail": "john@example.com",
  "caption": "Great memories!"
}
```

#### Get Event Photos
```http
GET /api/photos/:eventId
```

#### Update Photo Status
```http
PUT /api/photos/:photoId/status
Authorization: Bearer <token>

{
  "status": "approved" // or "rejected"
}
```

#### Delete Photo
```http
DELETE /api/photos/:photoId
Authorization: Bearer <token>
```

---

## 🎨 Key Features Explained

### Glassmorphic Design
The application uses modern glassmorphism effects with:
- Frosted glass backgrounds using `backdrop-blur`
- Transparent overlays with gradient borders
- Smooth animations and hover effects
- Purple gradient color scheme

### QR Code System
- **Automatic Generation** - QR codes created on event creation
- **Base64 Encoding** - Stored directly in database
- **Mobile Optimized** - Direct link to upload page
- **Regeneration Tool** - Bulk regenerate for all events

### Photo Management
- **Drag & Drop** - Intuitive file upload interface
- **Camera Capture** - Direct photo/video capture on mobile
- **Moderation Queue** - Approve/reject workflow
- **Thumbnail Generation** - Automatic optimization
- **Gallery View** - Responsive grid layout

---

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt encryption
- **CORS Protection** - Configured origin restrictions
- **Input Validation** - Mongoose schema validation
- **File Upload Limits** - Size and type restrictions
- **XSS Protection** - Sanitized inputs

---

## 🚀 Deployment

### Deploy Backend (Render/Heroku)

1. **Create new web service**
2. **Set environment variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://...
   JWT_SECRET=your_production_secret
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. **Deploy from GitHub**

### Deploy Frontend (Vercel)

1. **Connect GitHub repository**
2. **Set environment variables:**
   ```env
   REACT_APP_API_URL=https://your-backend.render.com/api
   ```
3. **Deploy**

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**EventSnap Team**

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: contact@eventsnap.com

---

## 🙏 Acknowledgments

- [React Documentation](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Express.js](https://expressjs.com/)
- [Cloudinary](https://cloudinary.com/)

---

<div align="center">
  <p>Made with ❤️ by EventSnap Team</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
1. Push code to GitHub
2. Connect to Vercel
3. Set ROOT_DIR to `frontend`
4. Deploy

### Backend Deployment (Render)
1. Push code to GitHub
2. Connect to Render
3. Set ROOT_DIR to `backend`
4. Deploy

## 🐛 Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running: `mongod`

**Port Already in Use**
- Kill process: `lsof -i :5000` or `netstat -ano | findstr :5000`

**CORS Issues**
- Check backend `.env` FRONTEND_URL matches frontend URL

**QR Code Not Working**
- Verify FRONTEND_URL in backend `.env`
- Click "Regenerate QR Codes" in admin dashboard

## 📦 Technologies

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React, React Router, Axios, TailwindCSS
- **Authentication**: JWT
- **File Upload**: Multer
- **QR Codes**: qrcode library

## 📄 License

MIT License

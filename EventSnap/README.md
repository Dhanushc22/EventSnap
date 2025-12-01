# EventSnap - Clean & Organized Project

## 📁 Project Structure

```
EventSnap/
├── backend/
│   ├── config/          # Database and configuration files
│   ├── controllers/     # Route controllers (events, photos, auth)
│   ├── middleware/      # Express middleware (auth, upload, etc)
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── scripts/         # Utility scripts (seedAdmin.js)
│   ├── utils/           # Helper functions (QR code generation, etc)
│   ├── uploads/         # User uploaded photos/videos
│   ├── server.js        # Main server file
│   ├── package.json     # Dependencies
│   └── .env             # Environment variables
│
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Route pages
│   │   ├── services/    # API services
│   │   ├── context/     # React context (Auth, etc)
│   │   ├── utils/       # Helper functions
│   │   ├── App.js       # Main app component
│   │   └── index.js     # Entry point
│   ├── package.json     # Dependencies
│   └── .env             # Environment variables
│
└── node_modules/        # Root dependencies (none in clean setup)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB running locally
- npm or yarn

### Installation

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

**Start Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Start Frontend:**
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

## 🔧 Configuration

### Backend `.env` Variables
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/eventsnap
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
```

### Frontend `.env` Variables
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 Key Features

✅ **Event Management**
- Create and manage events
- Admin and organizer roles
- Event gallery with photos/videos

✅ **QR Code Sharing**
- Generate QR codes for events
- Mobile-friendly upload pages
- Photo and video capture

✅ **Photo Management**
- Drag-and-drop uploads
- Camera integration
- Gallery view

✅ **Authentication**
- JWT-based auth
- Admin and organizer accounts
- Secure email verification

## 📝 API Endpoints

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Photos
- `GET /api/photos/:eventId` - Get event photos
- `POST /api/photos/:eventId` - Upload photos
- `DELETE /api/photos/:id` - Delete photo

### Auth
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout

## 🎯 Deployment

### Frontend Deployment (Vercel)
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

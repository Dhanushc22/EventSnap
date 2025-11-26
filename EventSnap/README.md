# EventSnap - QR-Based Event Photo Collection System

EventSnap is a full-stack MERN application that enables event organizers to collect photos from participants using QR codes. Perfect for weddings, parties, conferences, and any gathering where memories matter.

## 🚀 Features

- **Easy Event Creation**: Create events with titles, dates, and descriptions
- **QR Code Generation**: Automatic QR code generation for each event
- **Anonymous Photo Upload**: Participants can upload photos without creating accounts
- **Photo Management**: Organizers can view, approve, reject, and download photos
- **Public Gallery**: Shareable gallery for approved photos
- **Real-time Updates**: See photos as they're uploaded during events
- **Bulk Operations**: Approve or delete multiple photos at once
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Cloudinary** - Image storage and optimization
- **QRCode** - QR code generation
- **Multer** - File upload handling

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Query** - Server state management
- **React Hot Toast** - Notifications
- **React Dropzone** - Drag & drop file uploads
- **Lucide React** - Beautiful icons

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for image storage)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/eventsnap
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   FRONTEND_URL=http://localhost:3000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

### Database Setup

#### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. The application will create necessary collections automatically

#### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in your `.env` file

### Cloudinary Setup

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Update the Cloudinary variables in your `.env` file

## 🔧 Configuration

### Backend Configuration

Key environment variables:

- `PORT`: Server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens (change in production!)
- `CLOUDINARY_*`: Cloudinary credentials for image storage
- `FRONTEND_URL`: Frontend URL for CORS and QR code generation

### Frontend Configuration

The frontend is configured to proxy API requests to `http://localhost:5000` during development.

For production, update the `REACT_APP_API_URL` environment variable:

```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## 🚀 Deployment

### Backend Deployment

1. **Prepare for production:**
   - Set `NODE_ENV=production`
   - Use a strong `JWT_SECRET`
   - Configure production MongoDB URI
   - Set up Cloudinary for production

2. **Deploy to platforms like:**
   - Heroku
   - Vercel
   - Railway
   - DigitalOcean

### Frontend Deployment

1. **Build the production version:**
   ```bash
   npm run build
   ```

2. **Deploy to platforms like:**
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Firebase Hosting

## 📱 Usage

### For Organizers:

1. **Sign up** for an account
2. **Create an event** with title, date, and description
3. **Download the QR code** or share the upload link
4. **Place QR codes** at your venue or share digitally
5. **Monitor uploads** in real-time from your dashboard
6. **Manage photos** - approve, reject, or delete as needed
7. **Share the gallery** with participants

### For Participants:

1. **Scan the QR code** at the event
2. **Upload photos** directly from their phone
3. **Add optional details** like name and caption
4. **View the gallery** to see all approved photos

## 🔒 Security Features

- JWT-based authentication
- Input validation and sanitization
- File type and size restrictions
- Rate limiting (recommended for production)
- CORS protection
- Environment variable protection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Events
- `POST /api/events` - Create event (protected)
- `GET /api/events/organizer` - Get organizer events (protected)
- `GET /api/events/organizer/:id` - Get single event (protected)
- `GET /api/events/public/:eventId` - Get public event info
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)

### Photos
- `POST /api/photos/upload/:eventId` - Upload photos (public)
- `GET /api/photos/gallery/:eventId` - Get gallery photos (public)
- `GET /api/photos/event/:eventId` - Get event photos (protected)
- `PUT /api/photos/:photoId/status` - Update photo status (protected)
- `DELETE /api/photos/:photoId` - Delete photo (protected)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Cloudinary](https://cloudinary.com) for image storage and optimization
- [TailwindCSS](https://tailwindcss.com) for the beautiful UI components
- [Lucide](https://lucide.dev) for the amazing icons
- [React Query](https://tanstack.com/query) for excellent server state management

## 🐛 Issues & Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/eventsnap/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about the problem

## 🔮 Future Enhancements

- [ ] Email notifications for new uploads
- [ ] Bulk photo download as ZIP
- [ ] Photo filtering and search
- [ ] Event analytics and insights
- [ ] Mobile app for better mobile experience
- [ ] Social media integration
- [ ] Multi-language support
- [ ] Photo tagging and categorization
- [ ] Advanced privacy settings

---

**Built with ❤️ for capturing life's precious moments!**
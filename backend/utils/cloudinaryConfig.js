const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer for memory storage (we'll upload to Cloudinary manually)
const storage = multer.memoryStorage();

// Create multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files at once
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
    }
  }
});

// Upload single photo
const uploadSingle = upload.single('photo');

// Upload multiple photos
const uploadMultiple = upload.array('photos', 10);

// Upload to Cloudinary
const uploadToCloudinary = async (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const { folder = 'eventsnap', public_id, transformation } = options;
    
    cloudinary.uploader.upload_stream(
      {
        folder,
        public_id,
        transformation: transformation || [
          { width: 1920, height: 1080, crop: 'limit', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    ).end(fileBuffer);
  });
};

// Delete photo from Cloudinary
const deletePhoto = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

// Generate thumbnail
const generateThumbnail = (publicId) => {
  return cloudinary.url(publicId, {
    width: 300,
    height: 300,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto'
  });
};

// Get optimized image URL
const getOptimizedUrl = (publicId, options = {}) => {
  const {
    width = 800,
    height = 600,
    crop = 'limit',
    quality = 'auto',
    format = 'auto'
  } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    fetch_format: format
  });
};

module.exports = {
  cloudinary,
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary,
  deletePhoto,
  generateThumbnail,
  getOptimizedUrl
};
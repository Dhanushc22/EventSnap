const multer = require('multer');
const path = require('path');

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Multer configuration for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files at once
  },
  fileFilter: fileFilter
});

// Single file upload middleware
const uploadSingle = upload.single('photo');

// Multiple files upload middleware
const uploadMultiple = upload.array('photos', 10);

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large. Maximum size is 10MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files. Maximum 10 files allowed.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Unexpected file field.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error.'
        });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Validate uploaded files
const validateFiles = (req, res, next) => {
  // Check if files exist
  if (!req.file && !req.files) {
    return res.status(400).json({
      success: false,
      message: 'No files uploaded'
    });
  }

  // Validate file properties
  const files = req.files || [req.file];
  
  for (const file of files) {
    // Check file size
    if (file.size > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: `File ${file.originalname} is too large. Maximum size is 10MB.`
      });
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `File ${file.originalname} has invalid type. Only JPEG, PNG, and WebP are allowed.`
      });
    }
  }

  next();
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  handleMulterError,
  validateFiles
};
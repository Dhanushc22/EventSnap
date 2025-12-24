const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Initialize configuration
configureCloudinary();

// Upload image to Cloudinary
const uploadImage = async (file, options = {}) => {
  try {
    const {
      folder = 'eventsnap',
      transformation = {},
      public_id,
      tags = [],
      resource_type = 'image'
    } = options;

    const uploadOptions = {
      folder,
      resource_type,
      tags: ['eventsnap', ...tags],
      overwrite: false,
      unique_filename: true,
      use_filename: true,
    };

    if (public_id) {
      uploadOptions.public_id = public_id;
    }

    // Add transformations if provided
    if (Object.keys(transformation).length > 0) {
      uploadOptions.transformation = transformation;
    }

    // Upload file buffer or file path
    let result;
    if (Buffer.isBuffer(file)) {
      result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file);
      });
    } else {
      result = await cloudinary.uploader.upload(file, uploadOptions);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      createdAt: result.created_at,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, options = {}) => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, options));
    const results = await Promise.allSettled(uploadPromises);
    
    const successful = [];
    const failed = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successful.push({
          index,
          ...result.value
        });
      } else {
        failed.push({
          index,
          error: result.reason || result.value.error
        });
      }
    });

    return {
      success: successful.length > 0,
      successful,
      failed,
      totalUploaded: successful.length,
      totalFailed: failed.length
    };
  } catch (error) {
    console.error('Multiple upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate thumbnail transformation
const generateThumbnail = (originalUrl, options = {}) => {
  const {
    width = 300,
    height = 300,
    crop = 'fill',
    quality = 'auto',
    format = 'auto'
  } = options;

  // Extract public ID from Cloudinary URL
  const publicId = extractPublicId(originalUrl);
  
  if (!publicId) {
    return null;
  }

  return cloudinary.url(publicId, {
    width,
    height,
    crop,
    quality,
    format,
    fetch_format: 'auto'
  });
};

// Extract public ID from Cloudinary URL
const extractPublicId = (cloudinaryUrl) => {
  try {
    // Parse Cloudinary URL to extract public ID
    const regex = /\/v\d+\/(.+?)(\.|$)/;
    const match = cloudinaryUrl.match(regex);
    
    if (match && match[1]) {
      return match[1].split('.')[0]; // Remove file extension
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

// Get image info from Cloudinary
const getImageInfo = async (publicId) => {
  try {
    const result = await cloudinary.api.resource(publicId);
    
    return {
      success: true,
      info: {
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        url: result.secure_url,
        createdAt: result.created_at,
        tags: result.tags
      }
    };
  } catch (error) {
    console.error('Get image info error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate optimized image URLs for different sizes
const generateImageVariants = (publicId) => {
  const variants = {
    thumbnail: cloudinary.url(publicId, {
      width: 150,
      height: 150,
      crop: 'fill',
      quality: 'auto',
      format: 'auto'
    }),
    small: cloudinary.url(publicId, {
      width: 400,
      height: 400,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    }),
    medium: cloudinary.url(publicId, {
      width: 800,
      height: 800,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    }),
    large: cloudinary.url(publicId, {
      width: 1200,
      height: 1200,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    }),
    original: cloudinary.url(publicId, {
      quality: 'auto',
      format: 'auto'
    })
  };

  return variants;
};

module.exports = {
  cloudinary,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  generateThumbnail,
  extractPublicId,
  getImageInfo,
  generateImageVariants,
  configureCloudinary
};
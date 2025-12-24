const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Local storage configuration for development
const UPLOAD_DIR = path.join(__dirname, '../uploads/photos');

// Ensure upload directory exists
const ensureUploadDir = async () => {
  try {
    await fs.access(UPLOAD_DIR);
  } catch (error) {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
};

// Save file locally for development
const saveFileLocally = async (buffer, filename) => {
  try {
    await ensureUploadDir();
    const fileId = crypto.randomBytes(16).toString('hex');
    const fileExtension = path.extname(filename);
    const savedFilename = `${fileId}${fileExtension}`;
    const filePath = path.join(UPLOAD_DIR, savedFilename);
    
    await fs.writeFile(filePath, buffer);
    
    return {
      success: true,
      url: `/uploads/photos/${savedFilename}`,
      publicId: fileId,
      filename: savedFilename,
      size: buffer.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  saveFileLocally,
  ensureUploadDir
};
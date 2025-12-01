const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;

// Generate QR code for event upload URL
const generateQRCode = async (eventId, options = {}) => {
  try {
    const {
      format = 'base64', // 'base64', 'svg', 'png', 'buffer'
      width = 300,
      margin = 4,
      color = {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel = 'M' // L, M, Q, H
    } = options;

    // Use FRONTEND_URL from environment (required for production)
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL environment variable is required');
    }

    // Create the upload URL using the configured frontend URL
    const uploadURL = `${process.env.FRONTEND_URL}/upload/${eventId}`;
    
    // QR code options
    const qrOptions = {
      width,
      margin,
      color,
      errorCorrectionLevel,
      type: 'image/png'
    };

    let qrCodeData;

    switch (format) {
      case 'base64':
        qrCodeData = await QRCode.toDataURL(uploadURL, qrOptions);
        break;
      
      case 'svg':
        qrCodeData = await QRCode.toString(uploadURL, {
          ...qrOptions,
          type: 'svg'
        });
        break;
      
      case 'buffer':
        qrCodeData = await QRCode.toBuffer(uploadURL, qrOptions);
        break;
      
      case 'png':
        qrCodeData = await QRCode.toBuffer(uploadURL, qrOptions);
        break;
      
      default:
        qrCodeData = await QRCode.toDataURL(uploadURL, qrOptions);
    }

    return {
      success: true,
      qrCode: qrCodeData,
      uploadURL,
      format,
      eventId
    };
  } catch (error) {
    console.error('QR Code generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate QR code and save to file
const generateQRCodeFile = async (eventId, filePath, options = {}) => {
  try {
    const result = await generateQRCode(eventId, { ...options, format: 'buffer' });
    
    if (!result.success) {
      throw new Error(result.error);
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write file
    await fs.writeFile(filePath, result.qrCode);

    return {
      success: true,
      filePath,
      uploadURL: result.uploadURL,
      eventId
    };
  } catch (error) {
    console.error('QR Code file generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Generate multiple QR code formats for an event
const generateEventQRPackage = async (eventId, options = {}) => {
  try {
    const {
      includeFormats = ['base64', 'svg'],
      sizes = [200, 300, 500],
      baseURL
    } = options;

    // Use FRONTEND_URL from environment (required for production)
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL environment variable is required');
    }

    const qrPackage = {
      eventId,
      uploadURL: `${process.env.FRONTEND_URL}/upload/${eventId}`,
      formats: {}
    };

    // Generate different formats
    for (const format of includeFormats) {
      qrPackage.formats[format] = {};
      
      for (const size of sizes) {
        const result = await generateQRCode(eventId, {
          format,
          width: size,
          baseURL
        });
        
        if (result.success) {
          qrPackage.formats[format][`${size}px`] = result.qrCode;
        }
      }
    }

    return {
      success: true,
      package: qrPackage
    };
  } catch (error) {
    console.error('QR Package generation error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Validate QR code content
const validateQRCode = async (qrCodeData) => {
  try {
    // This would typically decode the QR code to verify its content
    // For now, we'll just check if it's a valid data URL or SVG
    
    if (typeof qrCodeData !== 'string') {
      return { valid: false, error: 'QR code data must be a string' };
    }

    // Check if it's a data URL
    if (qrCodeData.startsWith('data:image/')) {
      return { valid: true, type: 'dataURL' };
    }

    // Check if it's SVG
    if (qrCodeData.includes('<svg')) {
      return { valid: true, type: 'svg' };
    }

    return { valid: false, error: 'Invalid QR code format' };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Get QR code info from event ID
const getQRInfo = (eventId) => {
  if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL environment variable is required');
  }
  
  const uploadURL = `${process.env.FRONTEND_URL}/upload/${eventId}`;
  const galleryURL = `${process.env.FRONTEND_URL}/gallery/${eventId}`;
  
  return {
    eventId,
    uploadURL,
    galleryURL,
    qrText: uploadURL
  };
};

module.exports = {
  generateQRCode,
  generateQRCodeFile,
  generateEventQRPackage,
  validateQRCode,
  getQRInfo
};
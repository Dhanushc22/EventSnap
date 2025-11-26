const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { uploadMultiple, handleMulterError, validateFiles } = require('../middleware/upload');
const {
  uploadPhotos,
  getEventPhotos,
  updatePhotoStatus,
  deletePhoto,
  getPhotoById,
  bulkUpdatePhotoStatus
} = require('../controllers/photoController');

// Public routes (no authentication required)
// Upload photos to event (participants)
router.post('/:eventId', uploadMultiple, handleMulterError, validateFiles, uploadPhotos);

// Get event photos (public gallery - only approved photos)
router.get('/:eventId', optionalAuth, getEventPhotos);

// Get single photo
router.get('/photo/:photoId', optionalAuth, getPhotoById);

// Protected routes (require authentication)
// Update photo status (organizer only)
router.put('/:photoId/status', authenticateToken, updatePhotoStatus);

// Delete photo (organizer only)
router.delete('/:photoId', authenticateToken, deletePhoto);

// Bulk update photo status (organizer only)
router.put('/bulk/status', authenticateToken, bulkUpdatePhotoStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const { authenticateToken, requireOrganizer, optionalAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const {
  uploadPhotos,
  getEventPhotos,
  getGalleryPhotos,
  updatePhotoStatus,
  deletePhotoById,
  bulkPhotoOperations
} = require('../controllers/photoController');

// Public routes (for photo upload and gallery)
router.post('/upload/:eventId', uploadMultiple, uploadPhotos);
router.get('/gallery/:eventId', getGalleryPhotos);

// Protected routes (require organizer authentication)
router.get('/event/:eventId', authenticateToken, requireOrganizer, getEventPhotos);
router.put('/:photoId/status', authenticateToken, requireOrganizer, updatePhotoStatus);
router.delete('/:photoId', authenticateToken, requireOrganizer, deletePhotoById);
router.post('/bulk', authenticateToken, requireOrganizer, bulkPhotoOperations);

module.exports = router;
const express = require('express');
const router = express.Router();
const { authenticateToken, requireOrganizer, optionalAuth, requireAdmin, requireEventAccess } = require('../middleware/auth');
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

// Host routes (can manage photos for their event only)
router.get('/host/event/:eventId', authenticateToken, requireEventAccess, getEventPhotos);
router.put('/host/:photoId/status', authenticateToken, requireEventAccess, updatePhotoStatus);
router.delete('/host/:photoId', authenticateToken, requireEventAccess, deletePhotoById);
router.post('/host/bulk', authenticateToken, requireEventAccess, bulkPhotoOperations);

// Admin routes (can manage photos but NOT view personal photos)
router.get('/admin/event/:eventId/status-only', authenticateToken, requireAdmin, getEventPhotos);
router.put('/admin/:photoId/status', authenticateToken, requireAdmin, updatePhotoStatus);
router.delete('/admin/:photoId', authenticateToken, requireAdmin, deletePhotoById);

// Legacy organizer routes (maintain backward compatibility)
router.get('/event/:eventId', authenticateToken, requireOrganizer, getEventPhotos);
router.put('/:photoId/status', authenticateToken, requireOrganizer, updatePhotoStatus);
router.delete('/:photoId', authenticateToken, requireOrganizer, deletePhotoById);
router.post('/bulk', authenticateToken, requireOrganizer, bulkPhotoOperations);

module.exports = router;
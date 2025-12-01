const express = require('express');
const router = express.Router();
const { authenticateToken, requireOrganizer, requireAdmin } = require('../middleware/auth');
const {
  createEvent,
  getAllEvents,
  getOrganizerEvents,
  getEventById,
  getAdminEventById,
  getEventByEventId,
  updateEvent,
  deleteEvent,
  regenerateQRCodes
} = require('../controllers/eventControllers');

// Admin routes
router.get('/admin', authenticateToken, requireAdmin, getAllEvents);
router.get('/admin/:id', authenticateToken, requireAdmin, getAdminEventById);
router.post('/admin/regenerate-qr', authenticateToken, requireAdmin, regenerateQRCodes);

// Protected routes (require organizer authentication)
router.post('/', authenticateToken, requireOrganizer, createEvent);
router.get('/organizer', authenticateToken, requireOrganizer, getOrganizerEvents);
router.get('/organizer/:id', authenticateToken, requireOrganizer, getEventById);
router.put('/:id', authenticateToken, requireOrganizer, updateEvent);
router.delete('/:id', authenticateToken, requireOrganizer, deleteEvent);

// Host routes (for event hosts to access their event)
router.get('/host/:eventId', authenticateToken, getEventByEventId);

// Public routes (for photo upload and gallery access)
router.get('/public/:eventId', getEventByEventId);

module.exports = router;
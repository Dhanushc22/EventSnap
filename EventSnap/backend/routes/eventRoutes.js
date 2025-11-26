const express = require('express');
const router = express.Router();
const { authenticateToken, requireOrganizer } = require('../middleware/auth');
const {
  createEvent,
  getOrganizerEvents,
  getEventById,
  getEventByEventId,
  updateEvent,
  deleteEvent
} = require('../controllers/eventControllers');

// Protected routes (require organizer authentication)
router.post('/', authenticateToken, requireOrganizer, createEvent);
router.get('/organizer', authenticateToken, requireOrganizer, getOrganizerEvents);
router.get('/organizer/:id', authenticateToken, requireOrganizer, getEventById);
router.put('/:id', authenticateToken, requireOrganizer, updateEvent);
router.delete('/:id', authenticateToken, requireOrganizer, deleteEvent);

// Public routes (for photo upload and gallery access)
router.get('/public/:eventId', getEventByEventId);

module.exports = router;
const express = require('express');
const router = express.Router();
const { authenticateToken, requireOrganizer } = require('../middleware/auth');
const {
  createEvent,
  getUserEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventQRCode,
  getEventQRPackage,
  getEventStats
} = require('../controllers/eventController');

// All routes require authentication and organizer role
router.use(authenticateToken);
router.use(requireOrganizer);

// Event CRUD operations
router.post('/', createEvent);
router.get('/user/:userId', getUserEvents);
router.get('/:eventId', getEventById);
router.put('/:eventId', updateEvent);
router.delete('/:eventId', deleteEvent);

// QR Code operations
router.get('/:eventId/qrcode', getEventQRCode);
router.get('/:eventId/qrpackage', getEventQRPackage);

// Event statistics
router.get('/:eventId/stats', getEventStats);

module.exports = router;
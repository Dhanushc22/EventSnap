const Event = require('../models/Event');
const Photo = require('../models/Photo');
const { generateQRCode, getQRInfo } = require('../utils/qrGenerator');
const validator = require('validator');

// Create new event
const createEvent = async (req, res) => {
  try {
    const { title, description, date, settings = {} } = req.body;
    const organizerId = req.user._id;

    // Validate required fields
    if (!title || !date) {
      return res.status(400).json({
        success: false,
        message: 'Event title and date are required'
      });
    }

    // Validate date
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid date'
      });
    }

    // Create event
    const event = new Event({
      title: title.trim(),
      description: description?.trim(),
      date: eventDate,
      createdBy: organizerId,
      settings: {
        allowAnonymousUpload: true,
        requireApproval: false,
        maxPhotosPerUser: 10,
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxFileSize: 10 * 1024 * 1024,
        ...settings
      }
    });

    await event.save();

    // Generate QR code
    const qrResult = await generateQRCode(event.eventId, {
      baseURL: process.env.FRONTEND_URL
    });

    if (qrResult.success) {
      event.qrCodeURL = qrResult.qrCode;
      await event.save();
    }

    // Populate organizer info
    await event.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event,
        qrCode: qrResult.success ? qrResult.qrCode : null,
        uploadURL: qrResult.uploadURL
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation failed'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
};

// Get all events (Admin only)
const getAllEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'all'
    } = req.query;

    const query = {};
    
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get all events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

// Get events by organizer
const getOrganizerEvents = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'all'
    } = req.query;

    const query = { createdBy: organizerId };
    
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get organizer events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch events'
    });
  }
};

// Get single event by ID (for organizers)
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user._id;

    // Validate ID format
    if (!validator.isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const event = await Event.findOne({
      _id: id,
      createdBy: organizerId
    }).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        event,
        qrInfo: getQRInfo(event.eventId)
      }
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
};

// Get single event by ID (for admins - can view any event)
const getAdminEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!validator.isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const event = await Event.findById(id)
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        event,
        qrInfo: getQRInfo(event.eventId)
      }
    });
  } catch (error) {
    console.error('Get admin event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
};

// Get event by eventId (for public access)
const getEventByEventId = async (req, res) => {
  try {
    const { eventId } = req.params;

    console.log('🔍 Fetching event with eventId:', eventId);

    const event = await Event.findOne({ eventId })
      .populate('createdBy', 'name');

    if (!event) {
      console.log('❌ Event not found with eventId:', eventId);
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    if (!event.isActive) {
      console.log('⚠️ Event found but not active:', eventId);
      return res.status(404).json({
        success: false,
        message: 'Event is no longer active'
      });
    }

    // Get photo stats
    const totalPhotos = await Photo.countDocuments({ eventId: event._id });
    const approvedPhotos = await Photo.countDocuments({ eventId: event._id, status: 'approved' });
    const pendingPhotos = await Photo.countDocuments({ eventId: event._id, status: 'pending' });

    // Return event data with QR code for hosts or public info for participants
    const publicEventData = {
      _id: event._id,
      title: event.title,
      description: event.description,
      date: event.date,
      eventId: event.eventId,
      organizer: event.createdBy?.name || 'Event Organizer',
      qrCodeURL: event.qrCodeURL,
      uploadURL: event.uploadURL,
      galleryURL: event.galleryURL,
      isActive: event.isActive,
      stats: {
        totalPhotos,
        approvedPhotos,
        pendingPhotos
      },
      settings: {
        allowAnonymousUpload: event.settings.allowAnonymousUpload,
        maxPhotosPerUser: event.settings.maxPhotosPerUser,
        allowedFileTypes: event.settings.allowedFileTypes,
        maxFileSize: event.settings.maxFileSize
      }
    };

    console.log('✅ Event found and returned:', publicEventData.title);

    res.status(200).json({
      success: true,
      data: {
        event: publicEventData,
        qrInfo: getQRInfo(event.eventId) // Updated to not pass baseURL parameter
      }
    });
  } catch (error) {
    console.error('Get event by eventId error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event'
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, settings } = req.body;
    const organizerId = req.user._id;

    // Validate ID format
    if (!validator.isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const event = await Event.findOne({
      _id: id,
      createdBy: organizerId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied'
      });
    }

    // Update fields
    if (title) event.title = title.trim();
    if (description !== undefined) event.description = description.trim();
    if (date) {
      const eventDate = new Date(date);
      if (isNaN(eventDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid date'
        });
      }
      event.date = eventDate;
    }
    if (settings) {
      event.settings = { ...event.settings, ...settings };
    }

    await event.save();
    await event.populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: errors[0] || 'Validation failed'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
};

// Delete event (soft delete)
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const organizerId = req.user._id;

    // Validate ID format
    if (!validator.isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const event = await Event.findOne({
      _id: id,
      createdBy: organizerId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied'
      });
    }

    // Soft delete
    event.isActive = false;
    await event.save();

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
};

// Regenerate QR codes for all events (Admin only)
const regenerateQRCodes = async (req, res) => {
  try {
    const events = await Event.find({ isActive: true });
    let updated = 0;
    let failed = 0;

    for (const event of events) {
      try {
        const qrResult = await generateQRCode(event.eventId, {
          baseURL: process.env.FRONTEND_URL
        });

        if (qrResult.success) {
          event.qrCodeURL = qrResult.qrCode;
          await event.save();
          updated++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to regenerate QR for event ${event.eventId}:`, error);
        failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `QR codes regenerated successfully. Updated: ${updated}, Failed: ${failed}`,
      data: {
        totalEvents: events.length,
        updated,
        failed,
        newBaseURL: process.env.FRONTEND_URL
      }
    });
  } catch (error) {
    console.error('Regenerate QR codes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate QR codes'
    });
  }
};



module.exports = {
  createEvent,
  getAllEvents,
  getOrganizerEvents,
  getEventById,
  getAdminEventById,
  getEventByEventId,
  updateEvent,
  deleteEvent,
  regenerateQRCodes
};
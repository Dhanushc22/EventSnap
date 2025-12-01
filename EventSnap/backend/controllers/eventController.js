const Event = require('../models/Event');
const Photo = require('../models/Photo');
const { generateQRCode, generateEventQRPackage } = require('../utils/qrGenerator');

// Create a new event
const createEvent = async (req, res) => {
  try {
    const { title, description, date, settings } = req.body;
    const organizerId = req.user._id;

    console.log('📝 Create event request:', { title, description, date, settings });

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

    // Create event object
    const eventData = {
      title: title.trim(),
      description: description ? description.trim() : '',
      date: eventDate,
      createdBy: organizerId
    };

    // Add settings if provided
    if (settings) {
      eventData.settings = {
        allowAnonymousUpload: settings.allowAnonymousUpload !== false,
        requireApproval: settings.requireApproval === true,
        maxPhotosPerUser: settings.maxPhotosPerUser || 10
      };
    }

    // Create event
    const event = new Event(eventData);

    // Save event (this will auto-generate eventId and uploadURL)
    await event.save();
    
    console.log('✅ Event saved:', { eventId: event.eventId, uploadURL: event.uploadURL });

    // Generate QR code
    const qrResult = await generateQRCode(event.eventId, {
      format: 'base64',
      width: 300
    });

    if (qrResult.success) {
      event.qrCodeURL = qrResult.qrCode;
      await event.save();
    }

    // Populate creator info
    await event.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event
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

// Get all events for the authenticated organizer
const getUserEvents = async (req, res) => {
  try {
    const organizerId = req.user._id;
    const { page = 1, limit = 10, status = 'all', sortBy = 'date', sortOrder = 'desc' } = req.query;

    // Build query
    const query = { createdBy: organizerId };
    
    if (status !== 'all') {
      query.isActive = status === 'active';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get events with pagination
    const events = await Event.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email');

    // Get total count
    const total = await Event.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalEvents: total,
          hasNextPage: parseInt(page) < Math.ceil(total / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get events'
    });
  }
};

// Get single event by ID
const getEventById = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;

    const event = await Event.findOne({
      $or: [
        { _id: eventId },
        { eventId: eventId }
      ],
      createdBy: organizerId
    }).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Generate QR info URLs - FRONTEND_URL is required
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL environment variable is required');
    }
    const qrInfo = {
      uploadURL: `${process.env.FRONTEND_URL}/upload/${event.eventId}`,
      galleryURL: `${process.env.FRONTEND_URL}/gallery/${event.eventId}`
    };

    res.status(200).json({
      success: true,
      data: {
        event,
        qrInfo
      }
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event'
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, date, settings } = req.body;
    const organizerId = req.user._id;

    // Find event
    const event = await Event.findOne({
      $or: [
        { _id: eventId },
        { eventId: eventId }
      ],
      createdBy: organizerId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
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

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;

    // Find event
    const event = await Event.findOne({
      $or: [
        { _id: eventId },
        { eventId: eventId }
      ],
      createdBy: organizerId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Hard delete - remove event and all associated photos
    const eventIdValue = event.eventId;
    
    // Delete all photos for this event
    await Photo.deleteMany({ eventId: eventIdValue });
    
    // Delete the event
    await Event.deleteOne({ _id: event._id });

    console.log(`✅ Event deleted: ${eventIdValue}`);

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

// Get event QR code with different formats and sizes
const getEventQRCode = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { format = 'base64', size = 300 } = req.query;
    const organizerId = req.user._id;

    // Find event
    const event = await Event.findOne({
      $or: [
        { _id: eventId },
        { eventId: eventId }
      ],
      createdBy: organizerId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Generate QR code with specified format and size
    const qrResult = await generateQRCode(event.eventId, {
      format,
      width: parseInt(size)
    });

    if (!qrResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR code'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        eventId: event.eventId,
        qrCode: qrResult.qrCode,
        uploadURL: qrResult.uploadURL,
        format,
        size: parseInt(size)
      }
    });
  } catch (error) {
    console.error('Get event QR code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get QR code'
    });
  }
};

// Get event QR package (multiple formats and sizes)
const getEventQRPackage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;

    // Find event
    const event = await Event.findOne({
      $or: [
        { _id: eventId },
        { eventId: eventId }
      ],
      createdBy: organizerId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Generate QR package
    const packageResult = await generateEventQRPackage(event.eventId, {
      includeFormats: ['base64', 'svg'],
      sizes: [200, 300, 500]
    });

    if (!packageResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate QR package'
      });
    }

    res.status(200).json({
      success: true,
      data: packageResult.package
    });
  } catch (error) {
    console.error('Get event QR package error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get QR package'
    });
  }
};

// Get event statistics
const getEventStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;

    // Find event
    const event = await Event.findOne({
      $or: [
        { _id: eventId },
        { eventId: eventId }
      ],
      createdBy: organizerId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get detailed stats
    const totalPhotos = await Photo.countDocuments({ eventId: event._id });
    const approvedPhotos = await Photo.countDocuments({ eventId: event._id, status: 'approved' });
    const pendingPhotos = await Photo.countDocuments({ eventId: event._id, status: 'pending' });
    const rejectedPhotos = await Photo.countDocuments({ eventId: event._id, status: 'rejected' });

    // Get recent photos
    const recentPhotos = await Photo.find({ eventId: event._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('photoURL thumbnailURL uploadedByName uploadedTime status');

    const stats = {
      totalPhotos,
      approvedPhotos,
      pendingPhotos,
      rejectedPhotos,
      recentPhotos,
      eventInfo: {
        title: event.title,
        date: event.date,
        createdAt: event.createdAt
      }
    };

    res.status(200).json({
      success: true,
      data: {
        stats
      }
    });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get event statistics'
    });
  }
};

module.exports = {
  createEvent,
  getUserEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventQRCode,
  getEventQRPackage,
  getEventStats
};
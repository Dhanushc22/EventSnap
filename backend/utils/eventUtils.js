/**
 * UNIFIED EVENT UTILITIES - BACKEND
 * Used consistently across: Event Creation, Updates, QR Code, Photo Processing
 * Ensures same logic/code reuse everywhere
 */

const { generateQRCode } = require('./qrGenerator');

// ============================================
// 1. EVENT DATA VALIDATION
// ============================================
const validateEventData = (eventData) => {
  const errors = {};
  
  if (!eventData.title || eventData.title.trim() === '') {
    errors.title = 'Event title is required';
  }
  
  if (!eventData.date) {
    errors.date = 'Event date is required';
  } else {
    const eventDate = new Date(eventData.date);
    if (isNaN(eventDate.getTime())) {
      errors.date = 'Invalid date format';
    }
  }
  
  if (eventData.title && eventData.title.length > 100) {
    errors.title = 'Event title must be less than 100 characters';
  }
  
  if (eventData.description && eventData.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================
// 2. EVENT INITIALIZATION
// ============================================
/**
 * Initialize event with all required fields
 * Used consistently in create and update operations
 */
const initializeEventData = (req) => {
  const { title, description, date, settings } = req.body;
  
  return {
    title: title.trim(),
    description: description ? description.trim() : '',
    date: new Date(date),
    settings: {
      allowAnonymousUpload: settings?.allowAnonymousUpload !== false,
      requireApproval: settings?.requireApproval === true,
      maxPhotosPerUser: settings?.maxPhotosPerUser || 10
    }
  };
};

// ============================================
// 3. QR CODE GENERATION - UNIFIED LOGIC
// ============================================
/**
 * Generate QR code for event
 * Used in: createEvent, createPublicEvent, updateEvent
 * Returns: { success, qrCode, uploadURL }
 */
const generateEventQRCode = async (eventId, options = {}) => {
  const {
    format = 'base64',
    width = 300
  } = options;
  
  if (!process.env.FRONTEND_URL) {
    throw new Error('FRONTEND_URL environment variable is required for QR code generation');
  }
  
  try {
    const qrResult = await generateQRCode(eventId, {
      format,
      width
    });
    
    if (qrResult.success) {
      return {
        success: true,
        qrCodeURL: qrResult.qrCode,
        uploadURL: `${baseURL}/upload/${eventId}`
      };
    }
    
    return { success: false };
  } catch (error) {
    console.error('QR generation error:', error);
    return { success: false };
  }
};

// ============================================
// 4. EVENT RESPONSE FORMATTING
// ============================================
/**
 * Format event for API response
 * Used consistently across all event endpoints
 */
const formatEventResponse = (event, includeQRInfo = true) => {
  const formatted = {
    _id: event._id,
    eventId: event.eventId,
    title: event.title,
    description: event.description,
    date: event.date,
    uploadURL: event.uploadURL,
    qrCodeURL: event.qrCodeURL,
    isActive: event.isActive,
    stats: {
      totalPhotos: event.stats?.totalPhotos || 0,
      approvedPhotos: event.stats?.approvedPhotos || 0,
      pendingPhotos: event.stats?.pendingPhotos || 0,
      rejectedPhotos: event.stats?.rejectedPhotos || 0
    },
    settings: event.settings || {
      allowAnonymousUpload: true,
      requireApproval: false,
      maxPhotosPerUser: 10
    }
  };
  
  if (event.createdBy) {
    formatted.createdBy = event.createdBy;
  }
  
  if (includeQRInfo) {
    if (!process.env.FRONTEND_URL) {
      throw new Error('FRONTEND_URL environment variable is required');
    }
    formatted.qrInfo = {
      uploadURL: `${process.env.FRONTEND_URL}/upload/${event.eventId}`,
      galleryURL: `${process.env.FRONTEND_URL}/gallery/${event.eventId}`
    };
  }
  
  return formatted;
};

// ============================================
// 5. EVENT CREATION - UNIFIED FLOW
// ============================================
/**
 * Complete event creation flow
 * Used in: adminRoutes, dualAuth
 * Handles: validation, initialization, QR generation, response formatting
 */
const createEventFlow = async (eventData, Event, options = {}) => {
  const {
    createdBy,
    hostEmail = null,
    password = null,
    baseURL = process.env.FRONTEND_URL
  } = options;
  
  // Validate
  const validation = validateEventData(eventData);
  if (!validation.isValid) {
    return { success: false, errors: validation.errors };
  }
  
  try {
    // Initialize
    const initData = {
      title: eventData.title.trim(),
      description: eventData.description ? eventData.description.trim() : '',
      date: new Date(eventData.date),
      createdBy
    };
    
    if (eventData.settings) {
      initData.settings = {
        allowAnonymousUpload: eventData.settings.allowAnonymousUpload !== false,
        requireApproval: eventData.settings.requireApproval === true,
        maxPhotosPerUser: eventData.settings.maxPhotosPerUser || 10
      };
    }
    
    if (hostEmail) initData.hostEmail = hostEmail;
    if (password) initData.password = password;
    
    // Create
    const event = new Event(initData);
    await event.save();
    
    console.log('✅ Event created:', { eventId: event.eventId, _id: event._id });
    
    // Generate QR
    const qrData = await generateEventQRCode(event.eventId);
    if (qrData.success) {
      event.qrCodeURL = qrData.qrCodeURL;
      event.uploadURL = `${process.env.FRONTEND_URL}/upload/${event.eventId}`;
      event.galleryURL = `${process.env.FRONTEND_URL}/gallery/${event.eventId}`;
      await event.save();
      console.log('✅ QR code generated:', event.eventId);
    }
    
    // Populate and format
    await event.populate('createdBy', 'name email');
    const formattedEvent = formatEventResponse(event);
    
    return {
      success: true,
      event: formattedEvent
    };
  } catch (error) {
    console.error('Event creation flow error:', error);
    return {
      success: false,
      message: 'Failed to create event',
      error: error.message
    };
  }
};

// ============================================
// 6. EVENT UPDATE - UNIFIED FLOW
// ============================================
const updateEventFlow = async (eventId, updateData, Event, userId, options = {}) => {
  const { baseURL = process.env.FRONTEND_URL } = options;
  
  try {
    // Find event (by _id or eventId, owned by user)
    const event = await Event.findOne({
      $or: [
        { _id: eventId },
        { eventId: eventId }
      ],
      createdBy: userId
    });
    
    if (!event) {
      return { success: false, message: 'Event not found' };
    }
    
    // Update fields
    if (updateData.title) event.title = updateData.title.trim();
    if (updateData.description !== undefined) event.description = updateData.description.trim();
    if (updateData.date) event.date = new Date(updateData.date);
    if (updateData.settings) {
      event.settings = { ...event.settings, ...updateData.settings };
    }
    if (updateData.isActive !== undefined) event.isActive = updateData.isActive;
    
    await event.save();
    await event.populate('createdBy', 'name email');
    
    return {
      success: true,
      event: formatEventResponse(event)
    };
  } catch (error) {
    console.error('Event update flow error:', error);
    return {
      success: false,
      message: 'Failed to update event'
    };
  }
};

// ============================================
// 7. PHOTO PROCESSING
// ============================================
/**
 * Update photo approval status
 * Unified logic for all photo status updates
 */
const updatePhotoStatus = async (photoId, newStatus, Photo, Event) => {
  try {
    const photo = await Photo.findByIdAndUpdate(
      photoId,
      { status: newStatus },
      { new: true }
    );
    
    if (!photo) {
      return { success: false, message: 'Photo not found' };
    }
    
    // Update event stats
    if (photo.eventId) {
      const event = await Event.findOne({ eventId: photo.eventId });
      if (event) {
        // Recalculate stats
        const photos = await Photo.find({ eventId: photo.eventId });
        event.stats = {
          totalPhotos: photos.length,
          approvedPhotos: photos.filter(p => p.status === 'approved').length,
          pendingPhotos: photos.filter(p => p.status === 'pending').length,
          rejectedPhotos: photos.filter(p => p.status === 'rejected').length
        };
        await event.save();
      }
    }
    
    return { success: true, photo };
  } catch (error) {
    console.error('Photo status update error:', error);
    return { success: false, message: 'Failed to update photo' };
  }
};

// ============================================
// 8. BATCH OPERATIONS
// ============================================
/**
 * Get all events with calculated stats
 */
const getEventsWithStats = async (query, Event) => {
  try {
    const events = await Event.find(query).populate('createdBy', 'name email');
    return events.map(event => formatEventResponse(event, false));
  } catch (error) {
    console.error('Get events error:', error);
    return [];
  }
};

/**
 * Get single event with all related data
 */
const getEventComplete = async (eventId, userId, Event, Photo) => {
  try {
    const event = await Event.findOne({
      $or: [
        { _id: eventId },
        { eventId: eventId }
      ],
      createdBy: userId
    }).populate('createdBy', 'name email');
    
    if (!event) {
      return { success: false, message: 'Event not found' };
    }
    
    // Get related photos
    const photos = await Photo.find({ eventId: event.eventId });
    
    return {
      success: true,
      event: formatEventResponse(event),
      photos: photos,
      photoStats: {
        total: photos.length,
        approved: photos.filter(p => p.status === 'approved').length,
        pending: photos.filter(p => p.status === 'pending').length,
        rejected: photos.filter(p => p.status === 'rejected').length
      }
    };
  } catch (error) {
    console.error('Get event complete error:', error);
    return { success: false, message: 'Failed to fetch event' };
  }
};

// ============================================
// 9. SEARCH & FILTER
// ============================================
const searchEvents = (events, query) => {
  if (!query || query.trim() === '') return events;
  
  const lowerQuery = query.toLowerCase();
  return events.filter(event =>
    event.title.toLowerCase().includes(lowerQuery) ||
    event.description.toLowerCase().includes(lowerQuery) ||
    event.eventId.toLowerCase().includes(lowerQuery)
  );
};

const filterEventsByStatus = (events, isActive) => {
  if (isActive === undefined) return events;
  return events.filter(event => event.isActive === isActive);
};

const sortEvents = (events, sortBy = 'date', order = 'desc') => {
  return [...events].sort((a, b) => {
    let aVal, bVal;
    
    switch(sortBy) {
      case 'date':
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
        break;
      case 'title':
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case 'photos':
        aVal = a.stats?.totalPhotos || 0;
        bVal = b.stats?.totalPhotos || 0;
        break;
      default:
        return 0;
    }
    
    return order === 'desc' ? bVal - aVal : aVal - bVal;
  });
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  // Validation
  validateEventData,
  
  // Initialization
  initializeEventData,
  
  // QR Code
  generateEventQRCode,
  
  // Response Formatting
  formatEventResponse,
  
  // Event Operations
  createEventFlow,
  updateEventFlow,
  
  // Photo Operations
  updatePhotoStatus,
  
  // Batch Operations
  getEventsWithStats,
  getEventComplete,
  
  // Search & Filter
  searchEvents,
  filterEventsByStatus,
  sortEvents
};

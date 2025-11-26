const Event = require('../models/Event');
const Photo = require('../models/Photo');
const { saveFileLocally } = require('../utils/localStorage');

// Upload photos to an event (public endpoint - no auth required)
const uploadPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uploaderName, uploaderEmail, caption } = req.body;
    
    // Find event by eventId (not _id)
    const event = await Event.findOne({ eventId, isActive: true });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or no longer accepting photos'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos uploaded'
      });
    }

    // Check event settings
    const maxPhotos = event.settings.maxPhotosPerUser || 10;
    
    if (req.files.length > maxPhotos) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${maxPhotos} photos allowed per upload`
      });
    }

    // Upload photos using local storage for development
    const uploadResults = [];
    const uploadPromises = req.files.map(async (file) => {
      try {
        // Use local storage for development
        const uploadResult = await saveFileLocally(file.buffer, file.originalname);
        
        if (!uploadResult.success) {
          throw new Error(`Local storage failed: ${uploadResult.error}`);
        }
        
        // Add missing properties for local storage compatibility
        uploadResult.bytes = uploadResult.size || file.size;
        uploadResult.width = 800; // Default dimensions
        uploadResult.height = 600;

        // Generate thumbnail URL (for local storage, use same URL)
        const thumbnailURL = uploadResult.url;
        
        // Create photo record
        const photo = new Photo({
          eventId: event._id,
          photoURL: uploadResult.url,
          thumbnailURL,
          publicId: uploadResult.publicId,
          originalFileName: file.originalname,
          uploadedByName: uploaderName || 'Anonymous',
          uploadedByEmail: uploaderEmail || null,
          caption: caption || null,
          status: 'approved', // Force approve all photos for development
          metadata: {
            fileSize: uploadResult.bytes || uploadResult.size,
            mimeType: file.mimetype,
            dimensions: {
              width: uploadResult.width || 800,
              height: uploadResult.height || 600
            },
            uploadIP: req.ip || req.connection.remoteAddress
          }
        });

        console.log('🔍 Photo before save:', {
          status: photo.status,
          eventId: photo.eventId,
          url: photo.photoURL
        });

        await photo.save();
        
        console.log('✅ Photo saved successfully:', {
          id: photo._id,
          eventId: event.eventId,
          url: photo.photoURL,
          status: photo.status
        });
        
        return photo;
      } catch (error) {
        console.error('Individual photo upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
    });

    try {
      const photos = await Promise.all(uploadPromises);
      
      // Update event stats
      await event.updateStats();

      res.status(201).json({
        success: true,
        message: `${photos.length} photo(s) uploaded successfully`,
        data: {
          photos: photos.map(photo => ({
            id: photo._id,
            photoURL: photo.photoURL,
            thumbnailURL: photo.thumbnailURL,
            uploadedByName: photo.uploadedByName,
            uploadedTime: photo.uploadedTime,
            status: photo.status
          })),
          event: {
            title: event.title,
            eventId: event.eventId
          }
        }
      });
    } catch (uploadError) {
      console.error('Photo upload error:', uploadError);
      res.status(500).json({
        success: false,
        message: 'Some photos failed to upload',
        error: uploadError.message
      });
    }
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photos'
    });
  }
};

// Get photos for an event (with pagination)
const getEventPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { 
      page = 1, 
      limit = 20, 
      status = 'approved',
      sortBy = 'uploadedTime',
      sortOrder = 'desc'
    } = req.query;

    // Find event
    let event;
    if (req.user) {
      // If authenticated, find event by organizer
      event = await Event.findOne({
        $or: [{ _id: eventId }, { eventId }],
        createdBy: req.user._id
      });
    } else {
      // If not authenticated, find public event
      event = await Event.findOne({
        $or: [{ _id: eventId }, { eventId }],
        isActive: true
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get photos with pagination
    const result = await Photo.getPhotosByEvent(event._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status: req.user ? null : status, // Organizers see all photos, public sees only approved
      sortBy,
      sortOrder
    });

    res.status(200).json({
      success: true,
      data: {
        ...result,
        event: {
          title: event.title,
          eventId: event.eventId,
          date: event.date
        }
      }
    });
  } catch (error) {
    console.error('Get event photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get photos'
    });
  }
};

// Update photo status (approve/reject) - Organizer only
const updatePhotoStatus = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { status } = req.body;
    const organizerId = req.user._id;

    // Validate status
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be approved, rejected, or pending'
      });
    }

    // Find photo and verify ownership
    const photo = await Photo.findById(photoId).populate({
      path: 'eventId',
      match: { createdBy: organizerId }
    });

    if (!photo || !photo.eventId) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found or access denied'
      });
    }

    // Update photo status
    photo.status = status;
    await photo.save();

    // Update event stats
    await photo.eventId.updateStats();

    res.status(200).json({
      success: true,
      message: `Photo ${status} successfully`,
      data: {
        photo: {
          id: photo._id,
          status: photo.status,
          photoURL: photo.photoURL,
          uploadedByName: photo.uploadedByName,
          uploadedTime: photo.uploadedTime
        }
      }
    });
  } catch (error) {
    console.error('Update photo status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update photo status'
    });
  }
};

// Delete photo - Organizer only
const deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const organizerId = req.user._id;

    // Find photo and verify ownership
    const photo = await Photo.findById(photoId).populate({
      path: 'eventId',
      match: { createdBy: organizerId }
    });

    if (!photo || !photo.eventId) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found or access denied'
      });
    }

    // Delete local file (for development)
    try {
      const fs = require('fs').promises;
      const path = require('path');
      if (photo.photoURL && photo.photoURL.startsWith('/uploads/')) {
        const filePath = path.join(__dirname, '../', photo.photoURL);
        await fs.unlink(filePath);
        console.log('✅ Local file deleted:', filePath);
      }
    } catch (fileError) {
      console.warn('Failed to delete local file:', fileError.message);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await Photo.findByIdAndDelete(photoId);

    // Update event stats
    await photo.eventId.updateStats();

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete photo'
    });
  }
};

// Get single photo details
const getPhotoById = async (req, res) => {
  try {
    const { photoId } = req.params;

    const photo = await Photo.findById(photoId).populate('eventId', 'title eventId date isActive');

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Check if user can view this photo
    if (req.user) {
      // Authenticated user - check if they own the event
      if (photo.eventId.createdBy.toString() !== req.user._id.toString()) {
        // Not the owner, check if photo is approved and event is active
        if (photo.status !== 'approved' || !photo.eventId.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      }
    } else {
      // Public user - only approved photos from active events
      if (photo.status !== 'approved' || !photo.eventId.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Photo not available'
        });
      }
    }

    // Increment view count
    await photo.incrementViewCount();

    res.status(200).json({
      success: true,
      data: {
        photo
      }
    });
  } catch (error) {
    console.error('Get photo by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get photo'
    });
  }
};

// Bulk update photo status - Organizer only
const bulkUpdatePhotoStatus = async (req, res) => {
  try {
    const { photoIds, status } = req.body;
    const organizerId = req.user._id;

    // Validate input
    if (!Array.isArray(photoIds) || photoIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Photo IDs array is required'
      });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Find photos and verify ownership
    const photos = await Photo.find({
      _id: { $in: photoIds }
    }).populate({
      path: 'eventId',
      match: { createdBy: organizerId }
    });

    const validPhotos = photos.filter(photo => photo.eventId);

    if (validPhotos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid photos found'
      });
    }

    // Update all valid photos
    const updatePromises = validPhotos.map(photo => {
      photo.status = status;
      return photo.save();
    });

    await Promise.all(updatePromises);

    // Update event stats for affected events
    const eventIds = [...new Set(validPhotos.map(photo => photo.eventId._id))];
    const eventUpdatePromises = eventIds.map(eventId => 
      Event.findById(eventId).then(event => event.updateStats())
    );

    await Promise.all(eventUpdatePromises);

    res.status(200).json({
      success: true,
      message: `${validPhotos.length} photos updated to ${status}`,
      data: {
        updatedCount: validPhotos.length,
        totalRequested: photoIds.length
      }
    });
  } catch (error) {
    console.error('Bulk update photo status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update photos'
    });
  }
};

// Get gallery photos (public endpoint)
const getGalleryPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Find public event
    const event = await Event.findOne({ eventId, isActive: true });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Get approved photos only for public gallery
    const result = await Photo.getPhotosByEvent(event._id, {
      page: parseInt(page),
      limit: parseInt(limit),
      status: 'approved'
    });

    res.status(200).json({
      success: true,
      data: {
        ...result,
        event: {
          title: event.title,
          eventId: event.eventId,
          date: event.date
        }
      }
    });
  } catch (error) {
    console.error('Get gallery photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get gallery photos'
    });
  }
};

// Alias for deletePhoto
const deletePhotoById = deletePhoto;

// Alias for bulkUpdatePhotoStatus
const bulkPhotoOperations = bulkUpdatePhotoStatus;

module.exports = {
  uploadPhotos,
  getEventPhotos,
  getGalleryPhotos,
  updatePhotoStatus,
  deletePhoto,
  deletePhotoById,
  getPhotoById,
  bulkUpdatePhotoStatus,
  bulkPhotoOperations
};
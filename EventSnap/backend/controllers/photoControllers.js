const Photo = require('../models/Photo');
const Event = require('../models/Event');
const { uploadToCloudinary, deletePhoto, generateThumbnail } = require('../utils/cloudinaryConfig');
const validator = require('validator');

// Upload photos to an event
const uploadPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { uploadedByName, uploadedByEmail, caption } = req.body;

    // Find event by eventId
    const event = await Event.findOne({ eventId, isActive: true });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or no longer active'
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No photos were uploaded'
      });
    }

    // Validate email if provided
    if (uploadedByEmail && !validator.isEmail(uploadedByEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      try {
        // Upload to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(file.buffer, {
          folder: `eventsnap/${eventId}`,
          public_id: `${eventId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        });

        // Create photo record
        const photo = new Photo({
          eventId: event._id,
          photoURL: cloudinaryResult.secure_url,
          thumbnailURL: generateThumbnail(cloudinaryResult.public_id),
          publicId: cloudinaryResult.public_id,
          originalFileName: file.originalname,
          uploadedByName: uploadedByName || 'Anonymous',
          uploadedByEmail: uploadedByEmail,
          caption: caption,
          metadata: {
            fileSize: file.size,
            mimeType: file.mimetype,
            dimensions: {
              width: cloudinaryResult.width,
              height: cloudinaryResult.height
            },
            uploadIP: req.ip
          },
          status: event.settings.requireApproval ? 'pending' : 'approved'
        });

        await photo.save();
        return photo;
      } catch (uploadError) {
        console.error('Individual photo upload error:', uploadError);
        return { error: uploadError.message, fileName: file.originalname };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    // Separate successful uploads from errors
    const successfulUploads = results.filter(result => !result.error);
    const failedUploads = results.filter(result => result.error);

    // Update event stats
    await event.updateStats();

    res.status(201).json({
      success: true,
      message: `${successfulUploads.length} photo(s) uploaded successfully`,
      data: {
        uploadedPhotos: successfulUploads,
        failedUploads: failedUploads.length > 0 ? failedUploads : undefined,
        eventTitle: event.title
      }
    });
  } catch (error) {
    console.error('Upload photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload photos'
    });
  }
};

// Get photos for an event (for organizers)
const getEventPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const organizerId = req.user._id;
    const {
      page = 1,
      limit = 20,
      status = 'all',
      sortBy = 'uploadedTime',
      sortOrder = 'desc'
    } = req.query;

    // Find event and verify ownership
    const event = await Event.findOne({
      _id: eventId,
      createdBy: organizerId
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or access denied'
      });
    }

    // Build query
    const query = { eventId: event._id };
    if (status !== 'all') {
      query.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const photos = await Photo.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Photo.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        photos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPhotos: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        event: {
          title: event.title,
          eventId: event.eventId
        }
      }
    });
  } catch (error) {
    console.error('Get event photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch photos'
    });
  }
};

// Get public gallery photos
const getGalleryPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const {
      page = 1,
      limit = 20,
      sortBy = 'uploadedTime',
      sortOrder = 'desc'
    } = req.query;

    // Find event
    const event = await Event.findOne({ eventId, isActive: true })
      .populate('createdBy', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or no longer active'
      });
    }

    // Only show approved photos in public gallery
    const query = { 
      eventId: event._id, 
      status: 'approved',
      isPublic: true
    };

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const photos = await Photo.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('photoURL thumbnailURL uploadedByName caption uploadedTime viewCount');

    const total = await Photo.countDocuments(query);

    // Increment view count for each photo (in background)
    photos.forEach(photo => {
      photo.incrementViewCount().catch(err => 
        console.error('Error incrementing view count:', err)
      );
    });

    res.status(200).json({
      success: true,
      data: {
        photos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPhotos: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        },
        event: {
          title: event.title,
          description: event.description,
          date: event.date,
          eventId: event.eventId,
          organizer: event.createdBy.name
        }
      }
    });
  } catch (error) {
    console.error('Get gallery photos error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery photos'
    });
  }
};

// Update photo status (approve/reject)
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

    // Find photo and verify event ownership
    const photo = await Photo.findById(photoId).populate('eventId');
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Check if user owns the event
    if (photo.eventId.createdBy.toString() !== organizerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    photo.status = status;
    await photo.save();

    // Update event stats
    await photo.eventId.updateStats();

    res.status(200).json({
      success: true,
      message: `Photo ${status} successfully`,
      data: {
        photo
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

// Delete photo
const deletePhotoById = async (req, res) => {
  try {
    const { photoId } = req.params;
    const organizerId = req.user._id;

    // Find photo and verify event ownership
    const photo = await Photo.findById(photoId).populate('eventId');
    
    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found'
      });
    }

    // Check if user owns the event
    if (photo.eventId.createdBy.toString() !== organizerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete from Cloudinary
    try {
      await deletePhoto(photo.publicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
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

// Bulk operations on photos
const bulkPhotoOperations = async (req, res) => {
  try {
    const { operation, photoIds, status } = req.body;
    const organizerId = req.user._id;

    if (!operation || !photoIds || !Array.isArray(photoIds)) {
      return res.status(400).json({
        success: false,
        message: 'Operation and photoIds array are required'
      });
    }

    // Find all photos and verify ownership
    const photos = await Photo.find({ 
      _id: { $in: photoIds } 
    }).populate('eventId');

    if (photos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No photos found'
      });
    }

    // Check if user owns all events
    const unauthorizedPhotos = photos.filter(
      photo => photo.eventId.createdBy.toString() !== organizerId.toString()
    );

    if (unauthorizedPhotos.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Access denied for some photos'
      });
    }

    let result;

    switch (operation) {
      case 'updateStatus':
        if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Valid status is required for update operation'
          });
        }

        result = await Photo.updateMany(
          { _id: { $in: photoIds } },
          { status }
        );

        // Update stats for all affected events
        const eventIds = [...new Set(photos.map(photo => photo.eventId._id))];
        for (const eventId of eventIds) {
          const event = await Event.findById(eventId);
          if (event) await event.updateStats();
        }

        res.status(200).json({
          success: true,
          message: `${result.modifiedCount} photos updated successfully`,
          data: { modifiedCount: result.modifiedCount }
        });
        break;

      case 'delete':
        // Delete from Cloudinary
        const deletePromises = photos.map(photo => 
          deletePhoto(photo.publicId).catch(err => 
            console.error('Cloudinary deletion error:', err)
          )
        );
        await Promise.all(deletePromises);

        // Delete from database
        result = await Photo.deleteMany({ _id: { $in: photoIds } });

        // Update stats for all affected events
        const eventIdsForDelete = [...new Set(photos.map(photo => photo.eventId._id))];
        for (const eventId of eventIdsForDelete) {
          const event = await Event.findById(eventId);
          if (event) await event.updateStats();
        }

        res.status(200).json({
          success: true,
          message: `${result.deletedCount} photos deleted successfully`,
          data: { deletedCount: result.deletedCount }
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation'
        });
    }
  } catch (error) {
    console.error('Bulk photo operations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation'
    });
  }
};

module.exports = {
  uploadPhotos,
  getEventPhotos,
  getGalleryPhotos,
  updatePhotoStatus,
  deletePhotoById,
  bulkPhotoOperations
};
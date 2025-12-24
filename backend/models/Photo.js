const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: [true, 'Photo must belong to an event']
  },
  photoURL: {
    type: String,
    required: [true, 'Photo URL is required']
  },
  thumbnailURL: {
    type: String
  },
  publicId: {
    type: String,
    required: [true, 'Cloudinary public ID is required']
  },
  originalFileName: {
    type: String,
    required: true
  },
  uploadedByName: {
    type: String,
    trim: true,
    default: 'Anonymous'
  },
  uploadedByEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  caption: {
    type: String,
    trim: true,
    maxlength: [200, 'Caption cannot exceed 200 characters']
  },
  uploadedTime: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  metadata: {
    fileSize: {
      type: Number
    },
    mimeType: {
      type: String
    },
    dimensions: {
      width: Number,
      height: Number
    },
    uploadIP: {
      type: String
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
photoSchema.index({ eventId: 1 });
photoSchema.index({ uploadedTime: -1 });
photoSchema.index({ status: 1 });
photoSchema.index({ eventId: 1, status: 1 });
photoSchema.index({ createdAt: -1 });

// Update updatedAt field before saving
photoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update event stats after saving photo
photoSchema.post('save', async function() {
  try {
    const Event = mongoose.model('Event');
    const event = await Event.findById(this.eventId);
    if (event) {
      await event.updateStats();
    }
  } catch (error) {
    console.error('Error updating event stats:', error);
  }
});

// Update event stats after removing photo
photoSchema.post('remove', async function() {
  try {
    const Event = mongoose.model('Event');
    const event = await Event.findById(this.eventId);
    if (event) {
      await event.updateStats();
    }
  } catch (error) {
    console.error('Error updating event stats:', error);
  }
});

// Instance method to increment view count
photoSchema.methods.incrementViewCount = async function() {
  this.viewCount += 1;
  await this.save();
};

// Instance method to increment download count
photoSchema.methods.incrementDownloadCount = async function() {
  this.downloadCount += 1;
  await this.save();
};

// Static method to get photos by event with pagination
photoSchema.statics.getPhotosByEvent = async function(eventId, options = {}) {
  const {
    page = 1,
    limit = 20,
    status = null,
    sortBy = 'uploadedTime',
    sortOrder = 'desc'
  } = options;

  const query = { eventId };
  if (status) {
    query.status = status;
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const photos = await this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('eventId', 'title date eventId');

  const total = await this.countDocuments(query);

  return {
    photos,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalPhotos: total,
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  };
};

// Transform output
photoSchema.methods.toJSON = function() {
  const photoObject = this.toObject();
  delete photoObject.__v;
  return photoObject;
};

module.exports = mongoose.model('Photo', photoSchema);
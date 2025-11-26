const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minlength: [3, 'Event title must be at least 3 characters long'],
    maxlength: [100, 'Event title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  eventId: {
    type: String,
    unique: true,
    required: false  // Auto-generated in pre-save middleware
  },
  qrCodeURL: {
    type: String,
    required: false  // Generated after event creation
  },
  uploadURL: {
    type: String,
    required: false  // Auto-generated in pre-save middleware
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Event must have an organizer']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowAnonymousUpload: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxPhotosPerUser: {
      type: Number,
      default: 10
    },
    allowedFileTypes: {
      type: [String],
      default: ['image/jpeg', 'image/png', 'image/webp']
    },
    maxFileSize: {
      type: Number,
      default: 10 * 1024 * 1024 // 10MB in bytes
    }
  },
  stats: {
    totalPhotos: {
      type: Number,
      default: 0
    },
    approvedPhotos: {
      type: Number,
      default: 0
    },
    totalViews: {
      type: Number,
      default: 0
    }
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
eventSchema.index({ eventId: 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ createdAt: -1 });
eventSchema.index({ date: 1 });

// Generate unique event ID before saving
eventSchema.pre('save', async function(next) {
  if (!this.eventId) {
    // Generate unique eventId (timestamp + random string)
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substr(2, 5);
    this.eventId = `evt_${timestamp}_${randomStr}`;
    
    // Generate upload URL
    this.uploadURL = `/upload/${this.eventId}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Update stats when photos are added/removed
eventSchema.methods.updateStats = async function() {
  const Photo = mongoose.model('Photo');
  
  const totalPhotos = await Photo.countDocuments({ eventId: this._id });
  const approvedPhotos = await Photo.countDocuments({ 
    eventId: this._id, 
    status: 'approved' 
  });
  
  this.stats.totalPhotos = totalPhotos;
  this.stats.approvedPhotos = approvedPhotos;
  
  await this.save();
};

// Virtual for photos
eventSchema.virtual('photos', {
  ref: 'Photo',
  localField: '_id',
  foreignField: 'eventId'
});

// Transform output
eventSchema.methods.toJSON = function() {
  const eventObject = this.toObject();
  delete eventObject.__v;
  return eventObject;
};

module.exports = mongoose.model('Event', eventSchema);
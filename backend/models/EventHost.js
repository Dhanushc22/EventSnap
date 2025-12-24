const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const eventHostSchema = new mongoose.Schema({
  eventId: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  eventTitle: {
    type: String,
    required: true,
    trim: true
  },
  hostEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    index: true  // Regular index, not unique
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Remove any duplicate indexes on initialization
eventHostSchema.post('init', async function(doc) {
  try {
    const indexes = await doc.constructor.collection.getIndexes();
    console.log('📋 Current indexes on EventHost:', Object.keys(indexes));
  } catch (err) {
    console.log('⚠️ Could not get indexes:', err.message);
  }
});

// Hash password before saving
eventHostSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
eventHostSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Generate event ID
eventHostSchema.statics.generateEventId = function() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `evt_${timestamp}_${randomStr}`;
};

module.exports = mongoose.model('EventHost', eventHostSchema);

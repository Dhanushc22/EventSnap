const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EventHost = require('../models/EventHost');
const Event = require('../models/Event');
const { sendEventCredentials } = require('../utils/emailService');
const { generateQRCode } = require('../utils/qrGenerator');

const router = express.Router();

// Admin/Developer Login
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find admin user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: 'admin',
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: 'admin',
        type: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Event Host Login
router.post('/host/login', async (req, res) => {
  try {
    const { eventId, password } = req.body;

    // Validate input
    if (!eventId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Event ID and password are required'
      });
    }

    // Find event host
    const eventHost = await EventHost.findOne({ eventId, isActive: true });
    if (!eventHost) {
      return res.status(401).json({
        success: false,
        message: 'Invalid event ID or password'
      });
    }

    // Check password
    const isPasswordValid = await eventHost.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid event ID or password'
      });
    }

    // Update last login
    eventHost.lastLogin = new Date();
    await eventHost.save();

    // Generate JWT token
    const token = jwt.sign(
      { 
        eventId: eventHost.eventId,
        eventTitle: eventHost.eventTitle,
        role: 'host',
        type: 'host'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Event host login successful',
      token,
      user: {
        eventId: eventHost.eventId,
        eventTitle: eventHost.eventTitle,
        role: 'host',
        type: 'host',
        lastLogin: eventHost.lastLogin
      }
    });
  } catch (error) {
    console.error('Event host login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// Create Event (public - for hosts)
router.post('/host/create-event', async (req, res) => {
  try {
    const { title, hostEmail, description, password, date } = req.body;
    console.log('📝 Create event request:', { title, hostEmail, description, password, date });

    // Validate input
    if (!title || !hostEmail || !description || !password || !date) {
      console.warn('⚠️ Missing fields:', { title, hostEmail, description, password, date });
      return res.status(400).json({
        success: false,
        message: 'All fields are required: title, hostEmail, description, password, date'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(hostEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Generate unique event ID with retry logic
    let eventId;
    let maxRetries = 5;
    let created = false;
    
    console.log('🔄 Starting event ID generation with retry logic...');
    for (let i = 0; i < maxRetries; i++) {
      try {
        eventId = EventHost.generateEventId();
        console.log(`🔑 Generated event ID (attempt ${i + 1}):`, eventId);
        
        // Check if this eventId already exists
        const existing = await EventHost.findOne({ eventId });
        console.log(`🔍 Checking if eventId exists:`, existing ? 'YES - exists' : 'NO - available');
        
        if (!existing) {
          created = true;
          console.log('✅ Event ID is unique, will proceed');
          break;
        }
        console.log('⚠️ Event ID already exists, retrying... (attempt ' + (i + 1) + '/' + maxRetries + ')');
      } catch (err) {
        console.error('Error checking event ID:', err.message);
      }
    }
    
    console.log(`📊 Event ID generation result - created: ${created}, eventId: ${eventId}`);
    
    if (!created) {
      console.error('❌ Could not generate unique event ID after retries');
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique event ID. Please try again.'
      });
    }

    // Create event host record
    const eventHost = new EventHost({
      eventId,
      eventTitle: title,
      hostEmail,
      password: password
    });

    try {
      await eventHost.save();
      console.log('✅ Event host created:', eventHost._id);
    } catch (saveError) {
      console.error('❌ Error saving EventHost:', saveError.message);
      
      // If it's a duplicate email error, it's likely from old test data
      // Try to remove old documents and try again
      if (saveError.code === 11000 && saveError.keyPattern && saveError.keyPattern.email) {
        console.log('🔄 Cleaning up old email index entries...');
        try {
          // Drop the index if it exists
          await EventHost.collection.dropIndex('email_1');
          console.log('✅ Dropped email_1 index');
        } catch (dropErr) {
          console.log('⚠️ Could not drop email_1 index (may not exist):', dropErr.message);
        }
        
        // Try saving again
        const eventHost2 = new EventHost({
          eventId,
          eventTitle: title,
          hostEmail,
          password: password
        });
        await eventHost2.save();
        console.log('✅ Event host created on retry:', eventHost2._id);
      } else {
        throw saveError;
      }
    }

    // Create the actual event in the events collection
    const event = new Event({
      title,
      description,
      date: new Date(date),
      eventId: eventId,
      hostEventId: eventHost._id,
      createdBy: null, // No admin created this
      isActive: true,
      settings: {
        requireApproval: true,
        allowMultipleUploads: true,
        maxPhotosPerUser: 10
      }
    });

    await event.save();
    console.log('✅ Event created:', event._id);

    // Generate QR code for the event
    console.log('🔐 Generating QR code...');
    const qrResult = await generateQRCode(event.eventId, {
      baseURL: process.env.FRONTEND_URL
    });

    if (qrResult.success) {
      event.qrCodeURL = qrResult.qrCode;
      event.uploadURL = qrResult.uploadURL;
      await event.save();
      console.log('✅ QR code generated and saved');
    } else {
      console.warn('⚠️ QR code generation failed:', qrResult.error);
    }

    // Send email with credentials to host
    console.log('📧 Sending email to:', hostEmail);
    const emailResult = await sendEventCredentials(hostEmail, {
      title,
      description,
      date,
      eventId,
      password
    });

    if (!emailResult.success) {
      console.warn('⚠️ Email sending failed:', emailResult.error);
      // Don't fail the request if email fails
    } else {
      console.log('✅ Email sent successfully:', emailResult.messageId);
    }

    res.status(201).json({
      success: true,
      message: 'Event created successfully! Login credentials have been sent to the host email.',
      data: {
        eventId,
        title,
        hostEmail,
        emailSent: emailResult.success,
        emailPreview: emailResult.previewUrl || null,
        message: 'Event host will receive login credentials via email'
      }
    });
  } catch (error) {
    console.error('❌ Create event error:', error.message);
    console.error('❌ Full error:', error);
    
    // Handle duplicate eventId (very rare but possible)
    if (error.code === 11000) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique event ID. Please try again.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create event'
    });
  }
});

module.exports = router;
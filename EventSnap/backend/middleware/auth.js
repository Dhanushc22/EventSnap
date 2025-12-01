const jwt = require('jsonwebtoken');
const User = require('../models/User');
const EventHost = require('../models/EventHost');

// Middleware to verify JWT token (for both admin and host)
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type === 'admin') {
      // Admin authentication
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or user not found'
        });
      }

      req.user = user;
      req.userType = 'admin';
      req.role = 'admin';
    } else if (decoded.type === 'host') {
      // Event host authentication
      const eventHost = await EventHost.findOne({ eventId: decoded.eventId, isActive: true });
      
      if (!eventHost) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token or event not found'
        });
      }

      req.eventHost = eventHost;
      req.userType = 'host';
      req.role = 'host';
      req.eventId = decoded.eventId;
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.userType !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Middleware to check if user is event host
const requireHost = (req, res, next) => {
  if (req.userType !== 'host') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Event host privileges required.'
    });
  }
  next();
};

// Middleware to check if user can access specific event
const requireEventAccess = (req, res, next) => {
  if (req.userType === 'admin') {
    // Admin has access to all events (but not personal photos)
    next();
  } else if (req.userType === 'host') {
    // Host can only access their own event
    const requestedEventId = req.params.eventId || req.params.id;
    if (requestedEventId && requestedEventId !== req.eventId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own event.'
      });
    }
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied.'
    });
  }
};

// Require organizer role (legacy support)
const requireOrganizer = (req, res, next) => {
  if (req.user && (req.user.role === 'organizer' || req.user.role === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Organizer role required.'
    });
  }
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticateToken,
  requireOrganizer,
  requireAdmin,
  requireHost,
  requireEventAccess,
  optionalAuth
};
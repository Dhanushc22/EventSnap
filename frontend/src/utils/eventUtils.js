/**
 * UNIFIED EVENT UTILITIES
 * Used consistently across: Event Creation, Details View, QR Code, Photo Display
 * This ensures same logic/code reuse everywhere
 */

// ============================================
// 1. EVENT DATA TRANSFORMATION
// ============================================
export const formatEventData = (rawEvent) => {
  if (!rawEvent) return null;
  
  return {
    _id: rawEvent._id,
    eventId: rawEvent.eventId,
    title: rawEvent.title,
    description: rawEvent.description,
    date: new Date(rawEvent.date),
    dateFormatted: formatEventDate(new Date(rawEvent.date)),
    uploadURL: rawEvent.uploadURL,
    qrCodeURL: rawEvent.qrCodeURL,
    isActive: rawEvent.isActive,
    stats: {
      totalPhotos: rawEvent.stats?.totalPhotos || 0,
      approvedPhotos: rawEvent.stats?.approvedPhotos || 0,
      pendingPhotos: rawEvent.stats?.pendingPhotos || 0,
      rejectedPhotos: rawEvent.stats?.rejectedPhotos || 0
    },
    settings: rawEvent.settings || {
      allowAnonymousUpload: true,
      requireApproval: false,
      maxPhotosPerUser: 10
    },
    createdBy: rawEvent.createdBy,
    createdAt: rawEvent.createdAt,
    updatedAt: rawEvent.updatedAt
  };
};

// ============================================
// 2. DATE FORMATTING
// ============================================
export const formatEventDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return `${months[d.getMonth()]} ${d.getDate()}${getOrdinalSuffix(d.getDate())}, ${d.getFullYear()}`;
};

export const getOrdinalSuffix = (num) => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

// ============================================
// 3. QR CODE HANDLING
// ============================================
/**
 * Get QR code URL from event data
 * Works for both admin and host dashboards
 */
export const getQRCodeUrl = (eventData) => {
  if (!eventData) return null;
  
  // QR code stored as base64 or URL in backend
  if (eventData.qrCodeURL) {
    return eventData.qrCodeURL;
  }
  
  return null;
};

/**
 * Download QR code from event
 */
export const downloadQRCode = async (eventData, filename = null) => {
  const qrUrl = getQRCodeUrl(eventData);
  if (!qrUrl) {
    console.warn('No QR code available for download');
    return false;
  }

  try {
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = filename || `${eventData.eventId}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (error) {
    console.error('Error downloading QR code:', error);
    return false;
  }
};

/**
 * Copy QR code upload link to clipboard
 */
export const copyQRLinkToClipboard = async (eventData) => {
  if (!eventData?.uploadURL) return false;
  
  try {
    await navigator.clipboard.writeText(eventData.uploadURL);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

// ============================================
// 4. PHOTO HANDLING & DISPLAY
// ============================================
/**
 * Construct full photo URL from relative path
 * Works for all photo display components
 */
export const getFullPhotoURL = (photoPath) => {
  if (!photoPath) return null;
  
  // Already a full URL
  if (photoPath.startsWith('http')) {
    return photoPath;
  }
  
  // Construct from relative path
  const baseURL = process.env.REACT_APP_API_URL;
  
  if (!baseURL) {
    console.error('REACT_APP_API_URL environment variable is required');
    throw new Error('API URL not configured');
  }
  const backendURL = baseURL.replace('/api', ''); // Remove /api to get base backend URL
  
  return `${backendURL}${photoPath}`;
};

/**
 * Get photo thumbnail or fallback to full image
 */
export const getPhotoThumbnail = (photo) => {
  if (!photo) return null;
  
  const url = photo.thumbnailURL || photo.photoURL || photo.url;
  return getFullPhotoURL(url);
};

/**
 * Filter photos by status
 */
export const filterPhotosByStatus = (photos, status) => {
  if (!Array.isArray(photos)) return [];
  if (!status) return photos;
  
  return photos.filter(photo => photo.status === status);
};

/**
 * Get photo stats
 */
export const getPhotoStats = (photos) => {
  if (!Array.isArray(photos)) {
    return {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    };
  }
  
  return {
    total: photos.length,
    approved: photos.filter(p => p.status === 'approved').length,
    pending: photos.filter(p => p.status === 'pending').length,
    rejected: photos.filter(p => p.status === 'rejected').length
  };
};

// ============================================
// 5. EVENT CREATION FORM VALIDATION
// ============================================
export const validateEventForm = (formData) => {
  const errors = {};
  
  if (!formData.title || formData.title.trim() === '') {
    errors.title = 'Event title is required';
  }
  
  if (!formData.date) {
    errors.date = 'Event date is required';
  } else {
    const eventDate = new Date(formData.date);
    if (isNaN(eventDate.getTime())) {
      errors.date = 'Invalid date format';
    }
  }
  
  if (formData.title && formData.title.length > 100) {
    errors.title = 'Event title must be less than 100 characters';
  }
  
  if (formData.description && formData.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ============================================
// 6. EVENT STATUS & DISPLAY HELPERS
// ============================================
export const getEventStatusBadgeClass = (isActive) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-gray-100 text-gray-800';
};

export const getEventStatusText = (isActive) => {
  return isActive ? 'Active' : 'Inactive';
};

export const getPhotoStatusBadgeClass = (status) => {
  switch(status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// ============================================
// 7. LOCAL STORAGE UTILITIES
// ============================================
export const saveEventToLocalStorage = (event) => {
  try {
    localStorage.setItem(`event_${event._id}`, JSON.stringify(event));
  } catch (error) {
    console.warn('Could not save event to local storage:', error);
  }
};

export const getEventFromLocalStorage = (eventId) => {
  try {
    const data = localStorage.getItem(`event_${eventId}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn('Could not retrieve event from local storage:', error);
    return null;
  }
};

export const clearEventFromLocalStorage = (eventId) => {
  try {
    localStorage.removeItem(`event_${eventId}`);
  } catch (error) {
    console.warn('Could not clear event from local storage:', error);
  }
};

// ============================================
// 8. EVENT COMPARISON & CHECKS
// ============================================
export const hasEventChanged = (oldEvent, newEvent) => {
  if (!oldEvent || !newEvent) return false;
  
  return (
    oldEvent.title !== newEvent.title ||
    oldEvent.description !== newEvent.description ||
    oldEvent.date !== newEvent.date ||
    oldEvent.isActive !== newEvent.isActive
  );
};

export const isEventExpired = (eventDate) => {
  return new Date(eventDate) < new Date();
};

export const isEventUpcoming = (eventDate) => {
  return new Date(eventDate) > new Date();
};

// ============================================
// 9. SEARCH & FILTER
// ============================================
export const searchEvents = (events, query) => {
  if (!query || query.trim() === '') return events;
  
  const lowerQuery = query.toLowerCase();
  return events.filter(event =>
    event.title.toLowerCase().includes(lowerQuery) ||
    event.description.toLowerCase().includes(lowerQuery) ||
    event.eventId.toLowerCase().includes(lowerQuery)
  );
};

export const sortEvents = (events, sortBy = 'date', order = 'desc') => {
  const sorted = [...events].sort((a, b) => {
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
  
  return sorted;
};

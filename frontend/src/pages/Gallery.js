import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsAPI, photosAPI } from '../services/api';
import { Calendar, User, Camera, Eye, Download, ArrowLeft, Sparkles, Image } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

const Gallery = () => {
  const { eventId } = useParams();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  
  // Fetch event details
  const {
    data: eventData,
    isLoading: eventLoading
  } = useQuery({
    queryKey: ['event-public', eventId],
    queryFn: () => eventsAPI.getByEventId(eventId)
  });

  // Fetch gallery photos
  const {
    data: photosData,
    isLoading: photosLoading
  } = useQuery({
    queryKey: ['gallery-photos', eventId],
    queryFn: () => photosAPI.getGalleryPhotos(eventId, { limit: 50 }),
    enabled: !!eventId
  });

  if (eventLoading || photosLoading) return <LoadingSpinner />;
  
  if (!eventData?.data?.data?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600">This event gallery is not available.</p>
        </div>
      </div>
    );
  }

  const event = eventData.data.data.event;
  const photos = photosData?.data?.data?.photos || [];

  // Helper function to construct full photo URL
  const getFullPhotoURL = (photoURL) => {
    if (!photoURL) return null;
    if (photoURL.startsWith('http')) return photoURL;
    const baseURL = process.env.REACT_APP_API_URL;
    
    if (!baseURL) {
      console.error('REACT_APP_API_URL environment variable is required');
      throw new Error('API URL not configured');
    }
    const backendURL = baseURL.replace('/api', ''); // Remove /api to get base backend URL
    return `${backendURL}${photoURL}`;
  };

  // Check if in participant mode
  const isParticipantMode = sessionStorage.getItem('participantMode') === 'true';

  const exitParticipantMode = () => {
    sessionStorage.removeItem('participantMode');
    sessionStorage.removeItem('participantEventId');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      {/* Participant Mode Indicator */}
      {isParticipantMode && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="glass-card mx-4 mt-4 border-green-500/30"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-3">
            <div className="flex items-center text-sm text-green-300">
              <Sparkles className="h-4 w-4 mr-2" />
              <span className="font-semibold">Event Participant Mode</span>
              <span className="ml-2 text-green-400">- Viewing event gallery</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exitParticipantMode}
              className="text-xs text-green-400 hover:text-green-300 font-semibold"
            >
              Exit →
            </motion.button>
          </div>
        </motion.div>
      )}
      
      {/* Event Header */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-6xl font-black gradient-text mb-4"
            >
              {event.title}
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center flex-wrap gap-6 text-white/70 mb-6"
            >
              <div className="flex items-center bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <User className="h-5 w-5 mr-2 text-purple-400" />
                <span>by {event.organizer}</span>
              </div>
              <div className="flex items-center bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <Calendar className="h-5 w-5 mr-2 text-pink-400" />
                <span>{format(new Date(event.date), 'PPP')}</span>
              </div>
              <div className="flex items-center bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                <Camera className="h-5 w-5 mr-2 text-blue-400" />
                <span className="font-semibold">{photos.length} photos</span>
              </div>
            </motion.div>
            
            {event.description && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/60 text-lg mt-6 max-w-2xl mx-auto leading-relaxed"
              >
                {event.description}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="glass-card inline-block p-8 mb-6"
            >
              <Image className="h-24 w-24 text-purple-400 mx-auto" />
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-3">No photos yet</h3>
            <p className="text-white/60 text-lg mb-8">
              Be the first to upload photos to this event!
            </p>
            <a 
              href={`/upload/${eventId}`}
              className="btn btn-primary text-lg"
            >
              <Camera className="mr-2" />
              Upload Photos
            </a>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center mb-10"
            >
              <h2 className="text-3xl font-bold text-white">
                Event Gallery <span className="text-purple-400">({photos.length})</span>
              </h2>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`/upload/${eventId}`}
                className="btn btn-primary flex items-center"
              >
                <Camera className="h-5 w-5 mr-2" />
                <span>Upload Photos</span>
              </motion.a>
            </motion.div>

            <div className="photo-grid">
              {photos.map((photo, index) => (
                <motion.div
                  key={photo._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05, y: -8 }}
                  className="photo-item cursor-pointer group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={getFullPhotoURL(photo.thumbnailURL || photo.photoURL)}
                    alt={photo.caption || 'Event photo'}
                    className="w-full h-64 object-cover rounded-2xl"
                    loading="lazy"
                  />
                  <div className="photo-overlay rounded-2xl">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 360 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/20 backdrop-blur-sm p-4 rounded-full"
                    >
                      <Eye className="h-8 w-8 text-white" />
                    </motion.div>
                  </div>
                  {(photo.uploadedByName !== 'Anonymous' || photo.caption) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-2xl">
                      {photo.uploadedByName !== 'Anonymous' && (
                        <p className="text-white text-sm font-semibold">
                          {photo.uploadedByName}
                        </p>
                      )}
                      {photo.caption && (
                        <p className="text-white/90 text-xs mt-1">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Photo Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="max-w-5xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center text-white mb-6">
                <motion.button
                  whileHover={{ scale: 1.05, x: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedPhoto(null)}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 hover:bg-white/20"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span className="font-semibold">Back to Gallery</span>
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={getFullPhotoURL(selectedPhoto.photoURL)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 bg-purple-600 px-4 py-2 rounded-full hover:bg-purple-700"
                >
                  <Download className="h-5 w-5" />
                  <span className="font-semibold">Download</span>
                </motion.a>
              </div>
              
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={getFullPhotoURL(selectedPhoto.photoURL)}
                alt={selectedPhoto.caption || 'Event photo'}
                className="w-full h-auto max-h-[75vh] object-contain mx-auto rounded-3xl shadow-2xl shadow-purple-500/30"
              />
              
              {(selectedPhoto.uploadedByName !== 'Anonymous' || selectedPhoto.caption) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass-card mt-6 text-center"
                >
                  {selectedPhoto.uploadedByName !== 'Anonymous' && (
                    <p className="font-bold text-white text-lg">by {selectedPhoto.uploadedByName}</p>
                  )}
                  {selectedPhoto.caption && (
                    <p className="text-white/70 mt-2">{selectedPhoto.caption}</p>
                  )}
                  <p className="text-white/50 text-sm mt-3">
                    Uploaded {format(new Date(selectedPhoto.uploadedTime), 'PPp')}
                  </p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
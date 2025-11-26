import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsAPI, photosAPI } from '../services/api';
import { Calendar, User, Camera, Eye, Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';

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
    const baseURL = process.env.REACT_APP_API_URL || 'http://192.168.0.106:5000/api';
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
    <div className="min-h-screen bg-gray-50">
      {/* Participant Mode Indicator */}
      {isParticipantMode && (
        <div className="bg-green-50 border-b border-green-200 px-4 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center text-sm text-green-700">
              <span className="font-medium">Event Participant Mode</span>
              <span className="ml-2 text-green-600">- Viewing event gallery</span>
            </div>
            <button
              onClick={exitParticipantMode}
              className="text-xs text-green-600 hover:text-green-800 underline"
            >
              Exit
            </button>
          </div>
        </div>
      )}
      
      {/* Event Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex items-center justify-center space-x-4 text-gray-600">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-1" />
                <span>by {event.organizer}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-1" />
                <span>{format(new Date(event.date), 'PPP')}</span>
              </div>
              <div className="flex items-center">
                <Camera className="h-5 w-5 mr-1" />
                <span>{photos.length} photos</span>
              </div>
            </div>
            {event.description && (
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                {event.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Photos Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {photos.length === 0 ? (
          <div className="text-center py-16">
            <Camera className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No photos yet</h3>
            <p className="text-gray-500 mb-6">
              Be the first to upload photos to this event!
            </p>
            <a 
              href={`/upload/${eventId}`}
              className="btn btn-primary"
            >
              Upload Photos
            </a>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Event Gallery ({photos.length})
              </h2>
              <a 
                href={`/upload/${eventId}`}
                className="btn btn-primary"
              >
                <Camera className="h-5 w-5 mr-2" />
                Upload Photos
              </a>
            </div>

            <div className="photo-grid">
              {photos.map((photo) => (
                <div
                  key={photo._id}
                  className="photo-item cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={getFullPhotoURL(photo.thumbnailURL || photo.photoURL)}
                    alt={photo.caption || 'Event photo'}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <div className="photo-overlay">
                    <Eye className="h-8 w-8 text-white" />
                  </div>
                  {(photo.uploadedByName !== 'Anonymous' || photo.caption) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                      {photo.uploadedByName !== 'Anonymous' && (
                        <p className="text-white text-sm font-medium">
                          {photo.uploadedByName}
                        </p>
                      )}
                      {photo.caption && (
                        <p className="text-white text-xs opacity-90">
                          {photo.caption}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl w-full">
            <div className="flex justify-between items-center text-white mb-4">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back to Gallery</span>
              </button>
              <a
                href={getFullPhotoURL(selectedPhoto.photoURL)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-300 hover:text-white"
              >
                <Download className="h-5 w-5" />
                <span>Download</span>
              </a>
            </div>
            
            <img
              src={getFullPhotoURL(selectedPhoto.photoURL)}
              alt={selectedPhoto.caption || 'Event photo'}
              className="w-full h-auto max-h-[80vh] object-contain mx-auto"
            />
            
            {(selectedPhoto.uploadedByName !== 'Anonymous' || selectedPhoto.caption) && (
              <div className="text-white mt-4 text-center">
                {selectedPhoto.uploadedByName !== 'Anonymous' && (
                  <p className="font-medium">by {selectedPhoto.uploadedByName}</p>
                )}
                {selectedPhoto.caption && (
                  <p className="text-gray-300 mt-1">{selectedPhoto.caption}</p>
                )}
                <p className="text-gray-400 text-sm mt-2">
                  Uploaded {format(new Date(selectedPhoto.uploadedTime), 'PPp')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
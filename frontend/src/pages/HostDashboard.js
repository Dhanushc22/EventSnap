import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI, photosAPI } from '../services/api';
import { Calendar, Camera, QrCode, Eye, Trash2, CheckCircle, XCircle, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const HostDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Get eventId from logged-in user
  const eventId = user?.eventId;

  // Redirect if no eventId
  React.useEffect(() => {
    if (!eventId) {
      toast.error('No event associated with this account');
      navigate('/login');
    }
  }, [eventId, navigate]);

  // Fetch event details by eventId
  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError
  } = useQuery({
    queryKey: ['host-event', eventId],
    queryFn: async () => {
      console.log('Fetching event with eventId:', eventId);
      const response = await eventsAPI.getPublicEvent(eventId);
      console.log('Event data response:', response);
      return response;
    },
    enabled: !!eventId,
    retry: 2
  });

  // Fetch event photos
  const {
    data: photosData,
    isLoading: photosLoading
  } = useQuery({
    queryKey: ['host-event-photos', eventId],
    queryFn: () => photosAPI.getEventPhotos(eventData?.data?.data?.event?._id, { limit: 100 }),
    enabled: !!eventData?.data?.data?.event?._id
  });

  // Photo status update mutation
  const updatePhotoMutation = useMutation({
    mutationFn: ({ photoId, status }) => photosAPI.updateStatus(photoId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-event-photos', eventId] });
      toast.success('Photo status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update photo status');
    }
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: (photoId) => photosAPI.delete(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['host-event-photos', eventId] });
      toast.success('Photo deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete photo');
    }
  });

  if (eventLoading || photosLoading) return <LoadingSpinner />;
  
  if (eventError) {
    console.error('Event loading error:', eventError);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Error Loading Event</h2>
        <p className="text-white/70 mb-4">{eventError.response?.data?.message || eventError.message || 'Unable to load your event details.'}</p>
        <p className="text-white/60 text-sm">Event ID: {eventId}</p>
      </div>
    );
  }
  
  if (!eventData?.data?.data?.event) {
    console.log('No event data found. Full response:', eventData);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-white/70 mb-4">Unable to load your event details.</p>
        <p className="text-white/60 text-sm">Event ID: {eventId}</p>
      </div>
    );
  }

  const event = eventData.data.data.event;
  const photos = photosData?.data?.data?.photos || [];
  const qrInfo = eventData.data.data.qrInfo;

  // Helper function to construct full photo URL
  const getFullPhotoURL = (photoURL) => {
    if (!photoURL) return null;
    if (photoURL.startsWith('http')) return photoURL;
    const baseURL = process.env.REACT_APP_API_URL;
    
    if (!baseURL) {
      console.error('REACT_APP_API_URL environment variable is required');
      throw new Error('API URL not configured');
    }
    const backendURL = baseURL.replace('/api', '');
    return `${backendURL}${photoURL}`;
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Welcome, {user?.eventTitle || 'Event Host'}!
          </h1>
          <p className="text-white/70">Manage your event and photos from this dashboard</p>
        </div>

        {/* Event Header */}
        <div className="glass-card mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{event.title}</h2>
              <div className="flex items-center space-x-4 text-white/70">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-1" />
                  <span>{format(new Date(event.date), 'PPP')}</span>
                </div>
                <div className="flex items-center">
                  <Camera className="h-5 w-5 mr-1" />
                  <span>{event.stats?.totalPhotos || 0} photos</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <a
                href={`/upload/${event.eventId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Upload Page
              </a>
              <a
                href={`/gallery/${event.eventId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                <Eye className="h-4 w-4 mr-1" />
                View Gallery
              </a>
            </div>
          </div>
          
          {event.description && (
            <p className="text-white/80 mb-4">{event.description}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="glass-card">
            <nav className="flex space-x-8">
              {['overview', 'photos', 'qr-code'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-white/60 hover:text-white hover:border-white/30'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {selectedTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card bg-gradient-to-br from-blue-500/20 to-blue-600/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Total Photos</h3>
                <Camera className="h-8 w-8 text-blue-400" />
              </div>
              <p className="text-4xl font-bold text-white">{event.stats?.totalPhotos || 0}</p>
            </div>
            <div className="glass-card bg-gradient-to-br from-green-500/20 to-green-600/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Approved</h3>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <p className="text-4xl font-bold text-white">{event.stats?.approvedPhotos || 0}</p>
            </div>
            <div className="glass-card bg-gradient-to-br from-yellow-500/20 to-yellow-600/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-white">Event ID</h3>
                <QrCode className="h-8 w-8 text-yellow-400" />
              </div>
              <p className="text-lg font-mono text-white break-all">{event.eventId}</p>
            </div>
          </div>
        )}

        {selectedTab === 'photos' && (
          <div>
            {photos.length === 0 ? (
              <div className="text-center py-12 glass-card">
                <Camera className="h-16 w-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No photos yet</h3>
                <p className="text-white/60">Photos will appear here once participants start uploading</p>
              </div>
            ) : (
              <div className="glass-card">
                <h3 className="text-lg font-semibold text-white mb-4">Event Photos ({photos.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {photos.map((photo) => (
                    <div key={photo._id} className="relative group">
                      <img
                        src={getFullPhotoURL(photo.thumbnailURL || photo.photoURL)}
                        alt={photo.caption || 'Event photo'}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      
                      {/* Photo overlay with actions */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                        <button
                          onClick={() => updatePhotoMutation.mutate({ photoId: photo._id, status: 'approved' })}
                          className={`p-2 rounded-full transition-all ${
                            photo.status === 'approved' 
                              ? 'bg-green-500 text-white'
                              : 'bg-white/90 text-green-600 hover:bg-green-500 hover:text-white'
                          } opacity-0 group-hover:opacity-100`}
                          title="Approve"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => updatePhotoMutation.mutate({ photoId: photo._id, status: 'rejected' })}
                          className={`p-2 rounded-full transition-all ${
                            photo.status === 'rejected'
                              ? 'bg-red-500 text-white'
                              : 'bg-white/90 text-red-600 hover:bg-red-500 hover:text-white'
                          } opacity-0 group-hover:opacity-100`}
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                        
                        <button
                          onClick={() => deletePhotoMutation.mutate(photo._id)}
                          className="p-2 rounded-full bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        
                        <a
                          href={getFullPhotoURL(photo.photoURL)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-white/90 text-blue-600 hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                          title="View Full Size"
                        >
                          <Eye className="h-5 w-5" />
                        </a>
                      </div>
                      
                      {/* Status badge */}
                      <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                        photo.status === 'approved' ? 'bg-green-500/90 text-white' :
                        photo.status === 'rejected' ? 'bg-red-500/90 text-white' :
                        'bg-yellow-500/90 text-white'
                      }`}>
                        {photo.status}
                      </div>
                      
                      {/* Photo info */}
                      <div className="mt-2">
                        <p className="text-sm font-medium text-white">
                          {photo.uploadedByName || 'Anonymous'}
                        </p>
                        {photo.caption && (
                          <p className="text-xs text-white/60 mt-1 line-clamp-2">{photo.caption}</p>
                        )}
                        <p className="text-xs text-white/40 mt-1">
                          {format(new Date(photo.uploadedTime), 'PPp')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {selectedTab === 'qr-code' && (
          <div className="glass-card">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <QrCode className="h-6 w-6 mr-2" />
              QR Code for Photo Upload
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-white/70 mb-4">
                  Participants can scan this QR code to directly access the photo upload page for this event.
                </p>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-white/80">Upload URL:</span>
                    <p className="text-sm text-purple-400 break-all mt-1">{qrInfo?.uploadURL}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white/80">Gallery URL:</span>
                    <p className="text-sm text-purple-400 break-all mt-1">{qrInfo?.galleryURL}</p>
                  </div>
                </div>
                
                <div className="mt-6 space-x-2">
                  <a
                    href={event.qrCodeURL}
                    download={`${event.title}-QR-Code.png`}
                    className="btn btn-primary inline-flex items-center"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download QR Code
                  </a>
                </div>
              </div>
              
              <div className="flex justify-center items-start">
                {event.qrCodeURL ? (
                  <div className="bg-white p-6 rounded-xl shadow-2xl">
                    <img
                      src={event.qrCodeURL}
                      alt="QR Code for event"
                      className="w-64 h-64 object-contain"
                      onError={(e) => {
                        console.error('QR Code image failed to load:', event.qrCodeURL);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<p class="text-gray-600 text-center">QR Code not available</p>';
                      }}
                    />
                  </div>
                ) : (
                  <div className="bg-white/10 p-8 rounded-xl border-2 border-dashed border-white/30 text-center">
                    <QrCode className="h-16 w-16 text-white/40 mx-auto mb-3" />
                    <p className="text-white/60">QR Code will be generated shortly</p>
                    <p className="text-white/40 text-sm mt-2">
                      Refresh the page if it doesn't appear
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HostDashboard;
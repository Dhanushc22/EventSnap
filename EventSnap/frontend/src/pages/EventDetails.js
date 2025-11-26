import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI, photosAPI } from '../services/api';
import { Calendar, Camera, QrCode, Eye, Trash2, CheckCircle, XCircle, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Fetch event details
  const {
    data: eventData,
    isLoading: eventLoading
  } = useQuery({
    queryKey: ['event', id],
    queryFn: () => eventsAPI.getById(id)
  });

  // Fetch event photos
  const {
    data: photosData,
    isLoading: photosLoading
  } = useQuery({
    queryKey: ['event-photos', id],
    queryFn: () => photosAPI.getEventPhotos(id, { limit: 20 }),
    enabled: !!id
  });

  // Photo status update mutation
  const updatePhotoMutation = useMutation({
    mutationFn: ({ photoId, status }) => photosAPI.updateStatus(photoId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-photos', id] });
      toast.success('Photo status updated');
    },
    onError: () => {
      toast.error('Failed to update photo status');
    }
  });

  // Delete photo mutation
  const deletePhotoMutation = useMutation({
    mutationFn: (photoId) => photosAPI.delete(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-photos', id] });
      toast.success('Photo deleted');
    },
    onError: () => {
      toast.error('Failed to delete photo');
    }
  });

  if (eventLoading || photosLoading) return <LoadingSpinner />;
  
  if (!eventData?.data?.data?.event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
        <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
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
    const baseURL = process.env.REACT_APP_API_URL || 'http://192.168.0.106:5000/api';
    const backendURL = baseURL.replace('/api', ''); // Remove /api to get base backend URL
    return `${backendURL}${photoURL}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
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
          <p className="text-gray-600 mb-4">{event.description}</p>
        )}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'photos', 'qr-code'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Total Photos</h3>
            <p className="text-3xl font-bold text-blue-600">{event.stats?.totalPhotos || 0}</p>
          </div>
          <div className="bg-green-50 p-6 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">Approved</h3>
            <p className="text-3xl font-bold text-green-600">{event.stats?.approvedPhotos || 0}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">Event ID</h3>
            <p className="text-lg font-mono text-yellow-800">{event.eventId}</p>
          </div>
        </div>
      )}

      {selectedTab === 'photos' && (
        <div>
          {photos.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No photos yet</h3>
              <p className="text-gray-500">Photos will appear here once participants start uploading</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Event Photos ({photos.length})</h3>
              <div className="photo-grid">
                {photos.map((photo) => (
                  <div key={photo._id} className="relative group">
                    <img
                      src={getFullPhotoURL(photo.thumbnailURL || photo.photoURL)}
                      alt={photo.caption || 'Event photo'}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    
                    {/* Photo overlay with actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                      <button
                        onClick={() => updatePhotoMutation.mutate({ photoId: photo._id, status: 'approved' })}
                        className={`p-2 rounded-full transition-all ${
                          photo.status === 'approved' 
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-green-600 hover:bg-green-500 hover:text-white'
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
                            : 'bg-white text-red-600 hover:bg-red-500 hover:text-white'
                        } opacity-0 group-hover:opacity-100`}
                        title="Reject"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                      
                      <button
                        onClick={() => deletePhotoMutation.mutate(photo._id)}
                        className="p-2 rounded-full bg-white text-gray-600 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                      
                      <a
                        href={getFullPhotoURL(photo.photoURL)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-white text-blue-600 hover:bg-blue-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="View Full Size"
                      >
                        <Eye className="h-5 w-5" />
                      </a>
                    </div>
                    
                    {/* Status badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full ${
                      photo.status === 'approved' ? 'bg-green-100 text-green-800' :
                      photo.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {photo.status}
                    </div>
                    
                    {/* Photo info */}
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900">
                        {photo.uploadedByName || 'Anonymous'}
                      </p>
                      {photo.caption && (
                        <p className="text-xs text-gray-500 mt-1">{photo.caption}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <QrCode className="h-6 w-6 mr-2" />
            QR Code for Photo Upload
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 mb-4">
                Participants can scan this QR code to directly access the photo upload page for this event.
              </p>
              
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-700">Upload URL:</span>
                  <p className="text-sm text-blue-600 break-all">{qrInfo?.uploadURL}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Gallery URL:</span>
                  <p className="text-sm text-blue-600 break-all">{qrInfo?.galleryURL}</p>
                </div>
              </div>
              
              <div className="mt-6 space-x-2">
                <a
                  href={event.qrCodeURL}
                  download={`${event.title}-QR-Code.png`}
                  className="btn btn-primary"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download QR Code
                </a>
              </div>
            </div>
            
            <div className="flex justify-center">
              {event.qrCodeURL && (
                <img
                  src={event.qrCodeURL}
                  alt="QR Code for event"
                  className="max-w-xs w-full h-auto border border-gray-200 rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
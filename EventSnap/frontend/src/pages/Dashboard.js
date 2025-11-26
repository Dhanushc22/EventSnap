import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { eventsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Calendar, Camera, Users, QrCode, Eye } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();

  const {
    data: eventsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['organizer-events'],
    queryFn: () => eventsAPI.getOrganizerEvents()
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12 text-red-600">Error loading events</div>;

  const events = eventsData?.data?.data?.events || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="text-gray-600 mt-2">Manage your events and photo collections</p>
      </div>

      {/* Quick Stats */}
      {events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Events</p>
                <p className="text-2xl font-bold text-blue-900">{events.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Total Photos</p>
                <p className="text-2xl font-bold text-green-900">
                  {events.reduce((sum, event) => sum + (event.stats?.totalPhotos || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-6 rounded-lg">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Active Events</p>
                <p className="text-2xl font-bold text-purple-900">
                  {events.filter(event => event.isActive).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Button */}
      <div className="mb-8">
        <Link
          to="/create-event"
          className="inline-flex items-center space-x-2 btn btn-primary"
        >
          <Plus className="h-5 w-5" />
          <span>Create New Event</span>
        </Link>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-12">
          <Camera className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No events yet</h3>
          <p className="text-gray-500 mb-6">Create your first event to start collecting photos</p>
          <Link to="/create-event" className="btn btn-primary">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event._id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {event.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  event.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {event.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              {event.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
              )}
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {format(new Date(event.date), 'PPP')}
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <Camera className="h-4 w-4 mr-2" />
                  {event.stats?.totalPhotos || 0} photos
                </div>
                
                <div className="flex items-center text-sm text-gray-500">
                  <QrCode className="h-4 w-4 mr-2" />
                  Event ID: {event.eventId}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Link
                  to={`/event/${event._id}`}
                  className="flex-1 btn btn-primary text-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Link>
                
                <a
                  href={`/gallery/${event.eventId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  Gallery
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
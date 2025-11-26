import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '../services/api';
import { Calendar, FileText, Settings, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    settings: {
      allowAnonymousUpload: true,
      requireApproval: false,
      maxPhotosPerUser: 10
    }
  });

  const createEventMutation = useMutation({
    mutationFn: (eventData) => eventsAPI.create(eventData),
    onSuccess: (data) => {
      toast.success('Event created successfully!');
      queryClient.invalidateQueries({ queryKey: ['organizer-events'] });
      navigate(`/event/${data.data.data.event._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('settings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        settings: {
          ...prev.settings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createEventMutation.mutate(formData);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-2">
          Set up your event and get a QR code for photo collection
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Event Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  required
                  min={today}
                  value={formData.date}
                  onChange={handleChange}
                  className="pl-10 input"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="input resize-none"
                placeholder="Describe your event..."
              />
            </div>
          </div>
        </div>

        {/* Settings */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Upload Settings
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowAnonymousUpload"
                name="settings.allowAnonymousUpload"
                checked={formData.settings.allowAnonymousUpload}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="allowAnonymousUpload" className="ml-2 block text-sm text-gray-900">
                Allow anonymous photo uploads
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requireApproval"
                name="settings.requireApproval"
                checked={formData.settings.requireApproval}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requireApproval" className="ml-2 block text-sm text-gray-900">
                Require approval before photos appear in gallery
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum photos per user
              </label>
              <input
                type="number"
                name="settings.maxPhotosPerUser"
                min="1"
                max="50"
                value={formData.settings.maxPhotosPerUser}
                onChange={handleChange}
                className="input w-32"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <QrCode className="h-4 w-4 inline mr-1" />
              QR code will be generated after creation
            </div>
            <button
              type="submit"
              disabled={createEventMutation.isLoading}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createEventMutation.isLoading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;
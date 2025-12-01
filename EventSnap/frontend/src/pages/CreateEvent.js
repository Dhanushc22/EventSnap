import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '../services/api';
import { Calendar, FileText, Settings, QrCode, Sparkles, CheckCircle, ArrowLeft, Camera, Users, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-20 left-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        />
        <motion.div
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg shadow-purple-500/50">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Event Information</h3>
                <p className="text-white/60 text-sm">Basic details about your event</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                  placeholder="e.g., Summer Wedding 2025"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Event Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60 pointer-events-none" />
                  <input
                    type="date"
                    name="date"
                    required
                    min={today}
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-sm resize-none transition-all"
                  placeholder="Describe your event and what makes it special..."
                />
              </div>
            </div>
          </motion.div>sic Information */}
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
          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-lg shadow-blue-500/50">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Upload Settings</h3>
                <p className="text-white/60 text-sm">Configure how photos are uploaded and managed</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="allowAnonymousUpload"
                  name="settings.allowAnonymousUpload"
                  checked={formData.settings.allowAnonymousUpload}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-white/20 rounded bg-white/10"
                />
                <label htmlFor="allowAnonymousUpload" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="h-5 w-5 text-purple-400" />
                    <span className="font-semibold text-white">Allow Anonymous Uploads</span>
                  </div>
                  <p className="text-sm text-white/60">Guests can upload photos without providing their name</p>
                </label>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="requireApproval"
                  name="settings.requireApproval"
                  checked={formData.settings.requireApproval}
                  onChange={handleChange}
                  className="mt-1 h-5 w-5 text-purple-600 focus:ring-purple-500 border-white/20 rounded bg-white/10"
                />
                <label htmlFor="requireApproval" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 mb-1">
          {/* Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30"
          >
            <div className="flex items-start gap-4">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg">
                <QrCode className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  What happens next?
                </h4>
                <ul className="space-y-2 text-sm text-white/70">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>A unique QR code will be generated for your event</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>Guests can scan the QR code to upload photos instantly</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>You'll get access to a dashboard to manage all photos</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-between gap-4"
          >
            <Link
              to="/admin-dashboard"
              className="btn btn-secondary flex-1 sm:flex-none"
            >
              Cancel
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={createEventMutation.isPending}
              className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {createEventMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Event...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Create Event
                </span>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
};

export default CreateEvent;e="text-xs text-white/50 mt-2">Limit the number of photos each guest can upload</p>
              </div>
            </div>
          </motion.div>  type="number"
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
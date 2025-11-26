import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { eventsAPI, photosAPI } from '../services/api';
import { Upload, Camera, X, User, Mail, MessageSquare, CheckCircle, AlertCircle, CameraOff, RotateCcw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const PhotoUpload = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploaderInfo, setUploaderInfo] = useState({
    name: '',
    email: '',
    caption: ''
  });
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'user' for front, 'environment' for back
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Fetch event details
  const {
    data: eventData,
    isLoading: eventLoading,
    error: eventError
  } = useQuery({
    queryKey: ['event-public', eventId],
    queryFn: () => eventsAPI.getPublicEvent(eventId)
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: (formData) => photosAPI.upload(eventId, formData),
    onSuccess: (data) => {
      setUploadStatus('success');
      setSelectedFiles([]);
      setUploaderInfo({ name: '', email: '', caption: '' });
      toast.success('Photos uploaded successfully!');
    },
    onError: (error) => {
      setUploadStatus('error');
      toast.error(error.response?.data?.message || 'Upload failed');
    }
  });

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      toast.error('Some files were rejected. Please check file type and size.');
    }
    
    const newFiles = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setSelectedFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId);
      // Revoke object URL to prevent memory leaks
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updated;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error('Please select at least one photo');
      return;
    }

    setUploadStatus('uploading');

    const formData = new FormData();
    
    selectedFiles.forEach(({ file }) => {
      formData.append('photos', file);
    });
    
    if (uploaderInfo.name) formData.append('uploadedByName', uploaderInfo.name);
    if (uploaderInfo.email) formData.append('uploadedByEmail', uploaderInfo.email);
    if (uploaderInfo.caption) formData.append('caption', uploaderInfo.caption);

    uploadMutation.mutate(formData);
  };

  const handleInputChange = (e) => {
    setUploaderInfo(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    if (cameraStream) {
      stopCamera();
      setTimeout(() => {
        setFacingMode(newFacingMode);
        startCamera();
      }, 100);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-photo-${Date.now()}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });

          const newFile = {
            file,
            preview: URL.createObjectURL(blob),
            id: Math.random().toString(36).substr(2, 9)
          };

          setSelectedFiles(prev => [...prev, newFile]);
          toast.success('Photo captured!');
        }
      }, 'image/jpeg', 0.9);
    }
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      selectedFiles.forEach(({ preview }) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [selectedFiles]);

  if (eventLoading) return <LoadingSpinner />;
  
  if (eventError || !eventData?.data?.data?.event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600">
            This event might not exist or is no longer accepting photos. Please check the QR code and try again.
          </p>
        </div>
      </div>
    );
  }

  const event = eventData.data.data.event;

  if (uploadStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Photos Uploaded!</h2>
          <p className="text-gray-600 mb-6">
            Your photos have been successfully uploaded to "{event.title}". 
            Thank you for contributing to this event!
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => setUploadStatus('idle')}
              className="w-full btn btn-primary"
            >
              Upload More Photos
            </button>
            <a 
              href={`/gallery/${event.eventId}`}
              className="block w-full btn btn-secondary text-center"
            >
              View Gallery
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check if in participant mode
  const isParticipantMode = sessionStorage.getItem('participantMode') === 'true';

  const exitParticipantMode = () => {
    sessionStorage.removeItem('participantMode');
    sessionStorage.removeItem('participantEventId');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Participant Mode Indicator */}
      {isParticipantMode && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center text-sm text-blue-700">
              <span className="font-medium">Event Participant Mode</span>
              <span className="ml-2 text-blue-600">- Upload photos to this event</span>
            </div>
            <button
              onClick={exitParticipantMode}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Exit
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
          <p className="text-gray-600 mb-1">
            Organized by {event.organizer}
          </p>
          <p className="text-sm text-gray-500">
            {format(new Date(event.date), 'PPP')}
          </p>
          {event.description && (
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              {event.description}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Camera className="h-6 w-6 mr-2" />
            Share Your Photos
          </h2>

          {/* Uploader Info Form */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (Optional)
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={uploaderInfo.name}
                  onChange={handleInputChange}
                  className="pl-10 input"
                  placeholder="Enter your name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Email (Optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={uploaderInfo.email}
                  onChange={handleInputChange}
                  className="pl-10 input"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Caption (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  name="caption"
                  value={uploaderInfo.caption}
                  onChange={handleInputChange}
                  rows={3}
                  className="pl-10 input resize-none"
                  placeholder="Add a caption for your photos..."
                />
              </div>
            </div>
          </div>

          {/* Camera and Upload Options */}
          <div className="space-y-4 mb-6">
            {/* Camera Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={showCamera ? stopCamera : startCamera}
                className={`flex items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  showCamera 
                    ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100' 
                    : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                {showCamera ? (
                  <>
                    <CameraOff className="h-6 w-6 mr-2" />
                    Close Camera
                  </>
                ) : (
                  <>
                    <Camera className="h-6 w-6 mr-2" />
                    Open Camera
                  </>
                )}
              </button>

              <div
                {...getRootProps()}
                className={`flex items-center justify-center p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                  isDragActive
                    ? isDragReject
                      ? 'border-red-300 bg-red-50'
                      : 'border-blue-300 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-6 w-6 mr-2 text-gray-600" />
                <span className="text-gray-700">Choose Files</span>
              </div>
            </div>
          </div>

          {/* Camera Interface */}
          {showCamera && (
            <div className="mb-6 bg-black rounded-lg overflow-hidden">
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-64 sm:h-80 object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Camera Controls Overlay */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
                  <button
                    onClick={switchCamera}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-colors"
                  >
                    <RotateCcw className="h-6 w-6" />
                  </button>
                  
                  <button
                    onClick={capturePhoto}
                    className="bg-white hover:bg-gray-100 text-gray-900 p-4 rounded-full shadow-lg transition-colors"
                  >
                    <Camera className="h-8 w-8" />
                  </button>
                  
                  <button
                    onClick={stopCamera}
                    className="bg-red-500 bg-opacity-80 hover:bg-opacity-100 text-white p-3 rounded-full transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* File Drop Zone (when camera is not active) */}
          {!showCamera && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive
                  ? isDragReject
                    ? 'border-red-300 bg-red-50'
                    : 'border-blue-300 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              
              {isDragActive ? (
                <p className="text-lg text-gray-600">
                  {isDragReject ? 'Invalid file type' : 'Drop your photos here...'}
                </p>
              ) : (
                <div>
                  <p className="text-lg text-gray-600 mb-2">
                    Drag and drop your photos here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPEG, PNG, WebP up to 10MB each
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Selected Photos ({selectedFiles.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedFiles.map(({ id, file, preview }) => (
                  <div key={id} className="relative group">
                    <img
                      src={preview}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <div className="mt-6 text-center">
              <button
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading'}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Uploading Photos...
                  </>
                ) : (
                  <>
                    <Upload className="h-5 w-5 mr-2" />
                    Upload {selectedFiles.length} Photo{selectedFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Gallery Link */}
        <div className="text-center mt-8">
          <a
            href={`/gallery/${event.eventId}`}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            View Event Gallery →
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
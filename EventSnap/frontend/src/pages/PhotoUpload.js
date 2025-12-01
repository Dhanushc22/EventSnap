import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import { eventsAPI, photosAPI } from '../services/api';
import { Upload, Camera, X, User, Mail, MessageSquare, CheckCircle, AlertCircle, CameraOff, RotateCcw, Video, Square, Play, Pause } from 'lucide-react';
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);

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
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [cameraStream, isRecording]);

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      selectedFiles.forEach(({ preview }) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [selectedFiles]);

  // Start video recording
  const startRecording = () => {
    if (videoRef.current && cameraStream) {
      const chunks = [];
      const recorder = new MediaRecorder(cameraStream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      recorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const file = new File([blob], `video-${Date.now()}.webm`, {
          type: 'video/webm',
          lastModified: Date.now()
        });

        const newFile = {
          file,
          preview: URL.createObjectURL(blob),
          id: Math.random().toString(36).substr(2, 9),
          type: 'video'
        };

        setSelectedFiles(prev => [...prev, newFile]);
        toast.success('Video captured!');
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Participant Mode Indicator */}
      {isParticipantMode && (
        <div className="bg-blue-500 text-white px-4 py-3 sticky top-0 z-10 shadow-md">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center text-sm">
              <span className="font-semibold">📸 Event Participant Mode</span>
            </div>
            <button
              onClick={exitParticipantMode}
              className="text-xs bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full transition-colors"
            >
              Exit
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Event Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
            {event.title}
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Organized by {event.organizer}
          </p>
          <p className="text-sm text-gray-500 font-medium">
            {format(new Date(event.date), 'PPP')}
          </p>
          {event.description && (
            <p className="text-gray-700 mt-5 max-w-2xl mx-auto text-base leading-relaxed">
              {event.description}
            </p>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 flex items-center justify-center">
            <Camera className="h-8 w-8 mr-3 text-blue-500" />
            Share Your Moments
          </h2>

          {/* Camera Interface */}
          {showCamera && (
            <div className="mb-8 bg-black rounded-2xl overflow-hidden shadow-xl">
              <div className="relative bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-96 sm:h-[500px] object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Recording Indicator */}
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Recording</span>
                  </div>
                )}
                
                {/* Camera Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-6 flex justify-center items-center space-x-4">
                  {/* Switch Camera Button */}
                  <button
                    onClick={switchCamera}
                    className="bg-white bg-opacity-30 hover:bg-opacity-50 text-white p-3 rounded-full transition-all transform hover:scale-110"
                    title="Switch Camera"
                  >
                    <RotateCcw className="h-6 w-6" />
                  </button>
                  
                  {/* Record/Stop Video Button */}
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
                      title="Start Recording"
                    >
                      <Video className="h-7 w-7" />
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110 animate-pulse"
                      title="Stop Recording"
                    >
                      <Square className="h-7 w-7" />
                    </button>
                  )}
                  
                  {/* Capture Photo Button */}
                  <button
                    onClick={capturePhoto}
                    className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
                    title="Capture Photo"
                  >
                    <Camera className="h-7 w-7" />
                  </button>
                  
                  {/* Close Camera Button */}
                  <button
                    onClick={stopCamera}
                    className="bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-full transition-all transform hover:scale-110"
                    title="Close Camera"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Info Form */}
          {!showCamera && (
            <div className="grid md:grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={uploaderInfo.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={uploaderInfo.email}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Add a Caption (Optional)
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                  <textarea
                    name="caption"
                    value={uploaderInfo.caption}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
                    placeholder="Share your thoughts about this moment..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Upload and Camera Options */}
          {!showCamera && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button
                onClick={startCamera}
                className="flex items-center justify-center p-5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
              >
                <Camera className="h-6 w-6 mr-3" />
                Open Camera
              </button>

              <div
                {...getRootProps()}
                className={`flex items-center justify-center p-5 rounded-xl border-3 border-dashed font-semibold cursor-pointer transition-all transform ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 text-blue-600 scale-105'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50 text-gray-700 hover:scale-105'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="h-6 w-6 mr-3" />
                Upload Files
              </div>
            </div>
          )}

          {/* File Drop Zone */}
          {!showCamera && (
            <div
              {...getRootProps()}
              className={`border-3 border-dashed rounded-xl p-8 text-center transition-all ${
                isDragActive
                  ? isDragReject
                    ? 'border-red-400 bg-red-50'
                    : 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              
              {isDragActive ? (
                <p className="text-lg font-semibold text-gray-700">
                  {isDragReject ? '❌ Invalid file type' : '📸 Drop your photos here...'}
                </p>
              ) : (
                <div>
                  <p className="text-lg font-semibold text-gray-700 mb-2">
                    Drag and drop photos here
                  </p>
                  <p className="text-sm text-gray-500">
                    Or click to browse • JPEG, PNG, WebP • Up to 10MB each
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                📁 Selected ({selectedFiles.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {selectedFiles.map(({ id, file, preview, type }) => (
                  <div key={id} className="relative group">
                    <div className="relative h-24 bg-gray-200 rounded-lg overflow-hidden">
                      {type === 'video' ? (
                        <div className="w-full h-full flex items-center justify-center bg-black">
                          <Video className="h-8 w-8 text-white" />
                        </div>
                      ) : (
                        <img
                          src={preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all"></div>
                    </div>
                    <button
                      onClick={() => removeFile(id)}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <p className="text-xs text-gray-600 mt-2 truncate font-medium">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Button */}
          {selectedFiles.length > 0 && (
            <div className="mt-8">
              <button
                onClick={handleUpload}
                disabled={uploadStatus === 'uploading'}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <LoadingSpinner size="small" className="mr-3" />
                    Uploading ({selectedFiles.length})...
                  </>
                ) : (
                  <>
                    <Upload className="h-6 w-6 mr-3" />
                    Upload {selectedFiles.length} Item{selectedFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Gallery Link */}
        <div className="text-center mt-10">
          <a
            href={`/gallery/${event.eventId}`}
            className="inline-block text-blue-600 hover:text-blue-700 font-bold text-lg transition-colors"
          >
            View Event Gallery →
          </a>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
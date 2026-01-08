'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  PhotoIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { homepageAPI } from '@/services/api';

// Default hero image path
const DEFAULT_HERO_IMAGE = '/images/home-page-1.png';

interface HomepageSettingsData {
  heroImage: string;
  lastUpdated?: string;
}

// Cloudinary upload configuration
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name';

/**
 * HomepageSettings - Admin component for managing homepage hero section
 * 
 * Features:
 * - Upload custom hero image
 * - Preview changes before saving
 * - Reset to default image
 * - Local storage persistence
 * - Real-time preview
 */
const HomepageSettings: React.FC = () => {
  const [heroImage, setHeroImage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: '' });
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Fetch from database
        const response = await homepageAPI.getContent();
        if (response?.success && response.data) {
          setHeroImage(response.data.heroImage || DEFAULT_HERO_IMAGE);
        } else {
          // Fallback to default
          setHeroImage(DEFAULT_HERO_IMAGE);
        }
      } catch (error) {
        console.error('Error loading homepage settings:', error);
        // Try localStorage as fallback
        const savedSettings = localStorage.getItem('homepageSettings');
        if (savedSettings) {
          const settings: HomepageSettingsData = JSON.parse(savedSettings);
          setHeroImage(settings.heroImage || DEFAULT_HERO_IMAGE);
        } else {
          setHeroImage(DEFAULT_HERO_IMAGE);
        }
      }
    };

    loadSettings();
  }, []);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('Please select a valid image file.', false);
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('Image size must be less than 5MB.', false);
      return;
    }

    setIsUploading(true);

    try {
      // Create a preview URL for immediate feedback
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setPreviewImage(imageUrl);
      };
      reader.readAsDataURL(file);

      // Upload via API route (handles authentication)
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'homepage');

      // Get auth token from storage
      const token = localStorage.getItem('token');

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      const uploadedImageUrl = data.url;

      // Update state with uploaded URL
      setHeroImage(uploadedImageUrl);
      setPreviewImage(null); // Clear preview since we now have the real URL
      setIsUploading(false);

      showMessage('Image uploaded successfully! Click "Save Changes" to apply.', true);
    } catch (error) {
      console.error('Error uploading image:', error);
      setIsUploading(false);
      setPreviewImage(null);
      showMessage(error instanceof Error ? error.message : 'Failed to upload image. Please try again.', false);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  // Save homepage settings
  const handleSave = async () => {
    try {
      // Save to database via API
      const response = await homepageAPI.updateContent({
        heroImage: heroImage,
      });

      if (response?.success) {
        // Also save to localStorage as backup
        const settings: HomepageSettingsData = {
          heroImage: heroImage,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('homepageSettings', JSON.stringify(settings));

        // Dispatch custom event to notify homepage about the update
        window.dispatchEvent(
          new CustomEvent('homepageSettingsUpdated', {
            detail: settings,
          })
        );

        showMessage('Homepage settings saved successfully! Changes will appear on the live site.', true);
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (error) {
      console.error('Error saving homepage settings:', error);
      showMessage('Failed to save settings. Please try again.', false);
    }
  };

  // Reset to default image
  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset to the default image?')) {
      return;
    }

    try {
      const defaultImage = DEFAULT_HERO_IMAGE;
      setHeroImage(defaultImage);
      setPreviewImage(null);

      // Save to database
      const response = await homepageAPI.updateContent({
        heroImage: defaultImage,
      });

      if (response?.success) {
        // Update localStorage
        const settings: HomepageSettingsData = {
          heroImage: defaultImage,
          lastUpdated: new Date().toISOString(),
        };
        localStorage.setItem('homepageSettings', JSON.stringify(settings));

        // Dispatch event to notify homepage
        window.dispatchEvent(
          new CustomEvent('homepageSettingsUpdated', {
            detail: settings,
          })
        );

        showMessage('Reset to default image successfully!', true);
      } else {
        throw new Error('Failed to reset in database');
      }
    } catch (error) {
      console.error('Error resetting to default:', error);
      showMessage('Failed to reset. Please try again.', false);
    }
  };

  // Show status message
  const showMessage = (message: string, success: boolean) => {
    setSaveStatus({ show: true, success, message });
    setTimeout(() => {
      setSaveStatus((prev) => ({ ...prev, show: false }));
    }, 4000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <PhotoIcon className="w-8 h-8 text-blue-600 mr-3" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Homepage Settings</h2>
          <p className="text-gray-600">Manage your homepage hero section image</p>
        </div>
      </div>

      {/* Status Message */}
      {saveStatus.show && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center ${saveStatus.success
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
            }`}
        >
          {saveStatus.success ? (
            <CheckCircleIcon className="w-5 h-5 mr-2" />
          ) : (
            <XCircleIcon className="w-5 h-5 mr-2" />
          )}
          {saveStatus.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Image Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Current Hero Image</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            {heroImage ? (
              <div className="relative">
                <div className="relative w-full h-64">
                  <Image
                    src={previewImage || heroImage}
                    alt="Homepage Hero"
                    fill
                    className="object-contain rounded-lg shadow-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== DEFAULT_HERO_IMAGE) {
                        target.src = DEFAULT_HERO_IMAGE;
                      }
                    }}
                  />
                </div>
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                  Active
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <PhotoIcon className="w-16 h-16 mb-4" />
                <p>No image selected</p>
              </div>
            )}
          </div>

          {/* Image Information */}
          {heroImage && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Image Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <span className="font-medium">Type:</span> Hero Section Image
                </p>
                <p>
                  <span className="font-medium">Recommended Size:</span> 800x600px or larger
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload New Image */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Upload New Image</h3>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start">
              <CloudArrowUpIcon className="w-5 h-5 text-blue-600 mt-0.5 mr-2" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Image Guidelines:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>Recommended size: 800x600px or larger</li>
                  <li>Format: JPG, PNG, or WebP</li>
                  <li>Max file size: 5MB</li>
                  <li>Show your best furniture collection</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Image Uploader Component */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Uploading image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <CloudArrowUpIcon className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500">JPG, PNG, or WebP up to 5MB</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isUploading}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Save Changes
            </button>

            <button
              onClick={handleReset}
              disabled={isUploading}
              className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <PhotoIcon className="w-5 h-5 mr-2" />
              Reset to Default
            </button>
          </div>

          {/* Help Text */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">💡 Pro Tips:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Use high-quality images that showcase your furniture clearly</li>
              <li>• Images with good lighting perform better</li>
              <li>• Consider showing multiple furniture pieces in one image</li>
              <li>• Make sure the image aligns with your brand colors</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Preview on Homepage</h3>
        <div className="bg-gray-100 rounded-lg p-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/2">
              <h4 className="text-2xl font-bold text-gray-800 mb-2">
                Shree Manish Steel Furniture Industry
              </h4>
              <p className="text-gray-600 mb-4">Quality Steel Furniture for Every Space</p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">
                  Explore Products
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm">
                  Contact Us
                </button>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative w-full h-40">
                <Image
                  src={previewImage || heroImage || DEFAULT_HERO_IMAGE}
                  alt="Preview"
                  fill
                  className="object-contain rounded-lg shadow"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomepageSettings;

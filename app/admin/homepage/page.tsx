'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { homepageAPI, HomepageData, HomepageFeature } from '@/services/api';
import { FaEye, FaSave, FaUndo, FaPlus, FaTrash, FaImage, FaInfoCircle, FaUpload, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

const initialHomepageData: HomepageData = {
  heroTitle: '',
  heroSubtitle: '',
  heroDescription: '',
  heroImage: '/images/home-page-1.png',
  heroButtonText: 'View Products',
  heroButtonLink: '/products',
  heroSecondaryButtonText: 'Contact Us',
  heroSecondaryButtonLink: '/contact',
  featuresTitle: 'Why Choose Us?',
  featuresEnabled: true,
  features: [{ icon: '', title: '', description: '' }],
  whyChooseUsTitle: '',
  whyChooseUsDescription: '',
  whyChooseUsEnabled: true,
  whyChooseUsItems: [{ icon: '', title: '', description: '' }],
  ctaTitle: '',
  ctaDescription: '',
  ctaButtonText: 'Contact Us',
  ctaButtonLink: '/contact',
  ctaSecondaryButtonText: 'Request Custom Order',
  ctaSecondaryButtonLink: '/custom-order',
  ctaEnabled: true,
  testimonialsTitle: '',
  testimonialsSubtitle: '',
  testimonialsEnabled: true,
  servicesTitle: '',
  servicesSubtitle: '',
  servicesEnabled: true,
  locationTitle: '',
  locationSubtitle: '',
  locationEnabled: true,
  metaTitle: '',
  metaDescription: '',
};

const AdminHomepage = () => {
  const [homepageData, setHomepageData] = useState<HomepageData>(initialHomepageData);
  const [originalData, setOriginalData] = useState<HomepageData>(initialHomepageData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // File input refs
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  // Image upload function
  const handleImageUpload = async (file: File, fieldName: keyof HomepageData) => {
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select an image file', type: 'error' });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Image size should be less than 5MB', type: 'error' });
      return;
    }
    
    setUploadingImage(true);
    setMessage({ text: '', type: '' });
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'manish-steel/homepage');
      
      // Get auth token from storage
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.success && result.url) {
        handleInputChange(fieldName, result.url);
        setMessage({ text: 'Image uploaded successfully!', type: 'success' });
      } else {
        setMessage({ text: result.error || 'Failed to upload image', type: 'error' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ text: 'Failed to upload image. Please try again.', type: 'error' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Check for unsaved changes
  useEffect(() => {
    setHasChanges(JSON.stringify(homepageData) !== JSON.stringify(originalData));
  }, [homepageData, originalData]);

  const fetchHomepageData = useCallback(async () => {
    try {
      setFetching(true);
      const response = await homepageAPI.getContent();
      if (response?.success && response.data) {
        const data: HomepageData = {
          heroTitle: response.data.heroTitle || '',
          heroSubtitle: response.data.heroSubtitle || '',
          heroDescription: response.data.heroDescription || '',
          heroImage: response.data.heroImage || '/images/home-page-1.png',
          heroButtonText: response.data.heroButtonText || 'View Products',
          heroButtonLink: response.data.heroButtonLink || '/products',
          heroSecondaryButtonText: response.data.heroSecondaryButtonText || 'Contact Us',
          heroSecondaryButtonLink: response.data.heroSecondaryButtonLink || '/contact',
          featuresTitle: response.data.featuresTitle || 'Why Choose Us?',
          featuresEnabled: response.data.featuresEnabled ?? true,
          features: response.data.features?.length ? response.data.features : [{ icon: '', title: '', description: '' }],
          whyChooseUsTitle: response.data.whyChooseUsTitle || '',
          whyChooseUsDescription: response.data.whyChooseUsDescription || '',
          whyChooseUsEnabled: response.data.whyChooseUsEnabled ?? true,
          whyChooseUsItems: response.data.whyChooseUsItems?.length ? response.data.whyChooseUsItems : [{ icon: '', title: '', description: '' }],
          ctaTitle: response.data.ctaTitle || '',
          ctaDescription: response.data.ctaDescription || '',
          ctaButtonText: response.data.ctaButtonText || 'Contact Us',
          ctaButtonLink: response.data.ctaButtonLink || '/contact',
          ctaSecondaryButtonText: response.data.ctaSecondaryButtonText || 'Request Custom Order',
          ctaSecondaryButtonLink: response.data.ctaSecondaryButtonLink || '/custom-order',
          ctaEnabled: response.data.ctaEnabled ?? true,
          testimonialsTitle: response.data.testimonialsTitle || '',
          testimonialsSubtitle: response.data.testimonialsSubtitle || '',
          testimonialsEnabled: response.data.testimonialsEnabled ?? true,
          servicesTitle: response.data.servicesTitle || '',
          servicesSubtitle: response.data.servicesSubtitle || '',
          servicesEnabled: response.data.servicesEnabled ?? true,
          locationTitle: response.data.locationTitle || '',
          locationSubtitle: response.data.locationSubtitle || '',
          locationEnabled: response.data.locationEnabled ?? true,
          metaTitle: response.data.metaTitle || '',
          metaDescription: response.data.metaDescription || '',
        };
        setHomepageData(data);
        setOriginalData(data);
      }
    } catch (error) {
      console.error('Error fetching homepage data:', error);
      showMessage('Error loading homepage data', 'error');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchHomepageData();
  }, [fetchHomepageData]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleInputChange = (field: keyof HomepageData, value: string | boolean) => {
    setHomepageData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeatureChange = (field: 'features' | 'whyChooseUsItems', index: number, key: keyof HomepageFeature, value: string) => {
    setHomepageData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, [key]: value } : item)
    }));
  };

  const addFeature = (field: 'features' | 'whyChooseUsItems') => {
    setHomepageData(prev => ({
      ...prev,
      [field]: [...prev[field], { icon: '', title: '', description: '' }]
    }));
  };

  const removeFeature = (field: 'features' | 'whyChooseUsItems', index: number) => {
    if (homepageData[field].length > 1) {
      setHomepageData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleReset = () => {
    setHomepageData(originalData);
    showMessage('Changes discarded', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const cleanedData = {
        ...homepageData,
        features: homepageData.features.filter(f => f.title.trim() || f.description.trim()),
        whyChooseUsItems: homepageData.whyChooseUsItems.filter(f => f.title.trim() || f.description.trim()),
      };

      const response = await homepageAPI.updateContent(cleanedData);
      if (response?.success) {
        setOriginalData(homepageData);
        showMessage('Homepage updated successfully!', 'success');
      } else {
        throw new Error(response?.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Error updating homepage:', error);
      showMessage('Error updating homepage', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: '' },
    { id: 'features', label: 'Features', icon: '' },
    { id: 'cta', label: 'Call to Action', icon: '' },
    { id: 'sections', label: 'Page Sections', icon: '' },
    { id: 'seo', label: 'SEO', icon: '' },
  ];

  const ToggleSwitch = ({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) => (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
      </button>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading homepage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Homepage Management</h1>
          <p className="text-gray-600 mt-1">Customize your homepage content and sections</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaEye /> Preview
          </Link>
        </div>
      </div>

      {/* Status Messages */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          <FaInfoCircle />
          {message.text}
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-2">
          <FaInfoCircle />
          You have unsaved changes
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200 overflow-x-auto">
        <nav className="flex gap-1 min-w-max">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary bg-primary/5'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Hero Section Tab */}
        {activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                🏠 Hero Section
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                  <input
                    type="text"
                    value={homepageData.heroTitle}
                    onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Shree Manish Steel"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                  <input
                    type="text"
                    value={homepageData.heroSubtitle}
                    onChange={(e) => handleInputChange('heroSubtitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Furniture Udhyog"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Description</label>
                <textarea
                  value={homepageData.heroDescription}
                  onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Quality Steel Furniture for Every Space"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaImage className="inline mr-2" />
                  Hero Image
                </label>
                
                {/* File Upload Section */}
                <div className="space-y-4">
                  {/* Upload from device */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      ref={heroImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, 'heroImage');
                      }}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => heroImageInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingImage ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FaUpload />
                          Upload from Device
                        </>
                      )}
                    </button>
                    <span className="text-sm text-gray-500 self-center">or</span>
                  </div>
                  
                  {/* URL Input */}
                  <div>
                    <input
                      type="url"
                      value={homepageData.heroImage}
                      onChange={(e) => handleInputChange('heroImage', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Enter image URL: /images/home-page-1.png or https://..."
                    />
                    <p className="text-xs text-gray-500 mt-1">Supported formats: JPG, PNG, WebP (max 5MB)</p>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {homepageData.heroImage && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Image Preview:</p>
                  <div className="flex justify-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={homepageData.heroImage}
                      alt="Hero preview"
                      className="max-w-lg w-full h-64 object-cover rounded-lg shadow-md border border-gray-200"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = '/images/home-page-1.png';
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center truncate">{homepageData.heroImage}</p>
                </div>
              )}
            </div>

            {/* Hero Buttons */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Hero Buttons</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700">Primary Button</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={homepageData.heroButtonText}
                      onChange={(e) => handleInputChange('heroButtonText', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="View Products"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Button Link</label>
                    <input
                      type="text"
                      value={homepageData.heroButtonLink}
                      onChange={(e) => handleInputChange('heroButtonLink', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="/products"
                    />
                  </div>
                </div>
                
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700">Secondary Button</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={homepageData.heroSecondaryButtonText}
                      onChange={(e) => handleInputChange('heroSecondaryButtonText', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Contact Us"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Button Link</label>
                    <input
                      type="text"
                      value={homepageData.heroSecondaryButtonLink}
                      onChange={(e) => handleInputChange('heroSecondaryButtonLink', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="/contact"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <div className="space-y-6">
            {/* Main Features Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  ⭐ Features Section
                </h2>
                <ToggleSwitch
                  enabled={homepageData.featuresEnabled}
                  onChange={() => handleInputChange('featuresEnabled', !homepageData.featuresEnabled)}
                  label="Enabled"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  value={homepageData.featuresTitle}
                  onChange={(e) => handleInputChange('featuresTitle', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Why Choose Us?"
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Features ({homepageData.features.length})</label>
                {homepageData.features.map((feature, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">Feature #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature('features', index)}
                        disabled={homepageData.features.length <= 1}
                        className="text-red-500 hover:text-red-600 disabled:opacity-50"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Icon (SVG path or emoji)</label>
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => handleFeatureChange('features', index, 'icon', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="shield or 🛡️"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Title</label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => handleFeatureChange('features', index, 'title', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Premium Quality"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                        <input
                          type="text"
                          value={feature.description}
                          onChange={(e) => handleFeatureChange('features', index, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="High-grade durable furniture"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addFeature('features')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <FaPlus /> Add Feature
                </button>
              </div>
            </div>

            {/* Why Choose Us Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  🏆 Why Choose Us Section
                </h2>
                <ToggleSwitch
                  enabled={homepageData.whyChooseUsEnabled}
                  onChange={() => handleInputChange('whyChooseUsEnabled', !homepageData.whyChooseUsEnabled)}
                  label="Enabled"
                />
              </div>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input
                    type="text"
                    value={homepageData.whyChooseUsTitle}
                    onChange={(e) => handleInputChange('whyChooseUsTitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Nepal's Leading Steel Furniture Manufacturer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={homepageData.whyChooseUsDescription}
                    onChange={(e) => handleInputChange('whyChooseUsDescription', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg h-20"
                    placeholder="Trusted by thousands..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Items ({homepageData.whyChooseUsItems.length})</label>
                {homepageData.whyChooseUsItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-gray-700">Item #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature('whyChooseUsItems', index)}
                        disabled={homepageData.whyChooseUsItems.length <= 1}
                        className="text-red-500 hover:text-red-600 disabled:opacity-50"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Icon (emoji)</label>
                        <input
                          type="text"
                          value={item.icon}
                          onChange={(e) => handleFeatureChange('whyChooseUsItems', index, 'icon', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="🏆"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Title</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleFeatureChange('whyChooseUsItems', index, 'title', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="15+ Years Experience"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleFeatureChange('whyChooseUsItems', index, 'description', e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                          placeholder="Trusted manufacturing"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addFeature('whyChooseUsItems')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <FaPlus /> Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CTA Tab */}
        {activeTab === 'cta' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                📢 Call to Action Section
              </h2>
              <ToggleSwitch
                enabled={homepageData.ctaEnabled}
                onChange={() => handleInputChange('ctaEnabled', !homepageData.ctaEnabled)}
                label="Enabled"
              />
            </div>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Title</label>
                <input
                  type="text"
                  value={homepageData.ctaTitle}
                  onChange={(e) => handleInputChange('ctaTitle', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Ready to Transform Your Space?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Description</label>
                <textarea
                  value={homepageData.ctaDescription}
                  onChange={(e) => handleInputChange('ctaDescription', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Contact us today to discuss your furniture needs..."
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700">Primary CTA Button</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={homepageData.ctaButtonText}
                      onChange={(e) => handleInputChange('ctaButtonText', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Contact Us"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Button Link</label>
                    <input
                      type="text"
                      value={homepageData.ctaButtonLink}
                      onChange={(e) => handleInputChange('ctaButtonLink', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="/contact"
                    />
                  </div>
                </div>
                
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700">Secondary CTA Button</h3>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Button Text</label>
                    <input
                      type="text"
                      value={homepageData.ctaSecondaryButtonText}
                      onChange={(e) => handleInputChange('ctaSecondaryButtonText', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="Request Custom Order"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Button Link</label>
                    <input
                      type="text"
                      value={homepageData.ctaSecondaryButtonLink}
                      onChange={(e) => handleInputChange('ctaSecondaryButtonLink', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="/custom-order"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sections Tab */}
        {activeTab === 'sections' && (
          <div className="space-y-6">
            {/* Services Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  🛠️ Services Section
                </h2>
                <ToggleSwitch
                  enabled={homepageData.servicesEnabled}
                  onChange={() => handleInputChange('servicesEnabled', !homepageData.servicesEnabled)}
                  label="Show on Homepage"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input
                    type="text"
                    value={homepageData.servicesTitle}
                    onChange={(e) => handleInputChange('servicesTitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Our Services"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
                  <input
                    type="text"
                    value={homepageData.servicesSubtitle}
                    onChange={(e) => handleInputChange('servicesSubtitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Comprehensive furniture solutions..."
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                💡 Manage individual services from the <Link href="/admin/services" className="text-primary underline">Services page</Link>
              </p>
            </div>

            {/* Testimonials Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  💬 Testimonials Section
                </h2>
                <ToggleSwitch
                  enabled={homepageData.testimonialsEnabled}
                  onChange={() => handleInputChange('testimonialsEnabled', !homepageData.testimonialsEnabled)}
                  label="Show on Homepage"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input
                    type="text"
                    value={homepageData.testimonialsTitle}
                    onChange={(e) => handleInputChange('testimonialsTitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="What Our Customers Say"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
                  <input
                    type="text"
                    value={homepageData.testimonialsSubtitle}
                    onChange={(e) => handleInputChange('testimonialsSubtitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Discover why customers trust us..."
                  />
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  📍 Location Section
                </h2>
                <ToggleSwitch
                  enabled={homepageData.locationEnabled}
                  onChange={() => handleInputChange('locationEnabled', !homepageData.locationEnabled)}
                  label="Show on Homepage"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                  <input
                    type="text"
                    value={homepageData.locationTitle}
                    onChange={(e) => handleInputChange('locationTitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Visit Our Showroom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section Subtitle</label>
                  <input
                    type="text"
                    value={homepageData.locationSubtitle}
                    onChange={(e) => handleInputChange('locationSubtitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Experience our furniture collection in person..."
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500">
                💡 Update contact details from <Link href="/admin/settings" className="text-primary underline">Site Settings</Link>
              </p>
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === 'seo' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              🔍 SEO Settings
            </h2>
            
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={homepageData.metaTitle}
                  onChange={(e) => handleInputChange('metaTitle', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Shree Manish Steel Furniture - Quality Steel & Wooden Furniture in Nepal"
                />
                <p className="mt-1 text-xs text-gray-500">Recommended: 50-60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={homepageData.metaDescription}
                  onChange={(e) => handleInputChange('metaDescription', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Premium quality steel and wooden furniture manufacturer in Biratnagar, Nepal..."
                />
                <p className="mt-1 text-xs text-gray-500">Recommended: 150-160 characters</p>
              </div>
            </div>

            {/* SEO Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Search Engine Preview</h3>
              <div className="bg-white p-4 rounded border">
                <div className="text-blue-600 text-lg hover:underline cursor-pointer truncate">
                  {homepageData.metaTitle || 'Page Title'}
                </div>
                <div className="text-green-700 text-sm">https://manishsteel.com/</div>
                <div className="text-gray-600 text-sm line-clamp-2">
                  {homepageData.metaDescription || 'Page description will appear here...'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-gray-200">
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaUndo /> Discard Changes
          </button>
          <button
            type="submit"
            disabled={loading || !hasChanges}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminHomepage;

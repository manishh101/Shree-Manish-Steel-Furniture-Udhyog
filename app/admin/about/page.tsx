'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { aboutAPI } from '@/services/api';
import { FaEye, FaSave, FaUndo, FaPlus, FaTrash, FaImage, FaInfoCircle } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

interface CoreValue {
  title: string;
  description: string;
  icon?: string;
}

interface AboutData {
  heroTitle: string;
  heroDescription: string;
  storyTitle: string;
  storyContent: string[];
  storyImage: string;
  yearsExperience: string;
  happyCustomers: string;
  vision: string;
  mission: string;
  workshopTitle: string;
  workshopDescription: string;
  workshopImages: string[];
  coreValues: CoreValue[];
}

const initialAboutData: AboutData = {
  heroTitle: '',
  heroDescription: '',
  storyTitle: '',
  storyContent: [''],
  storyImage: '',
  yearsExperience: '',
  happyCustomers: '',
  vision: '',
  mission: '',
  workshopTitle: '',
  workshopDescription: '',
  workshopImages: [''],
  coreValues: [{ title: '', description: '', icon: '' }]
};

const AdminAbout = () => {
  const [aboutData, setAboutData] = useState<AboutData>(initialAboutData);
  const [originalData, setOriginalData] = useState<AboutData>(initialAboutData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  // Check for unsaved changes
  useEffect(() => {
    setHasChanges(JSON.stringify(aboutData) !== JSON.stringify(originalData));
  }, [aboutData, originalData]);

  const fetchAboutData = useCallback(async () => {
    try {
      setFetching(true);
      const response = await aboutAPI.getContent();
      if (response?.success && response.data) {
        const data: AboutData = {
          heroTitle: response.data.heroTitle || '',
          heroDescription: response.data.heroDescription || '',
          storyTitle: response.data.storyTitle || '',
          storyContent: response.data.storyContent?.length ? response.data.storyContent : [''],
          storyImage: response.data.storyImage || '',
          yearsExperience: response.data.yearsExperience || '',
          happyCustomers: response.data.happyCustomers || '',
          vision: response.data.vision || '',
          mission: response.data.mission || '',
          workshopTitle: response.data.workshopTitle || '',
          workshopDescription: response.data.workshopDescription || '',
          workshopImages: response.data.workshopImages?.length ? response.data.workshopImages : [''],
          coreValues: response.data.coreValues?.length ? response.data.coreValues : [{ title: '', description: '', icon: '' }]
        };
        setAboutData(data);
        setOriginalData(data);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      showMessage('Error loading about page data', 'error');
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchAboutData();
  }, [fetchAboutData]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleInputChange = (field: keyof AboutData, value: string) => {
    setAboutData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: 'storyContent' | 'workshopImages', index: number, value: string) => {
    setAboutData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'storyContent' | 'workshopImages') => {
    setAboutData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'storyContent' | 'workshopImages', index: number) => {
    if (aboutData[field].length > 1) {
      setAboutData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleCoreValueChange = (index: number, field: 'title' | 'description' | 'icon', value: string) => {
    setAboutData(prev => ({
      ...prev,
      coreValues: prev.coreValues.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addCoreValue = () => {
    setAboutData(prev => ({
      ...prev,
      coreValues: [...prev.coreValues, { title: '', description: '', icon: '' }]
    }));
  };

  const removeCoreValue = (index: number) => {
    if (aboutData.coreValues.length > 1) {
      setAboutData(prev => ({
        ...prev,
        coreValues: prev.coreValues.filter((_, i) => i !== index)
      }));
    }
  };

  const handleReset = () => {
    setAboutData(originalData);
    showMessage('Changes discarded', 'success');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Clean empty values from arrays
      const cleanedData = {
        ...aboutData,
        storyContent: aboutData.storyContent.filter(p => p.trim()),
        workshopImages: aboutData.workshopImages.filter(img => img.trim()),
        coreValues: aboutData.coreValues.filter(v => v.title.trim() || v.description.trim())
      };

      const response = await aboutAPI.updateContent(cleanedData);
      if (response?.success) {
        setOriginalData(aboutData);
        showMessage('About page updated successfully!', 'success');
      } else {
        throw new Error(response?.message || 'Failed to update');
      }
    } catch (error) {
      console.error('Error updating about page:', error);
      showMessage('Error updating about page', 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'hero', label: 'Hero Section', icon: '' },
    { id: 'story', label: 'Our Story', icon: '' },
    { id: 'vision', label: 'Vision & Mission', icon: '' },
    { id: 'values', label: 'Core Values', icon: '' },
    { id: 'workshop', label: 'Workshop', icon: '' },
  ];

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading about page data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">About Page Management</h1>
          <p className="text-gray-600 mt-1">Customize your about page content</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/about"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <FaEye /> Preview
          </Link>
        </div>
      </div>

      {/* Status Messages */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
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
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              🏠 Hero Section
            </h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={aboutData.heroTitle}
                  onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="About Our Company"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Description</label>
                <textarea
                  value={aboutData.heroDescription}
                  onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  placeholder="Brief description of your company..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Story Section Tab */}
        {activeTab === 'story' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              📖 Our Story
            </h2>
            <div className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Story Title</label>
                  <input
                    type="text"
                    value={aboutData.storyTitle}
                    onChange={(e) => handleInputChange('storyTitle', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Our Story"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaImage className="inline mr-2" />
                    Story Image URL
                  </label>
                  <input
                    type="url"
                    value={aboutData.storyImage}
                    onChange={(e) => handleInputChange('storyImage', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              {aboutData.storyImage && (
                <div className="flex justify-center">
                  <div className="relative max-w-md w-full h-64">
                    <Image
                      src={aboutData.storyImage}
                      alt="Story preview"
                      fill
                      className="object-contain rounded-lg shadow-md border border-gray-200"
                      sizes="(max-width: 768px) 100vw, 448px"
                    />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                  <input
                    type="text"
                    value={aboutData.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="10+"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Happy Customers</label>
                  <input
                    type="text"
                    value={aboutData.happyCustomers}
                    onChange={(e) => handleInputChange('happyCustomers', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="1000+"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Paragraphs</label>
                {aboutData.storyContent.map((paragraph, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <textarea
                      value={paragraph}
                      onChange={(e) => handleArrayChange('storyContent', index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder={`Paragraph ${index + 1}...`}
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('storyContent', index)}
                      disabled={aboutData.storyContent.length <= 1}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors h-fit"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('storyContent')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <FaPlus /> Add Paragraph
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vision & Mission Tab */}
        {activeTab === 'vision' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              🎯 Vision & Mission
            </h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vision Statement</label>
                <textarea
                  value={aboutData.vision}
                  onChange={(e) => handleInputChange('vision', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Our vision for the future..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mission Statement</label>
                <textarea
                  value={aboutData.mission}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Our mission and purpose..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Core Values Tab */}
        {activeTab === 'values' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                ⭐ Core Values
              </h2>
              <span className="text-sm text-gray-500">{aboutData.coreValues.length} values</span>
            </div>

            <div className="space-y-4">
              {aboutData.coreValues.map((value, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-700">Value #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCoreValue(index)}
                      disabled={aboutData.coreValues.length <= 1}
                      className="text-red-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        value={value.title}
                        onChange={(e) => handleCoreValueChange(index, 'title', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Value title (e.g., Quality)"
                      />
                    </div>
                    <div>
                      <select
                        value={value.icon || ''}
                        onChange={(e) => handleCoreValueChange(index, 'icon', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      >
                        <option value="">Select Icon</option>
                        <option value="quality">Quality ✓</option>
                        <option value="innovation">Innovation 💡</option>
                        <option value="integrity">Integrity 🛡️</option>
                        <option value="customer">Customer Focus 👥</option>
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <textarea
                      value={value.description}
                      onChange={(e) => handleCoreValueChange(index, 'description', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg h-20 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="Value description..."
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addCoreValue}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
            >
              <FaPlus /> Add Core Value
            </button>
          </div>
        )}

        {/* Workshop Tab */}
        {activeTab === 'workshop' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              🔧 Workshop & Team
            </h2>
            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workshop Title</label>
                <input
                  type="text"
                  value={aboutData.workshopTitle}
                  onChange={(e) => handleInputChange('workshopTitle', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Our Workshop & Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Workshop Description</label>
                <textarea
                  value={aboutData.workshopDescription}
                  onChange={(e) => handleInputChange('workshopDescription', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  placeholder="Description of your workshop..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaImage className="inline mr-2" />
                  Workshop Images
                </label>
                {aboutData.workshopImages.map((image, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleArrayChange('workshopImages', index, e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('workshopImages', index)}
                      disabled={aboutData.workshopImages.length <= 1}
                      className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('workshopImages')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <FaPlus /> Add Image
                </button>

                {/* Image Previews */}
                {aboutData.workshopImages.some(img => img) && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {aboutData.workshopImages.filter(img => img).map((img, index) => (
                      <div key={index} className="relative w-28 h-24">
                        <Image
                          src={img}
                          alt={`Workshop ${index + 1}`}
                          fill
                          className="object-cover rounded-lg shadow-md"
                          sizes="112px"
                        />
                      </div>
                    ))}
                  </div>
                )}
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

export default AdminAbout;

'use client';

import React, { useState, useEffect } from 'react';
import { aboutAPI, CoreValue as APICoreValue, AboutData as APIAboutData } from '../../services/api';

interface CoreValue {
  _id?: string;
  icon: string;
  title: string;
  description: string;
}

interface AboutData {
  heroTitle: string;
  heroDescription: string;
  storyTitle: string;
  storyContent: string[];
  storyImage: string;
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
  vision: '',
  mission: '',
  workshopTitle: '',
  workshopDescription: '',
  workshopImages: [''],
  coreValues: [{ icon: '⭐', title: '', description: '' }],
};

/**
 * AdminAbout - Admin component for managing About page content
 * 
 * Features:
 * - Edit hero section
 * - Manage story content with multiple paragraphs
 * - Vision & mission statements
 * - Core values management
 * - Workshop images
 */
const AdminAbout: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData>(initialAboutData);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const response = await aboutAPI.getContent();
      if (response?.success && response?.data) {
        // Map coreValues to ensure icon has a default value
        const mappedCoreValues: CoreValue[] = (response.data.coreValues || []).map((cv) => ({
          _id: cv._id,
          icon: cv.icon || '⭐',
          title: cv.title,
          description: cv.description,
        }));
        
        // Merge with initial data to ensure all fields exist
        setAboutData({
          ...initialAboutData,
          ...response.data,
          heroTitle: response.data.heroTitle || '',
          heroDescription: response.data.heroDescription || '',
          storyTitle: response.data.storyTitle || '',
          storyContent: response.data.storyContent || [''],
          storyImage: response.data.storyImage || '',
          vision: response.data.vision || '',
          mission: response.data.mission || '',
          workshopTitle: response.data.workshopTitle || '',
          workshopDescription: response.data.workshopDescription || '',
          workshopImages: response.data.workshopImages || [''],
          coreValues: mappedCoreValues.length > 0 ? mappedCoreValues : [{ icon: '⭐', title: '', description: '' }],
        });
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    }
  };

  const handleInputChange = (field: keyof AboutData, value: string) => {
    setAboutData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field: 'storyContent' | 'workshopImages', index: number, value: string) => {
    setAboutData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (field: 'storyContent' | 'workshopImages') => {
    setAboutData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'storyContent' | 'workshopImages', index: number) => {
    setAboutData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleCoreValueChange = (index: number, field: keyof CoreValue, value: string) => {
    setAboutData((prev) => ({
      ...prev,
      coreValues: prev.coreValues.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addCoreValue = () => {
    setAboutData((prev) => ({
      ...prev,
      coreValues: [...prev.coreValues, { icon: '⭐', title: '', description: '' }],
    }));
  };

  const removeCoreValue = (index: number) => {
    setAboutData((prev) => ({
      ...prev,
      coreValues: prev.coreValues.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Update all sections
      const response = await aboutAPI.updateSection('all', aboutData);
      if (response?.success) {
        setMessage('About page updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error updating about page');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Manage About Page</h1>

      {message && (
        <div
          className={`p-4 rounded mb-6 ${
            message.includes('Error')
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Hero Section</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hero Title</label>
              <input
                type="text"
                value={aboutData.heroTitle}
                onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="About Our Company"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Hero Description</label>
              <textarea
                value={aboutData.heroDescription}
                onChange={(e) => handleInputChange('heroDescription', e.target.value)}
                className="w-full p-3 border rounded-lg h-24"
                placeholder="Company description..."
              />
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Our Story</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Story Title</label>
              <input
                type="text"
                value={aboutData.storyTitle}
                onChange={(e) => handleInputChange('storyTitle', e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Our Story"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Story Image URL</label>
              <input
                type="url"
                value={aboutData.storyImage}
                onChange={(e) => handleInputChange('storyImage', e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Story Content (Paragraphs)</label>
              {aboutData.storyContent.map((paragraph, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <textarea
                    value={paragraph}
                    onChange={(e) => handleArrayChange('storyContent', index, e.target.value)}
                    className="flex-1 p-3 border rounded-lg h-20"
                    placeholder={`Paragraph ${index + 1}...`}
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('storyContent', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('storyContent')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Paragraph
              </button>
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Vision & Mission</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Vision</label>
              <textarea
                value={aboutData.vision}
                onChange={(e) => handleInputChange('vision', e.target.value)}
                className="w-full p-3 border rounded-lg h-24"
                placeholder="Our vision statement..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mission</label>
              <textarea
                value={aboutData.mission}
                onChange={(e) => handleInputChange('mission', e.target.value)}
                className="w-full p-3 border rounded-lg h-24"
                placeholder="Our mission statement..."
              />
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Core Values</h2>
          {aboutData.coreValues.map((value, index) => (
            <div key={index} className="border p-4 rounded mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Value {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeCoreValue(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
              <div className="space-y-2">
                <input
                  type="text"
                  value={value.title}
                  onChange={(e) => handleCoreValueChange(index, 'title', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="Value title (e.g., Quality)"
                />
                <textarea
                  value={value.description}
                  onChange={(e) => handleCoreValueChange(index, 'description', e.target.value)}
                  className="w-full p-2 border rounded h-16"
                  placeholder="Value description..."
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addCoreValue}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Core Value
          </button>
        </div>

        {/* Workshop Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Workshop & Team</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Workshop Title</label>
              <input
                type="text"
                value={aboutData.workshopTitle}
                onChange={(e) => handleInputChange('workshopTitle', e.target.value)}
                className="w-full p-3 border rounded-lg"
                placeholder="Our Workshop & Team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Workshop Description</label>
              <textarea
                value={aboutData.workshopDescription}
                onChange={(e) => handleInputChange('workshopDescription', e.target.value)}
                className="w-full p-3 border rounded-lg h-20"
                placeholder="Workshop description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Workshop Images (URLs)</label>
              {aboutData.workshopImages.map((image, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => handleArrayChange('workshopImages', index, e.target.value)}
                    className="flex-1 p-3 border rounded-lg"
                    placeholder="https://example.com/image.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem('workshopImages', index)}
                    className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('workshopImages')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Image
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminAbout;

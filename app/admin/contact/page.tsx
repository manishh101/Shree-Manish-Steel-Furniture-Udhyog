'use client';

import React, { useState, useEffect } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaWhatsapp, FaSave, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube, FaBuilding } from 'react-icons/fa';
import { settingsAPI, SiteSettings } from '@/services/api';

// Default contact information from original React app
const defaultContactInfo: SiteSettings = {
  phone: '+977 982-4336371',
  phones: ['+977 982-4336371'],
  email: 'shreemanishfurniture@gmail.com',
  address: 'Dharan Rd, Biratnagar 56613, Nepal',
  businessHours: 'Sunday - Friday: 8:00 AM - 7:00 PM\nSaturday: 8:00 AM - 12:00 PM',
  businessName: 'Shree Manish Steel Furniture Udhyog Pvt. Ltd.',
  tagline: 'Quality Steel Furniture for Your Home & Office',
  social: {
    whatsapp: 'https://wa.me/9779824336371',
    viber: '9779824336371',
    facebook: 'https://www.facebook.com/profile.php?id=61576758530152',
    instagram: 'https://www.instagram.com/shreemanishfurniture',
    tiktok: 'https://tiktok.com',
    twitter: 'https://twitter.com',
    youtube: ''
  },
  mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.089636105974!2d87.27763091503517!3d26.49980678332793!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39ef7395d46084a5%3A0xc709a12df1274cc8!2sShree%20Manish%20Steel%20Furniture%20Udhyog%20Pvt.%20Ltd.!5e0!3m2!1sen!2snp!4v1680000000000',
  logo: ''
};

const AdminContact = () => {
  const [formData, setFormData] = useState<SiteSettings>(defaultContactInfo);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ show: false, success: false, message: '' });

  // Load settings from database on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('Loading site settings from database...');
        const response = await settingsAPI.get();
        
        if (response.success && response.settings) {
          console.log('Loaded settings:', response.settings);
          
          // Merge database values with defaults (database values take priority if they exist)
          const settings = response.settings;
          setFormData({
            phone: settings.phone || defaultContactInfo.phone,
            phones: settings.phones || [settings.phone || defaultContactInfo.phone],
            email: settings.email || defaultContactInfo.email,
            address: settings.address || defaultContactInfo.address,
            businessHours: settings.businessHours || defaultContactInfo.businessHours,
            businessName: settings.businessName || defaultContactInfo.businessName,
            tagline: settings.tagline || defaultContactInfo.tagline,
            social: {
              whatsapp: settings.social?.whatsapp || defaultContactInfo.social.whatsapp,
              viber: settings.social?.viber || defaultContactInfo.social.viber,
              facebook: settings.social?.facebook || defaultContactInfo.social.facebook,
              instagram: settings.social?.instagram || defaultContactInfo.social.instagram,
              tiktok: settings.social?.tiktok || defaultContactInfo.social.tiktok,
              twitter: settings.social?.twitter || defaultContactInfo.social.twitter,
              youtube: settings.social?.youtube || defaultContactInfo.social.youtube
            },
            mapUrl: settings.mapUrl || defaultContactInfo.mapUrl,
            logo: settings.logo || defaultContactInfo.logo
          });
        } else {
          // No settings in database, use defaults
          console.log('No settings found in database, using defaults');
          setFormData(defaultContactInfo);
        }
      } catch (error) {
        console.error('Error loading site settings:', error);
        // On error, keep the defaults and show error message
        setSaveStatus({
          show: true,
          success: false,
          message: 'Failed to load settings from database. Using default values.'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let processedValue = value;
    
    // Automatically extract src from iframe snippet if user pastes the whole embed code
    if (name === 'mapUrl' && value.includes('<iframe') && value.includes('src=')) {
      const srcMatch = value.match(/src=["']([^"']+)["']/);
      if (srcMatch && srcMatch[1]) {
        processedValue = srcMatch[1];
      }
    }
    
    if (name.includes('.')) {
      // Handle nested properties (social media links)
      const [parent, child] = name.split('.');
      if (parent === 'social') {
        setFormData(prev => ({
          ...prev,
          social: {
            ...prev.social,
            [child]: processedValue
          }
        }));
      }
    } else {
      // Handle top-level properties
      setFormData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
  };

  const handlePhoneChange = (index: number, value: string) => {
    setFormData(prev => {
      const newPhones = [...(prev.phones || [prev.phone || ''])];
      newPhones[index] = value;
      return {
        ...prev,
        phones: newPhones,
        phone: newPhones[0] || ''
      };
    });
  };

  const addPhoneField = () => {
    setFormData(prev => {
      const newPhones = [...(prev.phones || [prev.phone || '']), ''];
      return {
        ...prev,
        phones: newPhones
      };
    });
  };

  const removePhoneField = (index: number) => {
    setFormData(prev => {
      const currentPhones = prev.phones || [prev.phone || ''];
      if (currentPhones.length <= 1) return prev;
      const newPhones = currentPhones.filter((_, i) => i !== index);
      return {
        ...prev,
        phones: newPhones,
        phone: newPhones[0] || ''
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setSaveStatus({ show: false, success: false, message: '' });
      
      // Filter out empty phone strings
      const cleanPhones = (formData.phones || [formData.phone])
        .map(p => p.trim())
        .filter(Boolean);

      if (cleanPhones.length === 0) {
        throw new Error('At least one phone number is required');
      }

      const updatedFormData = {
        ...formData,
        phones: cleanPhones,
        phone: cleanPhones[0]
      };

      console.log('Saving site settings:', updatedFormData);
      
      // Validate required fields
      if (!updatedFormData.address.trim() || !updatedFormData.phone.trim() || !updatedFormData.email.trim()) {
        throw new Error('Address, phone, and email are required fields');
      }
      
      // Save to database
      const response = await settingsAPI.update(updatedFormData);
      
      if (!response.success) {
        throw new Error('Failed to save settings');
      }
      
      console.log('Site settings saved successfully');
      
      // Update local state with response settings if available
      if (response.settings) {
        setFormData({
          ...response.settings,
          phones: response.settings.phones || [response.settings.phone]
        });
      }
      
      // Show success message
      setSaveStatus({
        show: true,
        success: true,
        message: 'Contact information updated successfully! Changes will reflect across the entire website.'
      });
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, show: false }));
      }, 5000);
    } catch (error) {
      console.error('Error saving site settings:', error);
      setSaveStatus({
        show: true,
        success: false,
        message: `Failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading contact information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Site Settings & Contact Information</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your business details - changes will reflect across the entire website</p>
          </div>
        </div>
        
        {saveStatus.show && (
          <div className={`mb-4 p-4 rounded-md flex items-center gap-3 ${
            saveStatus.success 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {saveStatus.success ? (
              <FaCheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <FaExclamationTriangle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{saveStatus.message}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Business Info Section */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h2 className="text-lg font-semibold mb-4 flex items-center text-blue-800">
                  <FaBuilding className="mr-2" />
                  Business Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="Your Business Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tagline
                    </label>
                    <input
                      type="text"
                      name="tagline"
                      value={formData.tagline || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="Quality Steel Furniture for Your Home & Office"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Address */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-primary" />
                  Address
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Enter business address"
                  />
                  <p className="mt-1 text-xs text-gray-500">This address will appear in the footer, contact page, and custom order section.</p>
                </div>
              </div>
            </div>
            
            {/* Phone */}
            <div className="bg-gray-50 rounded-lg p-4 border col-span-1 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaPhone className="mr-2 text-primary" />
                Phone Numbers
              </h2>
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Manage Phone Numbers <span className="text-red-500">*</span>
                </label>
                
                <div className="space-y-3">
                  {(formData.phones && formData.phones.length > 0 ? formData.phones : [formData.phone]).map((phoneVal, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="flex-grow">
                        <input
                          type="tel"
                          value={phoneVal}
                          onChange={(e) => handlePhoneChange(index, e.target.value)}
                          required={index === 0}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          placeholder={index === 0 ? "Primary number (e.g. +977 XXXXXXXXXX)" : "Secondary number"}
                        />
                      </div>
                      
                      {index === 0 ? (
                        <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => removePhoneField(index)}
                          className="px-3 py-2 text-sm text-red-600 hover:text-red-800 border border-red-200 rounded-md bg-white hover:bg-red-50 transition-colors"
                          title="Remove phone number"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={addPhoneField}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-1 font-medium"
                  >
                    + Add Phone Number
                  </button>
                  <p className="mt-2 text-xs text-gray-500">The first phone number is the primary number. These will appear in the footer, header, and contact sections.</p>
                </div>
              </div>
            </div>
            
            {/* Email */}
            <div className="bg-gray-50 rounded-lg p-4 border">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <FaEnvelope className="mr-2 text-primary" />
                Email
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="info@example.com"
                />
                <p className="mt-1 text-xs text-gray-500">This email will be displayed in footer and contact pages.</p>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FaClock className="mr-2 text-primary" />
                  Business Hours
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
                  <textarea
                    name="businessHours"
                    value={formData.businessHours}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Sunday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: Closed"
                  />
                  <p className="mt-1 text-xs text-gray-500">Enter each day on a new line. This will appear in the footer and contact page.</p>
                </div>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FaWhatsapp className="mr-2 text-primary" />
                  Social Media Links
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaWhatsapp className="inline mr-1 text-green-500" />
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      name="social.whatsapp"
                      value={formData.social.whatsapp || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="https://wa.me/9779824336371"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaPhone className="inline mr-1 text-purple-500" />
                      Viber
                    </label>
                    <input
                      type="text"
                      name="social.viber"
                      value={formData.social.viber || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="viber://chat?number=9779824336371"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaFacebook className="inline mr-1 text-blue-600" />
                      Facebook
                    </label>
                    <input
                      type="url"
                      name="social.facebook"
                      value={formData.social.facebook || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaInstagram className="inline mr-1 text-pink-500" />
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="social.instagram"
                      value={formData.social.instagram || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="https://instagram.com/yourprofile"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaTiktok className="inline mr-1" />
                      TikTok
                    </label>
                    <input
                      type="url"
                      name="social.tiktok"
                      value={formData.social.tiktok || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="https://tiktok.com/@yourprofile"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaTwitter className="inline mr-1 text-blue-400" />
                      Twitter / X
                    </label>
                    <input
                      type="url"
                      name="social.twitter"
                      value={formData.social.twitter || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="https://twitter.com/yourprofile"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <FaYoutube className="inline mr-1 text-red-600" />
                      YouTube
                    </label>
                    <input
                      type="url"
                      name="social.youtube"
                      value={formData.social.youtube || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                      placeholder="https://youtube.com/@yourchannel"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Google Maps */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4 border">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-primary" />
                  Google Maps Embed
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Embed URL</label>
                  <input
                    type="text"
                    name="mapUrl"
                    value={formData.mapUrl || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-mono text-sm"
                    placeholder="https://www.google.com/maps/embed?pb=..."
                  />
                  <div className="mt-1 flex flex-wrap items-start gap-x-4 gap-y-1">
                    <p className="text-xs text-gray-500">
                      Go to <strong>Google Maps</strong> → find your location → click <strong>Share</strong> → <strong>Embed a map</strong> → copy the <code className="bg-gray-100 px-1 rounded">src="..."</code> URL from the iframe code.
                      You can also paste the entire <code className="bg-gray-100 px-1 rounded">&lt;iframe&gt;</code> snippet — it will be extracted automatically.
                    </p>
                    {formData.mapUrl && (
                      <a
                        href={formData.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline whitespace-nowrap font-medium"
                      >
                        ↗ Open map in new tab
                      </a>
                    )}
                  </div>
                </div>

                {/* Map Preview */}
                {formData.mapUrl ? (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Preview:</label>
                    <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm" style={{ height: '350px' }}>
                      <iframe
                        key={formData.mapUrl}
                        src={formData.mapUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 0, display: 'block' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Maps Preview"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      If the map shows a broken icon, make sure the URL starts with <code className="bg-gray-100 px-1 rounded">https://www.google.com/maps/embed?</code>
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 bg-white flex flex-col items-center justify-center text-center p-10 text-gray-400" style={{ height: '200px' }}>
                    <FaMapMarkerAlt className="text-4xl mb-3 text-gray-300" />
                    <p className="text-sm font-medium">No map URL set</p>
                    <p className="text-xs mt-1">Paste a Google Maps embed URL above to see a preview here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin h-5 w-5" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="h-5 w-5" />
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Where these settings appear:</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li><strong>Phone & Email:</strong> Footer, Header, Contact Page, Custom Order Form</li>
            <li><strong>Address:</strong> Footer, Contact Page</li>
            <li><strong>Business Hours:</strong> Footer, Contact Page</li>
            <li><strong>Social Media:</strong> Footer, Contact Page</li>
            <li><strong>Business Name & Tagline:</strong> Header, Footer, SEO Meta Tags</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminContact;

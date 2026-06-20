'use client';

import React, { useState, useEffect } from 'react';
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaGlobe,
  FaChartLine,
  FaSave,
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaTimes,
  FaSpinner
} from 'react-icons/fa';
import { IServiceArea, ILocalBusinessInfo } from '@/models/SiteSettings';

const SEOSettingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newServiceArea, setNewServiceArea] = useState('');
  const [newServiceAreaType, setNewServiceAreaType] = useState<'city' | 'district' | 'province'>('city');
  const [newServiceAreaPriority, setNewServiceAreaPriority] = useState<'primary' | 'secondary'>('secondary');
  const [newKeyword, setNewKeyword] = useState('');
  const [newOpeningHour, setNewOpeningHour] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newPhone, setNewPhone] = useState('');

  // State for form data
  const [businessInfo, setBusinessInfo] = useState<ILocalBusinessInfo>({
    name: '',
    legalName: '',
    address: {
      street: '',
      city: '',
      region: '',
      postalCode: '',
      country: 'Nepal'
    },
    geo: {
      latitude: 26.4525,
      longitude: 87.2718
    },
    contacts: {
      phones: [],
      whatsapp: '',
      email: ''
    },
    openingHours: [],
    socialProfiles: {
      facebook: '',
      instagram: '',
      youtube: '',
      twitter: ''
    }
  });

  const [serviceAreas, setServiceAreas] = useState<IServiceArea[]>([]);
  const [defaultTitleSuffix, setDefaultTitleSuffix] = useState('');
  const [defaultDescription, setDefaultDescription] = useState('');
  const [defaultKeywords, setDefaultKeywords] = useState<string[]>([]);
  const [ogImage, setOgImage] = useState('');
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState('');
  const [googleSearchConsoleId, setGoogleSearchConsoleId] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [currencyAccepted, setCurrencyAccepted] = useState('NPR');
  const [paymentAccepted, setPaymentAccepted] = useState<string[]>([]);

  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('manish_steel_auth_token');
  };

  // Load settings from API
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      const data = await response.json();

      if (data.success && data.settings) {
        const s = data.settings;

        // Load business info
        if (s.businessInfo) {
          setBusinessInfo(s.businessInfo);
        } else {
          // Initialize with basic data if businessInfo doesn't exist
          setBusinessInfo({
            name: s.businessName || 'Shree Manish Steel Furniture Udhyog',
            legalName: s.businessName || 'Shree Manish Steel Furniture Udhyog',
            address: {
              street: s.address || 'Dharan Rd',
              city: 'Biratnagar',
              region: 'Province 1',
              postalCode: '56613',
              country: 'Nepal'
            },
            geo: {
              latitude: 26.4525,
              longitude: 87.2718
            },
            contacts: {
              phones: s.phones || [s.phone] || [],
              whatsapp: s.social?.whatsapp || '',
              email: s.email || ''
            },
            openingHours: s.businessHours ? s.businessHours.split('\n') : [],
            socialProfiles: {
              facebook: s.social?.facebook || '',
              instagram: s.social?.instagram || '',
              youtube: s.social?.youtube || '',
              twitter: s.social?.twitter || ''
            }
          });
        }

        // Load service areas
        setServiceAreas(s.serviceAreas || []);

        // Load SEO defaults
        setDefaultTitleSuffix(s.defaultTitleSuffix || ' | Shree Manish Steel Furniture');
        setDefaultDescription(s.defaultDescription || '');
        setDefaultKeywords(s.defaultKeywords || []);
        setOgImage(s.ogImage || '');
        setGoogleAnalyticsId(s.googleAnalyticsId || '');
        setGoogleSearchConsoleId(s.googleSearchConsoleId || '');
        setPriceRange(s.priceRange || 'Rs. 2,000 - Rs. 100,000');
        setCurrencyAccepted(s.currencyAccepted || 'NPR');
        setPaymentAccepted(s.paymentAccepted || []);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessInfoChange = (field: string, value: any) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setBusinessInfo(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else if (field.startsWith('geo.')) {
      const geoField = field.split('.')[1];
      setBusinessInfo(prev => ({
        ...prev,
        geo: {
          ...prev.geo,
          [geoField]: parseFloat(value) || 0
        }
      }));
    } else if (field.startsWith('contacts.')) {
      const contactField = field.split('.')[1];
      setBusinessInfo(prev => ({
        ...prev,
        contacts: {
          ...prev.contacts,
          [contactField]: value
        }
      }));
    } else if (field.startsWith('socialProfiles.')) {
      const socialField = field.split('.')[1];
      setBusinessInfo(prev => ({
        ...prev,
        socialProfiles: {
          ...prev.socialProfiles,
          [socialField]: value
        }
      }));
    } else {
      setBusinessInfo(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const addServiceArea = () => {
    if (!newServiceArea.trim()) return;
    
    const area: IServiceArea = {
      name: newServiceArea.trim(),
      type: newServiceAreaType,
      priority: newServiceAreaPriority,
      deliveryAvailable: true
    };

    setServiceAreas(prev => [...prev, area]);
    setNewServiceArea('');
  };

  const removeServiceArea = (index: number) => {
    setServiceAreas(prev => prev.filter((_, i) => i !== index));
  };

  const addDefaultKeyword = () => {
    if (!newKeyword.trim()) return;
    
    if (!defaultKeywords.includes(newKeyword.trim())) {
      setDefaultKeywords(prev => [...prev, newKeyword.trim()]);
    }
    
    setNewKeyword('');
  };

  const removeDefaultKeyword = (index: number) => {
    setDefaultKeywords(prev => prev.filter((_, i) => i !== index));
  };

  const addOpeningHour = () => {
    if (!newOpeningHour.trim()) return;
    
    setBusinessInfo(prev => ({
      ...prev,
      openingHours: [...prev.openingHours, newOpeningHour.trim()]
    }));
    
    setNewOpeningHour('');
  };

  const removeOpeningHour = (index: number) => {
    setBusinessInfo(prev => ({
      ...prev,
      openingHours: prev.openingHours.filter((_, i) => i !== index)
    }));
  };

  const addPaymentMethod = () => {
    if (!newPaymentMethod.trim()) return;
    
    if (!paymentAccepted.includes(newPaymentMethod.trim())) {
      setPaymentAccepted(prev => [...prev, newPaymentMethod.trim()]);
    }
    
    setNewPaymentMethod('');
  };

  const removePaymentMethod = (index: number) => {
    setPaymentAccepted(prev => prev.filter((_, i) => i !== index));
  };

  const addPhone = () => {
    if (!newPhone.trim()) return;
    
    if (!businessInfo.contacts.phones.includes(newPhone.trim())) {
      setBusinessInfo(prev => ({
        ...prev,
        contacts: {
          ...prev.contacts,
          phones: [...prev.contacts.phones, newPhone.trim()]
        }
      }));
    }
    
    setNewPhone('');
  };

  const removePhone = (index: number) => {
    setBusinessInfo(prev => ({
      ...prev,
      contacts: {
        ...prev.contacts,
        phones: prev.contacts.phones.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const token = getAuthToken();
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessInfo,
          serviceAreas,
          defaultTitleSuffix,
          defaultDescription,
          defaultKeywords,
          ogImage,
          googleAnalyticsId,
          googleSearchConsoleId,
          priceRange,
          currencyAccepted,
          paymentAccepted
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('SEO settings saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError(`Failed to save settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary mb-2">SEO Settings</h1>
        <p className="text-gray-600">Configure site-wide SEO and business information for LocalBusiness schema</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-start">
          <FaExclamationTriangle className="mt-0.5 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-start">
          <FaCheckCircle className="mt-0.5 mr-2 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Local Business Schema */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <FaBuilding className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Local Business Schema</h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                <input
                  type="text"
                  value={businessInfo.name}
                  onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Legal Name</label>
                <input
                  type="text"
                  value={businessInfo.legalName}
                  onChange={(e) => handleBusinessInfoChange('legalName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={businessInfo.address.street}
                  onChange={(e) => handleBusinessInfoChange('address.street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={businessInfo.address.city}
                  onChange={(e) => handleBusinessInfoChange('address.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region/Province</label>
                <input
                  type="text"
                  value={businessInfo.address.region}
                  onChange={(e) => handleBusinessInfoChange('address.region', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={businessInfo.address.postalCode}
                  onChange={(e) => handleBusinessInfoChange('address.postalCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={businessInfo.geo.latitude}
                  onChange={(e) => handleBusinessInfoChange('geo.latitude', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={businessInfo.geo.longitude}
                  onChange={(e) => handleBusinessInfoChange('geo.longitude', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Numbers</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPhone())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+977 9824336371"
                />
                <button
                  type="button"
                  onClick={addPhone}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  <FaPlus />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {businessInfo.contacts.phones.map((phone, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {phone}
                    <button
                      type="button"
                      onClick={() => removePhone(index)}
                      className="hover:text-blue-900"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={businessInfo.contacts.whatsapp}
                  onChange={(e) => handleBusinessInfoChange('contacts.whatsapp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="+977 9824336371"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={businessInfo.contacts.email}
                  onChange={(e) => handleBusinessInfoChange('contacts.email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newOpeningHour}
                  onChange={(e) => setNewOpeningHour(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOpeningHour())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Sunday-Friday: 8:00 AM - 7:00 PM"
                />
                <button
                  type="button"
                  onClick={addOpeningHour}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  <FaPlus />
                </button>
              </div>
              <div className="space-y-1">
                {businessInfo.openingHours.map((hour, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-sm">{hour}</span>
                    <button
                      type="button"
                      onClick={() => removeOpeningHour(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                <input
                  type="text"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Rs. 2,000 - Rs. 100,000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={currencyAccepted}
                  onChange={(e) => setCurrencyAccepted(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="NPR"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Methods</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPaymentMethod())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Cash, eSewa, Khalti, etc."
                />
                <button
                  type="button"
                  onClick={addPaymentMethod}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  <FaPlus />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {paymentAccepted.map((payment, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {payment}
                    <button
                      type="button"
                      onClick={() => removePaymentMethod(index)}
                      className="hover:text-green-900"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Service Areas */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <FaMapMarkerAlt className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Service Areas</h2>
          </div>

          <div className="mb-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
              <input
                type="text"
                value={newServiceArea}
                onChange={(e) => setNewServiceArea(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addServiceArea())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Service area name"
              />
              <select
                value={newServiceAreaType}
                onChange={(e) => setNewServiceAreaType(e.target.value as 'city' | 'district' | 'province')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="city">City</option>
                <option value="district">District</option>
                <option value="province">Province</option>
              </select>
              <select
                value={newServiceAreaPriority}
                onChange={(e) => setNewServiceAreaPriority(e.target.value as 'primary' | 'secondary')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
              <button
                type="button"
                onClick={addServiceArea}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center justify-center"
              >
                <FaPlus className="mr-2" />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {serviceAreas.map((area, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{area.name}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {area.type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    area.priority === 'primary' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {area.priority}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeServiceArea(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Social Media Profiles */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <FaGlobe className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Social Media Profiles</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                type="url"
                value={businessInfo.socialProfiles.facebook || ''}
                onChange={(e) => handleBusinessInfoChange('socialProfiles.facebook', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
              <input
                type="url"
                value={businessInfo.socialProfiles.instagram || ''}
                onChange={(e) => handleBusinessInfoChange('socialProfiles.instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://instagram.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
              <input
                type="url"
                value={businessInfo.socialProfiles.youtube || ''}
                onChange={(e) => handleBusinessInfoChange('socialProfiles.youtube', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://youtube.com/yourchannel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
              <input
                type="url"
                value={businessInfo.socialProfiles.twitter || ''}
                onChange={(e) => handleBusinessInfoChange('socialProfiles.twitter', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
          </div>
        </section>

        {/* Analytics & Tracking */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <FaChartLine className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Analytics & Tracking</h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="G-XXXXXXXXXX or UA-XXXXXXXXX-X"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your Google Analytics measurement ID
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Google Search Console Verification ID
              </label>
              <input
                type="text"
                value={googleSearchConsoleId}
                onChange={(e) => setGoogleSearchConsoleId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="google-site-verification=XXXXX"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for Search Console ownership verification
              </p>
            </div>
          </div>
        </section>

        {/* Default SEO Values */}
        <section className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <FaGlobe className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Default SEO Values</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title Suffix
              </label>
              <input
                type="text"
                value={defaultTitleSuffix}
                onChange={(e) => setDefaultTitleSuffix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder=" | Company Name"
              />
              <p className="text-xs text-gray-500 mt-1">
                This will be appended to all page titles
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Meta Description
              </label>
              <textarea
                value={defaultDescription}
                onChange={(e) => setDefaultDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
              />
              <p className="text-xs text-gray-500 mt-1">
                Used when page-specific description is not available (140-160 chars recommended)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Keywords
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDefaultKeyword())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Add default keyword"
                />
                <button
                  type="button"
                  onClick={addDefaultKeyword}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  <FaPlus />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {defaultKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeDefaultKeyword(index)}
                      className="hover:text-green-900"
                    >
                      <FaTimes className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Open Graph Image URL
              </label>
              <input
                type="url"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/og-image.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default image for social media sharing (1200x630px recommended)
              </p>
            </div>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center text-lg font-semibold shadow-md"
          >
            {saving ? (
              <>
                <FaSpinner className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SEOSettingsPage;

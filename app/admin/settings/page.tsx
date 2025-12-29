'use client';

import React, { useState, useEffect } from 'react';
import { FaCog, FaLock, FaDatabase, FaPalette, FaSave, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  productsPerPage: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface AppearanceSettings {
  primaryColor: string;
  accentColor: string;
}

const AdminSettings = () => {
  // General Settings State
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: 'Shree Manish Steel Furniture Udhyog',
    siteDescription: 'Premium steel furniture manufacturer in Biratnagar, Nepal',
    productsPerPage: '24'
  });

  // Password State
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Appearance State
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    primaryColor: '#0057A3',
    accentColor: '#FFDB00'
  });

  // Loading States
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAppearance, setSavingAppearance] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const getAuthToken = () => {
    return localStorage.getItem('token') || localStorage.getItem('manish_steel_auth_token');
  };

  const loadSettings = async () => {
    try {
      // Load from API
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success && data.settings) {
        setGeneralSettings({
          siteName: data.settings.businessName || 'Shree Manish Steel Furniture Udhyog',
          siteDescription: data.settings.tagline || 'Premium steel furniture manufacturer in Biratnagar, Nepal',
          productsPerPage: localStorage.getItem('productsPerPage') || '24'
        });
      }

      // Load appearance from localStorage
      const savedAppearance = localStorage.getItem('appearanceSettings');
      if (savedAppearance) {
        setAppearanceSettings(JSON.parse(savedAppearance));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save General Settings
  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      const token = getAuthToken();
      
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: generalSettings.siteName,
          tagline: generalSettings.siteDescription
        })
      });

      const data = await response.json();

      if (data.success) {
        // Save products per page to localStorage
        localStorage.setItem('productsPerPage', generalSettings.productsPerPage);
        toast.success('General settings saved successfully!');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving general settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSavingGeneral(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('All password fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSavingPassword(true);
    try {
      const token = getAuthToken();
      
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  // Save Appearance Settings
  const handleSaveAppearance = () => {
    setSavingAppearance(true);
    try {
      localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings));
      
      // Update CSS variables
      document.documentElement.style.setProperty('--primary-color', appearanceSettings.primaryColor);
      document.documentElement.style.setProperty('--accent-color', appearanceSettings.accentColor);
      
      toast.success('Appearance settings saved!');
    } catch (error) {
      console.error('Error saving appearance:', error);
      toast.error('Failed to save appearance settings');
    } finally {
      setSavingAppearance(false);
    }
  };

  // Export Data
  const handleExportData = async () => {
    setExporting(true);
    try {
      const token = getAuthToken();
      
      // Fetch all data
      const [productsRes, categoriesRes, inquiriesRes] = await Promise.all([
        fetch('/api/products', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/categories', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/inquiries', { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      const products = await productsRes.json();
      const categories = await categoriesRes.json();
      const inquiries = await inquiriesRes.json();

      const exportData = {
        exportedAt: new Date().toISOString(),
        products: products.products || products,
        categories: categories,
        inquiries: inquiries.inquiries || inquiries
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manish-steel-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
    }
  };

  // Clear Cache
  const handleClearCache = () => {
    setClearingCache(true);
    try {
      // Clear specific localStorage items (not auth)
      const keysToKeep = ['token', 'manish_steel_auth_token', 'user_data'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      toast.success('Cache cleared successfully!');
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    } finally {
      setClearingCache(false);
    }
  };

  // Handle color input change with sync
  const handleColorChange = (colorType: 'primaryColor' | 'accentColor', value: string) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <FaSpinner className="animate-spin text-4xl text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-center">
          <FaCog className="mr-2" />
          Settings
        </h1>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FaCog className="mr-2 text-gray-500" />
              General Settings
            </h2>
            <button
              onClick={handleSaveGeneral}
              disabled={savingGeneral}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {savingGeneral ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Save
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                value={generalSettings.siteName}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Description / Tagline</label>
              <textarea
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                rows={2}
                value={generalSettings.siteDescription}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Products Per Page</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                value={generalSettings.productsPerPage}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, productsPerPage: e.target.value }))}
              >
                <option value="12">12</option>
                <option value="24">24</option>
                <option value="48">48</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FaLock className="mr-2 text-gray-500" />
              Security Settings
            </h2>
            <button
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {savingPassword ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Change Password
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Enter current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>
            {passwordData.newPassword && passwordData.confirmPassword && (
              <div className={`flex items-center text-sm ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                {passwordData.newPassword === passwordData.confirmPassword ? (
                  <><FaCheck className="mr-1" /> Passwords match</>
                ) : (
                  <><FaExclamationTriangle className="mr-1" /> Passwords do not match</>
                )}
              </div>
            )}
            <p className="text-sm text-gray-500">
              Password must be at least 6 characters long.
            </p>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FaPalette className="mr-2 text-gray-500" />
              Appearance
            </h2>
            <button
              onClick={handleSaveAppearance}
              disabled={savingAppearance}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {savingAppearance ? <FaSpinner className="animate-spin" /> : <FaSave />}
              Save
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  value={appearanceSettings.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                />
                <input
                  type="text"
                  className="w-32 border border-gray-300 rounded-md px-3 py-2 uppercase"
                  value={appearanceSettings.primaryColor}
                  onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                />
                <div 
                  className="w-20 h-10 rounded-md border"
                  style={{ backgroundColor: appearanceSettings.primaryColor }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                  value={appearanceSettings.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                />
                <input
                  type="text"
                  className="w-32 border border-gray-300 rounded-md px-3 py-2 uppercase"
                  value={appearanceSettings.accentColor}
                  onChange={(e) => handleColorChange('accentColor', e.target.value)}
                />
                <div 
                  className="w-20 h-10 rounded-md border"
                  style={{ backgroundColor: appearanceSettings.accentColor }}
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              Note: Color changes are stored locally and may require a page refresh to take full effect.
            </p>
          </div>
        </div>

        {/* Database Settings */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <FaDatabase className="mr-2 text-gray-500" />
            Database & Backup
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Export Data</h3>
                <p className="text-sm text-gray-500">Download all products, categories, and inquiries as JSON</p>
              </div>
              <button
                onClick={handleExportData}
                disabled={exporting}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {exporting ? <FaSpinner className="animate-spin" /> : null}
                {exporting ? 'Exporting...' : 'Export'}
              </button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-medium">Clear Cache</h3>
                <p className="text-sm text-gray-500">Clear all cached data (you will remain logged in)</p>
              </div>
              <button
                onClick={handleClearCache}
                disabled={clearingCache}
                className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 text-sm flex items-center gap-2 disabled:opacity-50"
              >
                {clearingCache ? <FaSpinner className="animate-spin" /> : null}
                {clearingCache ? 'Clearing...' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

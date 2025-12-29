'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  social: {
    whatsapp?: string;
    viber?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    youtube?: string;
  };
  mapUrl?: string;
  businessName: string;
  tagline?: string;
  logo?: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

// Default settings (fallback)
const defaultSettings: SiteSettings = {
  phone: '+977 9824336371',
  email: 'shreemanishfurniture@gmail.com',
  address: 'Dharan Rd, Biratnagar 56613, Nepal',
  businessHours: 'Sunday - Friday: 8:00 AM - 7:00 PM\nSaturday: 8:00 AM - 12:00 PM',
  businessName: 'Shree Manish Steel Furniture Udhyog',
  tagline: 'Quality Steel Furniture for Your Home & Office',
  social: {
    whatsapp: '',
    viber: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    youtube: ''
  },
  mapUrl: ''
};

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: defaultSettings,
  loading: true,
  error: null,
  refreshSettings: async () => {}
});

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (data.success && data.settings) {
        setSettings({
          phone: data.settings.phone || defaultSettings.phone,
          email: data.settings.email || defaultSettings.email,
          address: data.settings.address || defaultSettings.address,
          businessHours: data.settings.businessHours || defaultSettings.businessHours,
          businessName: data.settings.businessName || defaultSettings.businessName,
          tagline: data.settings.tagline || defaultSettings.tagline,
          social: {
            whatsapp: data.settings.social?.whatsapp || '',
            viber: data.settings.social?.viber || '',
            facebook: data.settings.social?.facebook || '',
            instagram: data.settings.social?.instagram || '',
            tiktok: data.settings.social?.tiktok || '',
            twitter: data.settings.social?.twitter || '',
            youtube: data.settings.social?.youtube || ''
          },
          mapUrl: data.settings.mapUrl || '',
          logo: data.settings.logo || ''
        });
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
      setError('Failed to load site settings');
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refreshSettings = async () => {
    await fetchSettings();
  };

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, error, refreshSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}

export default SiteSettingsContext;

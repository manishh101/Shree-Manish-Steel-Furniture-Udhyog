'use client';

import { useState, useEffect, useCallback } from 'react';
import { settingsAPI, SiteSettings } from '@/services/api';

// Default contact information from original React app
const defaultSettings: SiteSettings = {
  phone: '+977 982-4336371',
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

// Global cache for settings
let settingsCache: SiteSettings | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(settingsCache || defaultSettings);
  const [loading, setLoading] = useState(!settingsCache);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Use cache if available and not expired (unless forced)
    if (!force && settingsCache && (now - lastFetchTime) < CACHE_DURATION) {
      setSettings(settingsCache);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await settingsAPI.get();
      
      if (response.success && response.settings) {
        const fetchedSettings: SiteSettings = {
          phone: response.settings.phone || defaultSettings.phone,
          email: response.settings.email || defaultSettings.email,
          address: response.settings.address || defaultSettings.address,
          businessHours: response.settings.businessHours || defaultSettings.businessHours,
          businessName: response.settings.businessName || defaultSettings.businessName,
          tagline: response.settings.tagline || defaultSettings.tagline,
          social: {
            whatsapp: response.settings.social?.whatsapp || defaultSettings.social.whatsapp,
            viber: response.settings.social?.viber || defaultSettings.social.viber,
            facebook: response.settings.social?.facebook || defaultSettings.social.facebook,
            instagram: response.settings.social?.instagram || defaultSettings.social.instagram,
            tiktok: response.settings.social?.tiktok || defaultSettings.social.tiktok,
            twitter: response.settings.social?.twitter || defaultSettings.social.twitter,
            youtube: response.settings.social?.youtube || defaultSettings.social.youtube
          },
          mapUrl: response.settings.mapUrl || defaultSettings.mapUrl,
          logo: response.settings.logo || defaultSettings.logo
        };
        
        // Update cache
        settingsCache = fetchedSettings;
        lastFetchTime = now;
        
        setSettings(fetchedSettings);
      }
    } catch (err) {
      console.error('Error fetching site settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
      // Use cached or default settings on error
      setSettings(settingsCache || defaultSettings);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Function to invalidate cache and refetch
  const refetch = useCallback(() => {
    settingsCache = null;
    return fetchSettings(true);
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refetch
  };
}

// Export for server components or direct API calls
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const response = await settingsAPI.get();
    if (response.success && response.settings) {
      return {
        phone: response.settings.phone || defaultSettings.phone,
        email: response.settings.email || defaultSettings.email,
        address: response.settings.address || defaultSettings.address,
        businessHours: response.settings.businessHours || defaultSettings.businessHours,
        businessName: response.settings.businessName || defaultSettings.businessName,
        tagline: response.settings.tagline || defaultSettings.tagline,
        social: {
          whatsapp: response.settings.social?.whatsapp || defaultSettings.social.whatsapp,
          viber: response.settings.social?.viber || defaultSettings.social.viber,
          facebook: response.settings.social?.facebook || defaultSettings.social.facebook,
          instagram: response.settings.social?.instagram || defaultSettings.social.instagram,
          tiktok: response.settings.social?.tiktok || defaultSettings.social.tiktok,
          twitter: response.settings.social?.twitter || defaultSettings.social.twitter,
          youtube: response.settings.social?.youtube || defaultSettings.social.youtube
        },
        mapUrl: response.settings.mapUrl || defaultSettings.mapUrl,
        logo: response.settings.logo || defaultSettings.logo
      };
    }
  } catch (error) {
    console.error('Error fetching site settings:', error);
  }
  return defaultSettings;
}

export { defaultSettings };

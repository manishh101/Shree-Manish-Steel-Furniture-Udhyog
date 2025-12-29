'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChatBubbleLeftRightIcon,
  PhoneIcon, 
  XMarkIcon,
  MapPinIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import { getContactInfo } from '../utils/storage';

// WhatsApp SVG Icon
const WhatsAppIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63"/>
  </svg>
);

// Viber SVG Icon
const ViberIcon: React.FC = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm4.52 7.01l-1.93.61c-.15.05-.29.1-.43.18-.69.4-1.26.94-1.67 1.58-.18.29-.34.6-.46.93-.12.33-.18.68-.18 1.04 0 .36.06.71.18 1.04.29.82.81 1.54 1.49 2.08.34.27.72.48 1.12.63.2.07.4.12.61.15.21.03.42.04.63.04.84 0 1.64-.32 2.24-.89.3-.29.54-.63.71-1.01.17-.38.26-.78.26-1.19 0-.31-.05-.61-.16-.9-.22-.58-.62-1.08-1.15-1.43-.53-.35-1.15-.54-1.78-.54-.32 0-.63.06-.93.17z"/>
  </svg>
);

interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
  social?: {
    whatsapp?: string;
    viber?: string;
    facebook?: string;
    instagram?: string;
  };
}

interface ContactOption {
  name: string;
  icon: React.ReactNode;
  color: string;
  action: () => void;
  label: string;
  hideOnMobile?: boolean;
}

/**
 * FloatingContactWidget - Professional floating contact button
 * 
 * Features:
 * - Expandable contact options (WhatsApp, Call, Viber, Location, Catalog)
 * - Smooth animations with Framer Motion
 * - Mobile-responsive positioning
 * - Hides on admin routes when authenticated
 * - Dynamic contact info from storage
 * - Accessibility support with tooltips
 */
const FloatingContactWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  
  // Load contact info on component mount
  useEffect(() => {
    try {
      const info = getContactInfo();
      setContactInfo(info);
    } catch (error) {
      console.error('Error loading contact info for widget:', error);
      // Set fallback values if error occurs
      setContactInfo({
        phone: '+977 9824336371',
        social: {
          whatsapp: 'https://wa.me/9779824336371',
          viber: '9779824336371'
        }
      });
    }
  }, []);
  
  // Check if we're on an admin route
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Check if user is admin (from localStorage)
  const isAdminAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const user = localStorage.getItem('user');
      if (user) {
        const parsed = JSON.parse(user);
        return parsed.role === 'admin';
      }
      return false;
    } catch {
      return false;
    }
  };
  
  // Hide the widget if user is in admin panel and is authenticated as admin
  if (isAdminRoute && isAdminAuthenticated()) {
    return null;
  }
  
  // Don't render if contact info is not loaded yet
  if (!contactInfo) {
    return null;
  }

  // Helper function to extract phone number from various formats
  const extractPhoneNumber = (phoneStr?: string): string => {
    if (!phoneStr) return '';
    // Remove all non-digits and extract the number
    const digits = phoneStr.replace(/\D/g, '');
    // If it starts with 977, it's already international format
    if (digits.startsWith('977')) {
      return digits;
    }
    // If it's a 10-digit number starting with 9, add country code
    if (digits.length === 10 && digits.startsWith('9')) {
      return `977${digits}`;
    }
    return digits;
  };

  // Extract WhatsApp URL or number
  const getWhatsAppUrl = (): string => {
    const whatsapp = contactInfo.social?.whatsapp || '';
    if (whatsapp.includes('wa.me/') || whatsapp.includes('whatsapp.com/')) {
      return whatsapp.includes('?text=') 
        ? whatsapp 
        : `${whatsapp}?text=Hello! I am interested in your steel furniture products from Manish Steel.`;
    }
    // If it's just a number, create WhatsApp URL
    const phoneNumber = extractPhoneNumber(whatsapp || contactInfo.phone);
    return `https://wa.me/${phoneNumber}?text=Hello! I am interested in your steel furniture products from Manish Steel.`;
  };

  const contactOptions: ContactOption[] = [
    {
      name: 'WhatsApp',
      icon: <WhatsAppIcon />,
      color: 'bg-[#25D366] hover:bg-[#1DA851]',
      action: () => window.open(getWhatsAppUrl(), '_blank'),
      label: 'Chat on WhatsApp'
    },
    {
      name: 'Call Us',
      icon: <PhoneIcon className="w-5 h-5" />,
      color: 'bg-[#0066CC] hover:bg-[#0052A3]',
      action: () => window.open(`tel:${contactInfo.phone || '+977 9824336371'}`, '_self'),
      label: 'Call Now'
    },
    {
      name: 'Viber',
      icon: <ViberIcon />,
      color: 'bg-[#665CAC] hover:bg-[#574B8C]',
      action: () => window.open(`viber://chat?number=${extractPhoneNumber(contactInfo.social?.viber || contactInfo.phone)}`, '_self'),
      label: 'Chat on Viber'
    },
    {
      name: 'Location',
      icon: <MapPinIcon className="w-5 h-5" />,
      color: 'bg-[#FF6B35] hover:bg-[#E85A2B]',
      action: () => window.open('https://www.google.com/maps/place/Shree+Manish+Steel+Furniture+Udhyog+Pvt.+Ltd./@26.49980678332793,87.27763091503517,17z/data=!3m1!4b1!4m6!3m5!1s0x39ef7395d46084a5:0xc709a12df1274cc8!8m2!3d26.49980678332793!4d87.27763091503517!16s%2Fg%2F11y3k8y8y8', '_blank'),
      label: 'Visit Our Showroom'
    },
    {
      name: 'Catalog',
      icon: <BuildingOffice2Icon className="w-5 h-5" />,
      color: 'bg-[#6366F1] hover:bg-[#5B5BD6]',
      action: () => router.push('/products'),
      label: 'Browse Catalog',
      hideOnMobile: true
    }
  ];

  return (
    <div className="fixed bottom-16 md:bottom-6 right-4 md:right-6 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-20 right-0 flex flex-col space-y-3 mb-4"
          >
            {contactOptions.map((option, index) => (
              <motion.button
                key={option.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.08, type: "spring", stiffness: 300 }}
                onClick={option.action}
                className={`${option.color} text-white p-3 md:p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center justify-center group relative ${option.hideOnMobile ? 'hidden md:flex' : ''}`}
                title={option.label}
              >
                {option.icon}
                <div className="absolute right-full mr-3 bg-blue-600 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
                  {option.label}
                  <div className="absolute top-1/2 left-full transform -translate-y-1/2 border-4 border-transparent border-l-blue-600"></div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 md:w-16 md:h-16 rounded-full shadow-xl flex items-center justify-center text-white transition-all duration-300 transform hover:scale-105 relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isOpen ? (
            <XMarkIcon className="w-6 h-6 md:w-7 md:h-7" />
          ) : (
            <ChatBubbleLeftRightIcon className="w-6 h-6 md:w-7 md:h-7" />
          )}
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute right-20 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap pointer-events-none hidden md:block"
          >
            Contact Us
            <div className="absolute top-1/2 left-full transform -translate-y-1/2 border-4 border-transparent border-l-blue-600"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingContactWidget;

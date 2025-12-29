'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { scrollToTop } from '../utils/scrollUtils';

interface BottomNavigationProps {
  toggleCategories: () => void;
  toggleMenu: () => void;
}

/**
 * BottomNavigation Component for Mobile Devices
 * 
 * Buttons and their distinct functionalities:
 * - Home: Navigates to home page, or scrolls to top if already on home
 * - Shop: Navigates to products page, or scrolls to top if already on products
 * - Categories: Toggles the category filter sidebar (only on products page)
 * - Menu: Opens the main mobile menu drawer
 */
const BottomNavigation = ({ toggleCategories, toggleMenu }: BottomNavigationProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isActive, setIsActive] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  useEffect(() => {
    if (pathname === '/') {
      setIsActive('home');
    } else if (pathname === '/products' || pathname?.startsWith('/products/')) {
      setIsActive('shop');
    } else {
      setIsActive('');
    }
  }, [pathname]);
  
  // Listen for mobile menu state changes
  useEffect(() => {
    const handleMenuStateChange = (event: CustomEvent) => {
      if (event.detail && typeof event.detail.isOpen === 'boolean') {
        setIsMenuOpen(event.detail.isOpen);
      }
    };
    
    window.addEventListener('mobileMenuStateChanged', handleMenuStateChange as EventListener);
    return () => window.removeEventListener('mobileMenuStateChanged', handleMenuStateChange as EventListener);
  }, []);
  
  // Listen for changes to the categories drawer state
  useEffect(() => {
    const indicator = document.getElementById('mobileFiltersVisibleIndicator');
    
    if (indicator) {
      // Initial state
      setIsCategoriesOpen(indicator.getAttribute('data-visible') === 'true');
      
      // Listen for changes
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.attributeName === 'data-visible') {
            setIsCategoriesOpen(indicator.getAttribute('data-visible') === 'true');
          }
        }
      });
      
      observer.observe(indicator, { attributes: true });
      return () => observer.disconnect();
    }
  }, []);

  const handleShopClick = () => {
    if (pathname === '/products') {
      // If already on products page, scroll to top
      scrollToTop({ instant: true });
    } else {
      // Navigate to products page
      router.push('/products');
    }
  };
  
  const handleHomeClick = () => {
    if (pathname === '/') {
      // If already on home page, scroll to top
      scrollToTop({ instant: true });
    } else {
      // Navigate to home page
      router.push('/');
    }
  };
  
  const handleCategoriesClick = () => {
    // Navigate to products page first if not already there
    if (pathname !== '/products') {
      router.push('/products');
      // Wait for navigation to complete before toggling categories
      setTimeout(() => {
        toggleCategories();
      }, 100);
    } else {
      // If already on products page, just toggle categories
      toggleCategories();
    }
  };
  
  const handleMenuClick = () => {
    toggleMenu();
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm z-40 md:hidden">
      <div className="grid grid-cols-4 h-14 px-4 py-1">
        <button 
          onClick={handleHomeClick}
          className={`flex flex-col items-center justify-center transition-all duration-300 relative rounded-xl mx-1 py-1 ${
            isActive === 'home' 
              ? 'text-primary bg-primary/10 font-semibold' 
              : 'text-gray-500 hover:text-primary hover:bg-gray-50'
          }`}
          aria-label={pathname === '/' ? 'Scroll to top' : 'Go to Home'}
          title={pathname === '/' ? 'Scroll to top' : 'Go to Home'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs font-normal">Home</span>
        </button>

        <button 
          onClick={handleShopClick}
          className={`flex flex-col items-center justify-center transition-all duration-300 relative rounded-xl mx-1 py-1 ${
            isActive === 'shop' 
              ? 'text-primary bg-primary/10 font-semibold' 
              : 'text-gray-500 hover:text-primary hover:bg-gray-50'
          }`}
          aria-label={pathname === '/products' ? 'Scroll to top' : 'Go to Shop'}
          title={pathname === '/products' ? 'Scroll to top' : 'Go to Shop'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="text-xs font-normal">Shop</span>
        </button>

        <button
          onClick={handleCategoriesClick}
          className={`flex flex-col items-center justify-center transition-all duration-300 relative rounded-xl mx-1 py-1 ${
            isCategoriesOpen 
              ? 'text-primary bg-primary/10 font-semibold' 
              : 'text-gray-500 hover:text-primary hover:bg-gray-50'
          }`}
          aria-label={isCategoriesOpen ? 'Close Categories' : 'Open Categories'}
          title={isCategoriesOpen ? 'Close Categories Filter' : 'Open Categories Filter'}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-xs font-normal">Categories</span>
        </button>

        <button
          onClick={handleMenuClick}
          className={`flex flex-col items-center justify-center transition-all duration-300 relative rounded-xl mx-1 py-1 ${
            isMenuOpen 
              ? 'text-primary bg-primary/10 font-semibold' 
              : 'text-gray-500 hover:text-primary hover:bg-gray-50'
          }`}
          aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
          title={isMenuOpen ? 'Close Main Menu' : 'Open Main Menu'}
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
          <span className="text-xs font-normal">Menu</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation;

'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FaSearch } from 'react-icons/fa';
import { scrollToTop } from '../utils/scrollUtils';

interface MobileMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Enhanced MobileMenuDrawer component
const MobileMenuDrawer = ({ isOpen, onClose }: MobileMenuDrawerProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  
  // Animation state - controls visibility for smooth transitions
  const [shouldRender, setShouldRender] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle mount/unmount with animation
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setShouldRender(true);
    } else if (shouldRender) {
      // Only animate close if we were previously open
      setIsClosing(true);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Effect to handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Reset search query when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Listen for the focus search event
  useEffect(() => {
    const handleOpenWithSearch = (e: CustomEvent) => {
      if (e.detail && e.detail.focusSearch) {
        // Toggle menu if not already open
        if (!isOpen) {
          const event = new CustomEvent('mobileMenuStateChanged', { 
            detail: { isOpen: true } 
          });
          window.dispatchEvent(event);
        }
        
        // Focus the search input after a short delay to ensure the drawer is rendered
        setTimeout(() => {
          if (searchInputRef.current) {
            searchInputRef.current.focus();
          }
        }, 400);
      }
    };
    
    window.addEventListener('openMobileMenuWithSearch', handleOpenWithSearch as EventListener);
    return () => window.removeEventListener('openMobileMenuWithSearch', handleOpenWithSearch as EventListener);
  }, [isOpen]);

  // Handle keyboard events for accessibility - close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Check if path matches
  const isActivePath = (path: string) => pathname === path;

  // Handle search form submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };

  // Handle navigation with scroll to top
  const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // If it's the same path, just scroll to top with enhanced behavior
    if (pathname === path) {
      e.preventDefault();
      scrollToTop({ instant: true });
      onClose();
    } else {
      // For new paths, let the navigation happen normally
      onClose();
    }
  };

  // Don't render if not needed
  if (!shouldRender) return null;
  
  return (
    <aside 
      id="mobile-menu-drawer" 
      className="fixed inset-0 z-[100]"
      ref={drawerRef}
    >
      {/* Background overlay - instant open, smooth close */}
      <div 
        className={`absolute inset-0 bg-primary/95 backdrop-blur-sm ${
          isClosing 
            ? 'opacity-0 transition-opacity duration-300 ease-out' 
            : 'opacity-100'
        }`}
        onClick={onClose}
      />
      
      {/* Close button - positioned at top left to match hamburger location */}
      <button
        type="button"
        onClick={onClose}
        className={`absolute top-3 left-4 z-[110] min-h-[48px] min-w-[48px] flex items-center justify-center rounded-full bg-white/20 focus:outline-none hover:bg-white/30 ${
          isClosing 
            ? 'opacity-0 -rotate-90 scale-75 transition-all duration-300' 
            : 'opacity-100 rotate-0 scale-100'
        }`}
        aria-label="Close menu"
      >
        {/* X icon */}
        <span className="absolute h-0.5 w-5 rounded-full bg-white transform rotate-45" />
        <span className="absolute h-0.5 w-5 rounded-full bg-white transform -rotate-45" />
      </button>

      {/* Content container - instant open, smooth close */}
      <div 
        className={`absolute inset-0 flex flex-col pt-20 px-8 pb-8 text-white ${
          isClosing 
            ? 'opacity-0 translate-y-4 transition-all duration-300 ease-out' 
            : 'opacity-100 translate-y-0'
        }`}
      >
        {/* Search form */}
        <div 
          className={`mb-10 ${
            isClosing 
              ? 'opacity-0 translate-y-4 transition-all duration-300 delay-75' 
              : 'opacity-100 translate-y-0'
          }`}
        >
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              id="mobile-search-input"
              placeholder="Search products..."
              className="w-full py-2.5 px-4 pr-12 rounded-md border border-white/20 bg-white/10 text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-accent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search products"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white p-2 hover:text-accent transition-colors"
              aria-label="Search"
            >
              <FaSearch className="h-5 w-5" />
            </button>
          </form>
        </div>

        {/* Navigation with staggered animation */}
        <nav className="flex flex-col items-center" aria-label="Mobile navigation">
          <ul className="flex flex-col items-center space-y-5 w-full">
            <li 
              className={`w-full text-center transition-all duration-300 delay-100 ${
                !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link 
                href="/" 
                onClick={(e) => handleNavLinkClick(e, '/')} 
                className={`block py-2 text-2xl font-semibold transition-colors ${isActivePath('/') ? 'text-accent' : 'text-white hover:text-accent'}`}
              >
                Home
              </Link>
            </li>
            <li 
              className={`w-full text-center transition-all duration-300 delay-150 ${
                !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link 
                href="/products" 
                onClick={(e) => handleNavLinkClick(e, '/products')} 
                className={`block py-2 text-2xl font-semibold transition-colors ${isActivePath('/products') ? 'text-accent' : 'text-white hover:text-accent'}`}
              >
                Products
              </Link>
            </li>
            <li 
              className={`w-full text-center transition-all duration-300 delay-200 ${
                !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link 
                href="/gallery" 
                onClick={(e) => handleNavLinkClick(e, '/gallery')} 
                className={`block py-2 text-2xl font-semibold transition-colors ${isActivePath('/gallery') ? 'text-accent' : 'text-white hover:text-accent'}`}
              >
                Gallery
              </Link>
            </li>
            <li 
              className={`w-full text-center transition-all duration-300 delay-[250ms] ${
                !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link 
                href="/about" 
                onClick={(e) => handleNavLinkClick(e, '/about')} 
                className={`block py-2 text-2xl font-semibold transition-colors ${isActivePath('/about') ? 'text-accent' : 'text-white hover:text-accent'}`}
              >
                About
              </Link>
            </li>
            <li 
              className={`w-full text-center transition-all duration-300 delay-300 ${
                !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link 
                href="/contact" 
                onClick={(e) => handleNavLinkClick(e, '/contact')} 
                className={`block py-2 text-2xl font-semibold transition-colors ${isActivePath('/contact') ? 'text-accent' : 'text-white hover:text-accent'}`}
              >
                Contact
              </Link>
            </li>
            <li 
              className={`w-full text-center mt-4 transition-all duration-300 delay-[350ms] ${
                !isClosing ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
              }`}
            >
              <Link 
                href="/custom-order" 
                onClick={(e) => handleNavLinkClick(e, '/custom-order')} 
                className="inline-block py-2 px-6 text-2xl font-semibold bg-accent text-primary rounded-md hover:bg-accent/80 transition-colors"
              >
                Customized Order
              </Link>
            </li>
            <li 
              className={`w-full text-center mt-6 border-t border-white/20 pt-6 transition-all duration-300 delay-[400ms] ${
                !isClosing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <Link 
                href="/login" 
                onClick={(e) => handleNavLinkClick(e, '/login')} 
                className="flex items-center justify-center py-2 text-xl font-medium text-white hover:text-accent transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Admin Login
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default MobileMenuDrawer;

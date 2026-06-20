'use client';

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSmartScroll } from '../hooks/useSmartScroll';
import EnhancedSearch from './EnhancedSearch';
import { scrollToTop } from '../utils/scrollUtils';

interface HeaderProps {
  onMenuStateChange?: (isOpen: boolean) => void;
}

const Header = forwardRef<{ toggleMobileMenu: () => void }, HeaderProps>(
  ({ onMenuStateChange }, ref) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    // Use the smart scroll hook for better header behavior
    const isHeaderVisible = useSmartScroll({
      hideThreshold: 80,
      showOnTop: 10,
      onlyMobile: false,
      throttleMs: 8
    });

    // Set mounted state after component mounts
    useEffect(() => {
      setMounted(true);
    }, []);

    // Listen for mobile menu state changes from LayoutWrapper
    useEffect(() => {
      const handleMenuStateChange = (e: CustomEvent) => {
        if (e.detail && typeof e.detail.isOpen === 'boolean') {
          setIsMenuOpen(e.detail.isOpen);
        }
      };
      
      window.addEventListener('mobileMenuStateChanged', handleMenuStateChange as EventListener);
      return () => window.removeEventListener('mobileMenuStateChanged', handleMenuStateChange as EventListener);
    }, []);

    // Add body padding for fixed header on both mobile and desktop
    useEffect(() => {
      const updateBodyPadding = () => {
        if (window.innerWidth < 768) {
          document.body.style.paddingTop = '76px';
        } else {
          document.body.style.paddingTop = '64px';
        }
      };

      updateBodyPadding();
      window.addEventListener('resize', updateBodyPadding);
      
      return () => {
        window.removeEventListener('resize', updateBodyPadding);
        document.body.style.paddingTop = '0px';
      };
    }, []);

    // Check if current path matches the link
    const isActive = (path: string) => pathname === path;

    // Function to toggle the mobile menu
    const toggleMobileMenu = () => {
      const event = new CustomEvent('mobileMenuStateChanged', { 
        detail: { isOpen: !isMenuOpen } 
      });
      window.dispatchEvent(event);
    };
    
    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      toggleMobileMenu
    }));

    // Add a function to handle the mobile search button click
    const handleMobileSearchButtonClick = () => {
      const event = new CustomEvent('openMobileMenuWithSearch', {
        detail: { focusSearch: true }
      });
      window.dispatchEvent(event);
    };

    // Handle link clicks to scroll to top
    const handleNavLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
      if (pathname === path) {
        e.preventDefault();
        scrollToTop({ instant: true });
      }
    };

    return (
      <header 
        className={`bg-white/95 backdrop-blur-md z-30 fixed top-0 left-0 right-0 border-b border-gray-100/50 ${
          !mounted 
            ? 'visible opacity-100 translate-y-0'
            : isMenuOpen 
              ? 'invisible opacity-0' 
              : isHeaderVisible 
                ? 'visible opacity-100 translate-y-0 transition-all duration-300 ease-out' 
                : 'visible opacity-100 -translate-y-full transition-all duration-300 ease-out'
        }`}
        style={mounted && isMenuOpen ? { transition: 'none' } : undefined}
      >
        <div className="container mx-auto">
          {/* Mobile Layout */}
          <div className="md:hidden flex items-center justify-between py-3">
            {/* Left: Mobile Menu Button */}
            <div className="flex-shrink-0 z-40">
              <button
                onClick={toggleMobileMenu}
                className="text-primary hover:text-primary-dark transition-all duration-200 focus:outline-none p-3 rounded-full hover:bg-gray-100 active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Toggle menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Center: Logo */}
            <div className="flex-shrink-0 z-40 absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className="flex items-center" onClick={(e) => handleNavLinkClick(e, '/')}>
                <Image 
                  src="/images/new-logo-1.png" 
                  alt="Shree Manish Steel Furniture Industry" 
                  width={128}
                  height={64}
                  className="h-16"
                  style={{ width: 'auto', height: 'auto', maxHeight: '4rem' }}
                />
              </Link>
            </div>

            {/* Right: Search button */}
            <div className="flex-shrink-0 z-40">
              <button
                onClick={handleMobileSearchButtonClick}
                className="text-primary hover:text-primary-dark transition-colors focus:outline-none p-3 rounded-full hover:bg-gray-100 active:scale-95 min-h-[48px] min-w-[48px] flex items-center justify-center"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between pt-3 pb-1.5">
            <div className="flex-shrink-0 z-40 w-64">
              <Link href="/" className="flex items-center" onClick={(e) => handleNavLinkClick(e, '/')}>
                <Image 
                  src="/images/new-logo-1.png" 
                  alt="Shree Manish Steel Furniture Industry" 
                  width={140}
                  height={56}
                  className="h-14"
                  style={{ width: 'auto', height: 'auto', maxHeight: '3.5rem' }}
                />
              </Link>
            </div>

            <nav className="flex-grow flex justify-center">
              <ul className="flex items-center space-x-5">
                <li>
                  <Link href="/" onClick={(e) => handleNavLinkClick(e, '/')} className={`text-base font-medium uppercase leading-relaxed tracking-tight transition-colors ${isActive('/') ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'}`}>
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/products" onClick={(e) => handleNavLinkClick(e, '/products')} className={`text-base font-medium uppercase leading-relaxed tracking-tight transition-colors ${isActive('/products') ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'}`}>
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/gallery" onClick={(e) => handleNavLinkClick(e, '/gallery')} className={`text-base font-medium uppercase leading-relaxed tracking-tight transition-colors ${isActive('/gallery') ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'}`}>
                    Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/about" onClick={(e) => handleNavLinkClick(e, '/about')} className={`text-base font-medium uppercase leading-relaxed tracking-tight transition-colors ${isActive('/about') ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'}`}>
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" onClick={(e) => handleNavLinkClick(e, '/contact')} className={`text-base font-medium uppercase leading-relaxed tracking-tight transition-colors ${isActive('/contact') ? 'text-primary border-b-2 border-primary' : 'text-gray-700 hover:text-primary'}`}>
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link href="/custom-order" onClick={(e) => handleNavLinkClick(e, '/custom-order')} className="bg-accent text-primary text-base font-medium uppercase leading-relaxed tracking-tight px-4 py-2 rounded-md hover:bg-accent/80 transition-colors">
                    Customized Order
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Search Bar - Right */}
            <div className="flex-shrink-0 w-64 flex justify-end">
              <EnhancedSearch 
                placeholder="Search steel furniture..." 
                className="w-64"
                showSuggestions={true}
              />
            </div>
          </div>
        </div>
      </header>
    );
  }
);

Header.displayName = 'Header';

export default Header;

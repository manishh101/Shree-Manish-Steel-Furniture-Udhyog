'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BottomNavigation from '@/components/BottomNavigation';
import MobileMenuDrawer from '@/components/MobileMenuDrawer';
import CategoryDrawer from '@/components/CategoryDrawer';
import PageTransition from '@/components/PageTransition';
import FloatingContactWidget from '@/components/FloatingContactWidget';

interface LayoutWrapperProps {
  children: ReactNode;
}

const LayoutWrapper = ({ children }: LayoutWrapperProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminRoute = pathname?.startsWith('/admin');
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [menuDrawerVisible, setMenuDrawerVisible] = useState(false);
  const headerRef = useRef(null);

  // Check if we're on the products page
  const isProductsPage = pathname === '/products' || pathname?.startsWith('/products/');

  // Toggle mobile categories filter drawer
  const toggleCategories = () => {
    if (!isProductsPage) {
      router.push('/products');
      setTimeout(() => {
        const event = new CustomEvent('openCategories');
        window.dispatchEvent(event);
      }, 150);
    } else {
      const newState = !mobileFiltersVisible;
      setMobileFiltersVisible(newState);
      
      const indicator = document.getElementById('mobileFiltersVisibleIndicator');
      if (indicator) {
        indicator.setAttribute('data-visible', newState.toString());
      }
    }
  };

  // Toggle mobile menu drawer
  const toggleMenu = () => {
    const newMenuState = !menuDrawerVisible;
    setMenuDrawerVisible(newMenuState);
    
    const event = new CustomEvent('mobileMenuStateChanged', { 
      detail: { isOpen: newMenuState } 
    });
    window.dispatchEvent(event);
  };

  // Effect to sync the menu state from all sources
  useEffect(() => {
    const handleMenuStateChange = (e: CustomEvent) => {
      if (e.detail && typeof e.detail.isOpen === 'boolean') {
        setMenuDrawerVisible(e.detail.isOpen);
      }
    };

    const handleCategoriesIntent = () => {
      setMobileFiltersVisible(true);
      const indicator = document.getElementById('mobileFiltersVisibleIndicator');
      if (indicator) {
        indicator.setAttribute('data-visible', 'true');
      }
    };

    window.addEventListener('mobileMenuStateChanged', handleMenuStateChange as EventListener);
    window.addEventListener('openCategories', handleCategoriesIntent);
    
    return () => {
      window.removeEventListener('mobileMenuStateChanged', handleMenuStateChange as EventListener);
      window.removeEventListener('openCategories', handleCategoriesIntent);
    };
  }, []);

  // Close drawers when changing routes
  useEffect(() => {
    if (menuDrawerVisible) {
      setMenuDrawerVisible(false);
      const event = new CustomEvent('mobileMenuStateChanged', { 
        detail: { isOpen: false } 
      });
      window.dispatchEvent(event);
    }
    
    if (mobileFiltersVisible && !pathname?.startsWith('/products')) {
      setMobileFiltersVisible(false);
      const indicator = document.getElementById('mobileFiltersVisibleIndicator');
      if (indicator) {
        indicator.setAttribute('data-visible', 'false');
      }
    }
  }, [pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminRoute && (
        <Header 
          ref={headerRef} 
          onMenuStateChange={(isOpen: boolean) => setMenuDrawerVisible(isOpen)} 
        />
      )}
      
      <main id="main-content" className="flex-grow" tabIndex={-1} role="main">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      
      {!isAdminRoute && <Footer />}
      
      {!isAdminRoute && (
        <BottomNavigation 
          toggleCategories={toggleCategories} 
          toggleMenu={toggleMenu} 
        />
      )}
      
      {!isAdminRoute && (
        <MobileMenuDrawer 
          isOpen={menuDrawerVisible} 
          onClose={toggleMenu}
        />
      )}
      
      {!isAdminRoute && (
        <CategoryDrawer
          isOpen={mobileFiltersVisible}
          onClose={() => {
            setMobileFiltersVisible(false);
            const indicator = document.getElementById('mobileFiltersVisibleIndicator');
            if (indicator) {
              indicator.setAttribute('data-visible', 'false');
            }
          }}
        />
      )}
      
      {/* Floating Contact Widget - Bottom Right */}
      {!isAdminRoute && <FloatingContactWidget />}
      
      <div id="mobileFiltersVisibleIndicator" data-visible={mobileFiltersVisible} hidden></div>
    </div>
  );
};

export default LayoutWrapper;

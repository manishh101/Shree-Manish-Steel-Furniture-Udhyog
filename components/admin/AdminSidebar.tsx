'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  FaThLarge, 
  FaClipboardList,
  FaImages,
  FaPhone,
  FaTags,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaEnvelope,
  FaShoppingBag,
  FaWrench,
  FaHome,
  FaNewspaper,
  FaTachometerAlt,
  FaChartLine,
  FaQuestionCircle
} from 'react-icons/fa';

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

// Defined outside component to prevent re-creation on each render and avoid hydration mismatch
const menuItems = [
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    icon: FaThLarge
  },
  {
    path: '/admin/products',
    name: 'Products',
    icon: FaClipboardList
  },
  {
    path: '/admin/categories',
    name: 'Categories',
    icon: FaTags
  },
  {
    path: '/admin/gallery',
    name: 'Gallery',
    icon: FaImages
  },
  {
    path: '/admin/homepage',
    name: 'Homepage',
    icon: FaHome
  },
  {
    path: '/admin/blogs',
    name: 'Blogs & Articles',
    icon: FaNewspaper
  },
  {
    path: '/admin/about',
    name: 'About Page',
    icon: FaClipboardList
  },
  {
    path: '/admin/faq',
    name: 'FAQ Manager',
    icon: FaQuestionCircle
  },
  {
    path: '/admin/inquiries',
    name: 'Inquiries',
    icon: FaEnvelope
  },
  {
    path: '/admin/custom-orders',
    name: 'Custom Orders',
    icon: FaShoppingBag
  },
  {
    path: '/admin/contact',
    name: 'Contact',
    icon: FaPhone
  },
  {
    path: '/admin/services',
    name: 'Services',
    icon: FaWrench
  },
  {
    path: '/admin/performance',
    name: 'Performance',
    icon: FaTachometerAlt
  },
  {
    path: '/admin/seo',
    name: 'SEO Monitoring',
    icon: FaChartLine
  },
  {
    path: '/admin/seo-settings',
    name: 'SEO Settings',
    icon: FaCog
  },
  {
    path: '/admin/settings',
    name: 'Settings',
    icon: FaCog
  }
];

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('manish_steel_auth_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };


  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-10"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Sidebar */}
      <div className={`bg-gray-800 text-white fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 z-20 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:relative`}>
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Admin Panel</h2>
            <button
              className="lg:hidden p-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="space-y-2 flex-grow overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto pt-4 border-t border-gray-700">
            <Link
              href="/"
              className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors mb-2"
            >
              <FaHome className="h-5 w-5" />
              <span>View Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
            >
              <FaSignOutAlt className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;

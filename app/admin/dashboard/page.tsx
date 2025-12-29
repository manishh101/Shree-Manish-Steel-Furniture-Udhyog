'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { productAPI, categoryAPI, subcategoryAPI, inquiryAPI } from '@/services/api';
import { 
  FaThLarge, 
  FaClipboardList,
  FaImages,
  FaPhone,
  FaSync,
  FaEnvelope
} from 'react-icons/fa';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, icon, color }: StatCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
      <div className="flex items-center">
        <div className={`p-2 sm:p-3 rounded-full ${color} text-white mr-3 sm:mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-xs sm:text-sm">{title}</p>
          <h3 className="text-xl sm:text-2xl font-bold">{value}</h3>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalInquiries: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      
      // Fetch all data in parallel for better performance
      const [productsResponse, categoriesResponse, subcategoriesResponse, inquiriesResponse] = await Promise.all([
        productAPI.getAll(1, 1000),
        categoryAPI.getAll(),
        subcategoryAPI.getAll(),
        inquiryAPI.getAll(1, 1)
      ]);
      
      // Extract data
      const totalProducts = productsResponse.totalProducts || 0;
      const totalCategories = Array.isArray(categoriesResponse) ? categoriesResponse.length : 0;
      const totalSubcategories = Array.isArray(subcategoriesResponse) ? subcategoriesResponse.length : 0;
      const totalInquiries = inquiriesResponse.totalInquiries || 0;
      
      setStats({
        totalProducts,
        totalCategories,
        totalSubcategories,
        totalInquiries
      });
      
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      
      let errorMessage = 'Failed to load dashboard stats. ';
      if (err instanceof Error) {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      loadStats();
    };
    
    initializeDashboard();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadStats(true);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [loadStats]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>
        ) : (
          <div>
            {/* Main Content */}
            <div className="flex-grow">
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-primary mb-2">Dashboard</h1>
                    <p className="text-gray-600 text-sm sm:text-base">Welcome to the Manish Steel Furniture admin panel.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <button 
                      onClick={() => loadStats(true)}
                      disabled={refreshing}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                      <FaSync className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                      <span className="text-sm">Refresh</span>
                    </button>
                    {lastUpdated && (
                      <p className="text-xs text-gray-500 mt-1">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-8">
                <StatCard 
                  title="Total Products" 
                  value={stats.totalProducts} 
                  icon={<FaThLarge className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="bg-blue-500" 
                />
                <StatCard 
                  title="Categories" 
                  value={stats.totalCategories} 
                  icon={<FaClipboardList className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="bg-green-500" 
                />
                <StatCard 
                  title="Subcategories" 
                  value={stats.totalSubcategories} 
                  icon={<FaImages className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="bg-purple-500" 
                />
                <StatCard 
                  title="Inquiries" 
                  value={stats.totalInquiries} 
                  icon={<FaEnvelope className="h-5 w-5 sm:h-6 sm:w-6" />} 
                  color="bg-yellow-500" 
                />
              </div>
              
              {/* Quick Links */}
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-primary mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
                  <Link href="/admin/products" className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 sm:p-4 rounded-lg flex flex-col items-center text-center">
                    <FaThLarge className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 mb-2" />
                    <span className="font-medium text-sm sm:text-base">Manage Products</span>
                  </Link>
                  <Link href="/admin/categories" className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 sm:p-4 rounded-lg flex flex-col items-center text-center">
                    <FaClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 mb-2" />
                    <span className="font-medium text-sm sm:text-base">Manage Categories</span>
                  </Link>
                  <Link href="/admin/gallery" className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 sm:p-4 rounded-lg flex flex-col items-center text-center">
                    <FaImages className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mb-2" />
                    <span className="font-medium text-sm sm:text-base">Manage Gallery</span>
                  </Link>
                  <Link href="/admin/contact" className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 sm:p-4 rounded-lg flex flex-col items-center text-center">
                    <FaPhone className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 mb-2" />
                    <span className="font-medium text-sm sm:text-base">Contact Info</span>
                  </Link>
                  <Link href="/admin/inquiries" className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 sm:p-4 rounded-lg flex flex-col items-center text-center">
                    <FaEnvelope className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 mb-2" />
                    <span className="font-medium text-sm sm:text-base">Inquiries</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

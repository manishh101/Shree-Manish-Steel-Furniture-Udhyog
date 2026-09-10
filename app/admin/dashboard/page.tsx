'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  productAPI, 
  categoryAPI, 
  subcategoryAPI, 
  inquiryAPI, 
  customOrderAPI, 
  blogsAPI,
  Inquiry,
  CustomOrder
} from '@/services/api';
import { 
  FaThLarge, 
  FaClipboardList,
  FaImages,
  FaPhone,
  FaSync,
  FaEnvelope,
  FaChartLine,
  FaShoppingBag,
  FaNewspaper,
  FaPlus,
  FaWhatsapp,
  FaEye,
  FaArrowRight,
  FaGlobe
} from 'react-icons/fa';
import { adminToast } from '@/lib/adminToast';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  link?: string;
}

const StatCard = ({ title, value, icon, color, badge, link }: StatCardProps) => {
  const content = (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-150 p-4 sm:p-5 transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className={`p-3 rounded-xl ${color} text-white shadow-sm flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <p className="text-gray-500 text-xs sm:text-sm font-medium">{title}</p>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-0.5">{value}</h3>
          </div>
        </div>
        {badge && (
          <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </div>
  );

  return link ? <Link href={link}>{content}</Link> : content;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalSubcategories: 0,
    totalInquiries: 0,
    unreadInquiries: 0,
    totalCustomOrders: 0,
    newCustomOrders: 0,
    totalBlogs: 0,
  });
  const [recentInquiries, setRecentInquiries] = useState<Inquiry[]>([]);
  const [recentCustomOrders, setRecentCustomOrders] = useState<CustomOrder[]>([]);
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
      
      // Fetch all metrics in parallel for optimal speed
      const [
        productsRes, 
        categoriesRes, 
        subcategoriesRes, 
        inquiriesRes,
        customOrdersRes,
        blogsRes
      ] = await Promise.allSettled([
        productAPI.getAll(1, 10),
        categoryAPI.getAll(),
        subcategoryAPI.getAll(),
        inquiryAPI.getAll(1, 5),
        customOrderAPI.getAll(1, undefined),
        blogsAPI.getAll({ status: 'all' })
      ]);
      
      const totalProducts = productsRes.status === 'fulfilled' ? (productsRes.value.totalProducts || 0) : 0;
      const totalCategories = categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value) ? categoriesRes.value.length : 0;
      const totalSubcategories = subcategoriesRes.status === 'fulfilled' && Array.isArray(subcategoriesRes.value) ? subcategoriesRes.value.length : 0;
      
      let totalInquiries = 0;
      let unreadInquiries = 0;
      let inqList: Inquiry[] = [];
      if (inquiriesRes.status === 'fulfilled') {
        totalInquiries = inquiriesRes.value.totalInquiries || 0;
        inqList = inquiriesRes.value.inquiries || [];
        unreadInquiries = inqList.filter(i => i.status === 'new' || i.status === 'unread').length;
        setRecentInquiries(inqList.slice(0, 4));
      }

      let totalCustomOrders = 0;
      let newCustomOrders = 0;
      let customList: CustomOrder[] = [];
      if (customOrdersRes.status === 'fulfilled') {
        totalCustomOrders = customOrdersRes.value.totalOrders || customOrdersRes.value.orders?.length || 0;
        customList = customOrdersRes.value.orders || [];
        newCustomOrders = customList.filter(o => o.status === 'new').length;
        setRecentCustomOrders(customList.slice(0, 4));
      }

      let totalBlogs = 0;
      if (blogsRes.status === 'fulfilled') {
        totalBlogs = blogsRes.value.blogs?.length || 0;
      }
      
      setStats({
        totalProducts,
        totalCategories,
        totalSubcategories,
        totalInquiries,
        unreadInquiries,
        totalCustomOrders,
        newCustomOrders,
        totalBlogs
      });
      
      setLastUpdated(new Date());
      if (isRefresh) {
        adminToast.success('Dashboard metrics updated');
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Failed to load dashboard stats');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadStats();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      loadStats(true);
    }, 60000);
    
    return () => clearInterval(interval);
  }, [loadStats]);

  const getWhatsAppLink = (phone?: string, name?: string) => {
    if (!phone) return '#';
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && (cleanPhone.startsWith('98') || cleanPhone.startsWith('97'))) {
      cleanPhone = `977${cleanPhone}`;
    }
    const message = encodeURIComponent(`Namaste ${name || ''}! Thank you for contacting Shree Manish Steel Furniture Udhyog.`);
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="w-full pb-10">
      <div className="container mx-auto space-y-6">
        {/* Welcome Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Admin Command Center
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Shree Manish Steel Furniture Udhyog • Biratnagar Management Hub
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => loadStats(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/95 disabled:opacity-50 transition-all shadow-sm"
            >
              <FaSync className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            {lastUpdated && (
              <span className="text-xs text-gray-400 hidden md:inline">
                Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Expanded Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              <StatCard 
                title="Products Catalog" 
                value={stats.totalProducts} 
                icon={<FaThLarge className="h-5 w-5" />} 
                color="bg-blue-600"
                link="/admin/products"
              />
              <StatCard 
                title="Categories / Sub" 
                value={stats.totalCategories} 
                icon={<FaClipboardList className="h-5 w-5" />} 
                color="bg-emerald-600"
                badge={`${stats.totalSubcategories} sub`}
                link="/admin/categories"
              />
              <StatCard 
                title="Contact Inquiries" 
                value={stats.totalInquiries} 
                icon={<FaEnvelope className="h-5 w-5" />} 
                color="bg-amber-600"
                badge={stats.unreadInquiries > 0 ? `${stats.unreadInquiries} New` : undefined}
                link="/admin/inquiries"
              />
              <StatCard 
                title="Custom Orders" 
                value={stats.totalCustomOrders} 
                icon={<FaShoppingBag className="h-5 w-5" />} 
                color="bg-indigo-600"
                badge={stats.newCustomOrders > 0 ? `${stats.newCustomOrders} New` : undefined}
                link="/admin/custom-orders"
              />
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 sm:p-6">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4 flex items-center justify-between">
                <span>Quick Actions</span>
                <span className="text-xs font-normal text-gray-400">Direct task shortcuts</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <Link 
                  href="/admin/products" 
                  className="p-3.5 rounded-xl border border-gray-150 hover:border-primary/40 hover:bg-primary/5 transition-all flex flex-col items-center text-center group"
                >
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors mb-2">
                    <FaThLarge className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-gray-800">Products</span>
                </Link>

                <Link 
                  href="/admin/categories" 
                  className="p-3.5 rounded-xl border border-gray-150 hover:border-emerald-500/40 hover:bg-emerald-50/50 transition-all flex flex-col items-center text-center group"
                >
                  <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-2">
                    <FaClipboardList className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-gray-800">Categories</span>
                </Link>

                <Link 
                  href="/admin/inquiries" 
                  className="p-3.5 rounded-xl border border-gray-150 hover:border-amber-500/40 hover:bg-amber-50/50 transition-all flex flex-col items-center text-center group"
                >
                  <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors mb-2">
                    <FaEnvelope className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-gray-800">Inquiries</span>
                </Link>

                <Link 
                  href="/admin/custom-orders" 
                  className="p-3.5 rounded-xl border border-gray-150 hover:border-indigo-500/40 hover:bg-indigo-50/50 transition-all flex flex-col items-center text-center group"
                >
                  <div className="p-2.5 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-2">
                    <FaShoppingBag className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-gray-800">Custom Orders</span>
                </Link>

                <Link 
                  href="/admin/blogs" 
                  className="p-3.5 rounded-xl border border-gray-150 hover:border-purple-500/40 hover:bg-purple-50/50 transition-all flex flex-col items-center text-center group"
                >
                  <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors mb-2">
                    <FaNewspaper className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-gray-800">Blogs & SEO</span>
                </Link>

                <Link 
                  href="/admin/seo-settings" 
                  className="p-3.5 rounded-xl border border-gray-150 hover:border-teal-500/40 hover:bg-teal-50/50 transition-all flex flex-col items-center text-center group"
                >
                  <div className="p-2.5 rounded-lg bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-colors mb-2">
                    <FaGlobe className="h-5 w-5" />
                  </div>
                  <span className="font-semibold text-xs sm:text-sm text-gray-800">SEO & Social</span>
                </Link>
              </div>
            </div>

            {/* Dual Feed: Recent Inquiries & Recent Custom Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Recent Inquiries Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                      <FaEnvelope className="text-amber-500" /> Recent Inquiries
                    </h3>
                    <Link href="/admin/inquiries" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      View All <FaArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                  {recentInquiries.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">No contact inquiries yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {recentInquiries.map((inq) => (
                        <div key={inq._id} className="p-3 rounded-lg bg-gray-50 border border-gray-150 flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-gray-900 truncate">{inq.name}</p>
                            <p className="text-gray-500 truncate">{inq.email || inq.phone}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {inq.phone && (
                              <a
                                href={getWhatsAppLink(inq.phone, inq.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                title="WhatsApp"
                              >
                                <FaWhatsapp className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <Link
                              href="/admin/inquiries"
                              className="p-1.5 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                              title="Inspect"
                            >
                              <FaEye className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Custom Orders Panel */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-150 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base flex items-center gap-2">
                      <FaShoppingBag className="text-indigo-500" /> Recent Custom Orders
                    </h3>
                    <Link href="/admin/custom-orders" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                      View All <FaArrowRight className="h-2.5 w-2.5" />
                    </Link>
                  </div>
                  {recentCustomOrders.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">No custom orders yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {recentCustomOrders.map((ord) => (
                        <div key={ord._id} className="p-3 rounded-lg bg-gray-50 border border-gray-150 flex items-center justify-between text-xs">
                          <div className="min-w-0 pr-2">
                            <p className="font-bold text-gray-900 truncate">{ord.name}</p>
                            <p className="text-gray-500 capitalize">{ord.productType} • {ord.status}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {ord.phone && (
                              <a
                                href={getWhatsAppLink(ord.phone, ord.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 rounded-md bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                title="WhatsApp"
                              >
                                <FaWhatsapp className="h-3.5 w-3.5" />
                              </a>
                            )}
                            <Link
                              href="/admin/custom-orders"
                              className="p-1.5 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
                              title="Inspect"
                            >
                              <FaEye className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

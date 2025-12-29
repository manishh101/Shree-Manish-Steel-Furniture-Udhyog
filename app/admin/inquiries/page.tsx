'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FaEnvelope, 
  FaEnvelopeOpen, 
  FaCheck, 
  FaArchive, 
  FaTrash, 
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaPhone,
  FaArrowLeft,
  FaTimes,
  FaCopy,
  FaSync
} from 'react-icons/fa';
import { inquiryAPI, Inquiry } from '@/services/api';

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showMobileDetails, setShowMobileDetails] = useState(false);

  // Debounce timeout ref
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Helper function to categorize inquiries based on content
  const categorizeInquiry = (inquiry: Inquiry): string => {
    // Check if category exists and is valid
    const validCategories = ['product', 'service', 'support', 'business', 'general'];
    if (inquiry.category && validCategories.includes(inquiry.category)) {
      return inquiry.category;
    }
    
    const message = (inquiry.message || '').toLowerCase();
    const name = (inquiry.name || '').toLowerCase();
    const email = (inquiry.email || '').toLowerCase();
    const allText = `${message} ${name} ${email}`.toLowerCase();
    
    if (allText.includes('furniture') || allText.includes('product') || allText.includes('steel') || 
        allText.includes('chair') || allText.includes('table') || allText.includes('cabinet')) {
      return 'product';
    } else if (allText.includes('service') || allText.includes('custom') || allText.includes('order') || 
               allText.includes('design') || allText.includes('manufacture')) {
      return 'service';
    } else if (allText.includes('price') || allText.includes('quote') || allText.includes('delivery') || 
               allText.includes('cost') || allText.includes('rate') || allText.includes('how much')) {
      return 'support';
    } else if (allText.includes('business') || allText.includes('dealer') || allText.includes('wholesale') || 
               allText.includes('partnership') || allText.includes('distributor')) {
      return 'business';
    }
    return 'general';
  };

  // Helper function to get display label for category
  const getCategoryDisplayLabel = (category: string): string => {
    const categoryLabels: Record<string, string> = {
      'product': 'Product Information',
      'service': 'Custom Order',
      'support': 'Price Quote / Delivery',
      'business': 'Business/Dealership',
      'general': 'General Inquiry'
    };
    return categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotificationMessage(`${type} copied to clipboard`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Load inquiries
  const loadInquiries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await inquiryAPI.getAll(currentPage, 10, statusFilter || undefined, searchQuery || undefined);
      
      if (response.inquiries) {
        let filteredInquiries = response.inquiries;
        
        // Apply client-side category filtering
        if (categoryFilter) {
          filteredInquiries = response.inquiries.filter((inquiry: Inquiry) => {
            const inquiryCategory = categorizeInquiry(inquiry);
            return inquiryCategory === categoryFilter;
          });
        }
        
        setInquiries(filteredInquiries);
        setTotalPages(response.totalPages || 1);
        
        if (filteredInquiries.length === 0 && (statusFilter || categoryFilter)) {
          setError(`No inquiries found with selected filters.`);
        } else if (filteredInquiries.length === 0) {
          setError('No inquiries found. Contact form submissions will appear here.');
        } else {
          setError('');
        }
      } else {
        setInquiries([]);
        setError('Unable to load inquiries.');
      }
    } catch (err) {
      console.error('Error loading inquiries:', err);
      setError('Failed to load inquiries. Please try again.');
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, categoryFilter, searchQuery]);

  useEffect(() => {
    loadInquiries();
  }, [loadInquiries]);

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = setTimeout(() => {
      setCurrentPage(1);
    }, 500);
  };

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await inquiryAPI.updateStatus(id, newStatus);
      
      setNotificationMessage(`Inquiry status updated to ${newStatus}`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      setInquiries(prevInquiries => 
        prevInquiries.map(inquiry => 
          inquiry._id === id ? { ...inquiry, status: newStatus as Inquiry['status'] } : inquiry
        )
      );
      
      if (selectedInquiry && selectedInquiry._id === id) {
        setSelectedInquiry(prev => prev ? { ...prev, status: newStatus as Inquiry['status'] } : null);
      }
    } catch (err) {
      console.error('Error updating inquiry status:', err);
      setError('Failed to update status. Please try again.');
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        await inquiryAPI.delete(id);
        
        setNotificationMessage('Inquiry deleted successfully');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        
        setInquiries(prevInquiries => 
          prevInquiries.filter(inquiry => inquiry._id !== id)
        );
        
        if (selectedInquiry && selectedInquiry._id === id) {
          setSelectedInquiry(null);
          setShowMobileDetails(false);
        }
      } catch (err) {
        console.error('Error deleting inquiry:', err);
        setError('Failed to delete inquiry. Please try again.');
      }
    }
  };

  // View inquiry details
  const viewInquiry = async (id: string) => {
    try {
      const response = await inquiryAPI.getById(id);
      setSelectedInquiry(response);
      
      if (response.status === 'new') {
        handleStatusChange(id, 'read');
      }
      
      // Show mobile details view
      if (typeof window !== 'undefined' && window.innerWidth < 1024) {
        setShowMobileDetails(true);
      }
    } catch (err) {
      console.error('Error fetching inquiry details:', err);
      // Fallback to local inquiry
      const localInquiry = inquiries.find(i => i._id === id);
      if (localInquiry) {
        setSelectedInquiry(localInquiry);
        if (localInquiry.status === 'new') {
          handleStatusChange(id, 'read');
        }
        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
          setShowMobileDetails(true);
        }
      } else {
        setError('Failed to load inquiry details.');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <FaEnvelope className="h-4 w-4 text-primary" />;
      case 'read': return <FaEnvelopeOpen className="h-4 w-4 text-blue-500" />;
      case 'replied': return <FaCheck className="h-4 w-4 text-green-500" />;
      case 'archived': return <FaArchive className="h-4 w-4 text-gray-500" />;
      default: return <FaEnvelope className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'new': 'bg-primary text-white',
      'read': 'bg-blue-400 text-white',
      'replied': 'bg-green-500 text-white',
      'archived': 'bg-gray-400 text-white'
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'product': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'service': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'support': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'business': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Notification component
  const Notification = ({ message }: { message: string }) => (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-2 rounded shadow-md text-sm flex items-center">
        <FaCheck className="h-4 w-4 mr-2" />
        {message}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-3 py-4 sm:px-4 sm:py-6">
      {showNotification && <Notification message={notificationMessage} />}

      <div className="flex items-center justify-between mb-4">
        <h1 className={`text-lg sm:text-xl font-bold text-primary ${showMobileDetails ? 'hidden sm:block' : ''}`}>
          Contact Inquiries
        </h1>
        
        {/* Mobile back button */}
        {showMobileDetails && selectedInquiry && (
          <button
            onClick={() => setShowMobileDetails(false)}
            className="lg:hidden inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 text-gray-700"
          >
            <FaArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        )}
        
        <button 
          onClick={loadInquiries}
          className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
          disabled={loading}
        >
          <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-2 mb-4 text-sm rounded">
          {error}
        </div>
      )}
      
      {/* Filter Bar - Hide when viewing details on mobile */}
      <div className={`${showMobileDetails ? 'hidden lg:block' : 'block'} mb-4`}>
        {/* Search Bar */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="Search inquiries..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-30"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          {searchQuery && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-3 border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Status Filter */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Status</option>
                <option value="new">New</option>
                <option value="read">Read</option>
                <option value="replied">Replied</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">All Categories</option>
                <option value="product">Product Information</option>
                <option value="service">Custom Order</option>
                <option value="support">Price Quote / Delivery</option>
                <option value="business">Business/Dealership</option>
                <option value="general">General Inquiry</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(statusFilter || categoryFilter || searchQuery) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {statusFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 text-xs text-blue-800 border border-blue-200">
                  Status: {statusFilter}
                  <button onClick={() => { setStatusFilter(''); setCurrentPage(1); }} className="ml-1">
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-xs text-purple-800 border border-purple-200">
                  Category: {getCategoryDisplayLabel(categoryFilter)}
                  <button onClick={() => { setCategoryFilter(''); setCurrentPage(1); }} className="ml-1">
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-800 border border-gray-200">
                  Search: {searchQuery}
                  <button onClick={() => { setSearchQuery(''); setCurrentPage(1); }} className="ml-1">
                    <FaTimes className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Inquiries List - Hidden on mobile when details are shown */}
        <div className={`lg:col-span-1 ${showMobileDetails ? 'hidden lg:block' : ''}`}>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center p-6">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-primary"></div>
              </div>
            ) : inquiries.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                {statusFilter || categoryFilter ? (
                  <>
                    <p>No inquiries found with selected filters</p>
                    <button
                      onClick={() => { setStatusFilter(''); setCategoryFilter(''); }}
                      className="text-primary mt-2 text-sm hover:underline"
                    >
                      Clear filters
                    </button>
                  </>
                ) : (
                  <p>No inquiries found</p>
                )}
              </div>
            ) : (
              <div className="max-h-[calc(100vh-280px)] sm:max-h-[600px] overflow-y-auto">
                {inquiries.map((inquiry) => {
                  const category = categorizeInquiry(inquiry);
                  
                  return (
                    <div 
                      key={inquiry._id} 
                      className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedInquiry?._id === inquiry._id ? 'bg-blue-50 border-l-4 border-l-primary' : ''
                      } ${inquiry.status === 'new' ? 'bg-primary/5' : ''}`}
                      onClick={() => viewInquiry(inquiry._id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(inquiry.status)}
                          <span className={`font-medium text-sm truncate max-w-[150px] ${inquiry.status === 'new' ? 'font-semibold' : ''}`}>
                            {inquiry.name}
                          </span>
                          {inquiry.status === 'new' && (
                            <span className="h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                          )}
                        </div>
                        {getStatusBadge(inquiry.status)}
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                        <FaEnvelope className="h-3 w-3" />
                        <span className="truncate">{inquiry.email}</span>
                      </div>
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryColor(category)}`}>
                          {getCategoryDisplayLabel(category)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatDate(inquiry.createdAt).split(',')[0]}
                        </span>
                      </div>
                      
                      {inquiry.message && (
                        <p className="text-xs text-gray-500 mt-2 truncate bg-gray-50 px-2 py-1 rounded">
                          {inquiry.message.length > 60 ? `${inquiry.message.substring(0, 60)}...` : inquiry.message}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center py-3 border-t bg-gray-50">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="h-4 w-4 text-gray-600" />
                </button>
                
                <span className="mx-3 text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Inquiry Details */}
        <div className={`lg:col-span-2 ${showMobileDetails ? '' : 'hidden lg:block'}`}>
          {selectedInquiry ? (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 h-full flex flex-col">
              {/* Mobile header */}
              <div className="lg:hidden flex items-center justify-between mb-4">
                <button 
                  onClick={() => setShowMobileDetails(false)}
                  className="p-2 rounded-full bg-gray-100"
                >
                  <FaArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">
                    {inquiries.findIndex(i => i._id === selectedInquiry._id) + 1}/{inquiries.length}
                  </span>
                  
                  <div className="flex">
                    <button 
                      onClick={() => {
                        const currentIndex = inquiries.findIndex(i => i._id === selectedInquiry._id);
                        if (currentIndex > 0) {
                          viewInquiry(inquiries[currentIndex - 1]._id);
                        }
                      }}
                      disabled={inquiries.findIndex(i => i._id === selectedInquiry._id) === 0}
                      className="p-1.5 disabled:opacity-30"
                    >
                      <FaChevronLeft className="h-4 w-4 text-gray-500" />
                    </button>
                    <button 
                      onClick={() => {
                        const currentIndex = inquiries.findIndex(i => i._id === selectedInquiry._id);
                        if (currentIndex < inquiries.length - 1) {
                          viewInquiry(inquiries[currentIndex + 1]._id);
                        }
                      }}
                      disabled={inquiries.findIndex(i => i._id === selectedInquiry._id) === inquiries.length - 1}
                      className="p-1.5 disabled:opacity-30"
                    >
                      <FaChevronRight className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Contact details */}
              <div className="mb-4 bg-gray-50 border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3 border-b pb-2">
                  <h2 className="text-lg font-semibold text-gray-800">{selectedInquiry.name}</h2>
                  {getStatusBadge(selectedInquiry.status)}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center group">
                    <a href={`mailto:${selectedInquiry.email}`} className="hover:text-primary flex items-center">
                      <FaEnvelope className="h-4 w-4 mr-2 text-gray-400" />
                      {selectedInquiry.email}
                    </a>
                    <button
                      onClick={() => copyToClipboard(selectedInquiry.email, 'Email')}
                      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                      title="Copy email"
                    >
                      <FaCopy className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                  
                  {selectedInquiry.phone && (
                    <div className="flex items-center group">
                      <a href={`tel:${selectedInquiry.phone}`} className="hover:text-primary flex items-center">
                        <FaPhone className="h-4 w-4 mr-2 text-gray-400" />
                        {selectedInquiry.phone}
                      </a>
                      <button
                        onClick={() => copyToClipboard(selectedInquiry.phone!, 'Phone')}
                        className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                        title="Copy phone"
                      >
                        <FaCopy className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                  <span>{formatDate(selectedInquiry.createdAt)}</span>
                  <span className={`px-2 py-0.5 rounded-full border ${getCategoryColor(categorizeInquiry(selectedInquiry))}`}>
                    {getCategoryDisplayLabel(categorizeInquiry(selectedInquiry))}
                  </span>
                </div>
              </div>
              
              {/* Message content */}
              <div className="bg-gray-50 border rounded-lg p-4 mb-4 flex-grow overflow-y-auto">
                <h3 className="text-sm font-medium text-gray-700 mb-2 border-b pb-2">Message</h3>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {selectedInquiry.message || <span className="italic text-gray-400">No message content</span>}
                </p>
              </div>
              
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t">
                {selectedInquiry.status !== 'read' && (
                  <button
                    onClick={() => handleStatusChange(selectedInquiry._id, 'read')}
                    className="flex items-center px-3 py-1.5 rounded bg-blue-100 text-sm text-blue-700 hover:bg-blue-200 transition-colors"
                  >
                    <FaEnvelopeOpen className="h-4 w-4 mr-2" />
                    Mark as Read
                  </button>
                )}
                
                {selectedInquiry.status !== 'replied' && (
                  <button
                    onClick={() => handleStatusChange(selectedInquiry._id, 'replied')}
                    className="flex items-center px-3 py-1.5 rounded bg-green-100 text-sm text-green-700 hover:bg-green-200 transition-colors"
                  >
                    <FaCheck className="h-4 w-4 mr-2" />
                    Mark as Replied
                  </button>
                )}
                
                {selectedInquiry.status !== 'archived' && (
                  <button
                    onClick={() => handleStatusChange(selectedInquiry._id, 'archived')}
                    className="flex items-center px-3 py-1.5 rounded bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    <FaArchive className="h-4 w-4 mr-2" />
                    Archive
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(selectedInquiry._id)}
                  className="flex items-center px-3 py-1.5 rounded bg-red-100 text-sm text-red-700 hover:bg-red-200 ml-auto transition-colors"
                >
                  <FaTrash className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 text-center flex flex-col items-center justify-center min-h-[300px]">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <FaEnvelope className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Inquiry Selected</h3>
              <p className="text-sm text-gray-500">Select an inquiry from the list to view details</p>
              <p className="mt-4 text-xs text-gray-400 lg:hidden">
                Tap on an inquiry to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInquiries;

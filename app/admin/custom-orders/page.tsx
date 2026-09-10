'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { customOrderAPI, CustomOrder } from '@/services/api';
import { 
  FaEye,
  FaSync,
  FaShoppingBag,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaCopy,
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaTimes,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaReply
} from 'react-icons/fa';
import { adminToast } from '@/lib/adminToast';

const AdminCustomOrders = () => {
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await customOrderAPI.getAll(currentPage, filterStatus !== 'all' ? filterStatus : undefined);
      setOrders(response.orders || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Error loading custom orders:', err);
      setError(`Failed to load orders: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, currentPage]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!newStatus) return;
    
    try {
      await customOrderAPI.updateStatus(orderId, newStatus);
      adminToast.success(`Order status updated to ${newStatus.replace('-', ' ')}`);
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus as CustomOrder['status'] } : order
        )
      );
      
      // Update selected order if viewing
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus as CustomOrder['status'] } : null);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      adminToast.error('Failed to update status. Please try again.');
    }
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this custom order?')) {
      try {
        await customOrderAPI.delete(orderId);
        adminToast.success('Order deleted successfully');
        
        // Update local state
        setOrders(prevOrders => prevOrders.filter(order => order._id !== orderId));
        
        // Close modal if viewing deleted order
        if (selectedOrder && selectedOrder._id === orderId) {
          setSelectedOrder(null);
        }
      } catch (err) {
        console.error('Error deleting order:', err);
        adminToast.error('Failed to delete order. Please try again.');
      }
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      adminToast.success(`${type} copied to clipboard`);
    } catch (err) {
      console.error('Failed to copy:', err);
      adminToast.error(`Failed to copy ${type}`);
    }
  };

  const getWhatsAppLink = (order: CustomOrder) => {
    if (!order.phone) return null;
    let cleanPhone = order.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length === 10 && (cleanPhone.startsWith('98') || cleanPhone.startsWith('97'))) {
      cleanPhone = `977${cleanPhone}`;
    }
    const message = encodeURIComponent(
      `Namaste ${order.name}! Thank you for choosing Shree Manish Steel Furniture Udhyog for your custom "${formatProductType(order.productType)}" order inquiry. We have received your request and would love to assist you with the customization details and quotation. When would be a convenient time to discuss?`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // Status styles matching actual model values
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      'new': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'quoted': 'bg-purple-100 text-purple-800',
      'approved': 'bg-green-100 text-green-800',
      'manufacturing': 'bg-indigo-100 text-indigo-800',
      'completed': 'bg-emerald-100 text-emerald-800',
      'delivered': 'bg-teal-100 text-teal-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return styles[status] || styles['new'];
  };

  // Format product type for display
  const formatProductType = (type: string) => {
    const types: Record<string, string> = {
      'household': 'Household Furniture',
      'office': 'Office Furniture',
      'wood': 'Wooden Furniture',
      'steel': 'Steel Furniture',
      'other': 'Other'
    };
    return types[type] || type;
  };

  // Format budget for display
  const formatBudget = (budget?: string) => {
    if (!budget) return 'Not specified';
    const budgets: Record<string, string> = {
      'under-10000': 'Under ₹10,000',
      '10000-20000': '₹10,000 - ₹20,000',
      '20000-30000': '₹20,000 - ₹30,000',
      '30000-50000': '₹30,000 - ₹50,000',
      'above-50000': 'Above ₹50,000'
    };
    return budgets[budget] || budget;
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

  // Format dimensions for display
  const formatDimensions = (dimensions?: { width?: string; height?: string; depth?: string }) => {
    if (!dimensions) return null;
    const parts = [];
    if (dimensions.width) parts.push(`W: ${dimensions.width}`);
    if (dimensions.height) parts.push(`H: ${dimensions.height}`);
    if (dimensions.depth) parts.push(`D: ${dimensions.depth}`);
    return parts.length > 0 ? parts.join(' × ') : null;
  };

  // Status options matching actual model enum
  const statusOptions = [
    { value: 'new', label: 'New' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'quoted', label: 'Quoted' },
    { value: 'approved', label: 'Approved' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'completed', label: 'Completed' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-primary flex items-center">
          <FaShoppingBag className="mr-2" />
          Custom Orders
        </h1>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Status</option>
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <button 
            onClick={loadOrders}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
            disabled={loading}
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusBadge(order.status)}`}
                      >
                        {statusOptions.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.name}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                        {order.phone && <div className="text-xs text-gray-400">{order.phone}</div>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatProductType(order.productType)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatBudget(order.budget)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {order.phone && getWhatsAppLink(order) && (
                          <a
                            href={getWhatsAppLink(order)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-800 p-1 hover:bg-emerald-50 rounded"
                            title="Chat on WhatsApp"
                          >
                            <FaWhatsapp className="h-4 w-4" />
                          </a>
                        )}
                        {order.phone && (
                          <a
                            href={`tel:${order.phone}`}
                            className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                            title="Direct Call"
                          >
                            <FaPhone className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="text-primary hover:text-primary/80 p-1 hover:bg-primary/5 rounded"
                          title="View Details"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(order._id)}
                          className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                          title="Delete Order"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No custom orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center py-4 border-t bg-gray-50">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaChevronLeft className="h-4 w-4 text-gray-600" />
              </button>
              
              <span className="mx-4 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FaChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* View Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-primary">Order Details</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">{selectedOrder.name}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status.replace('-', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center group text-sm text-gray-600">
                    <FaEnvelope className="h-4 w-4 mr-2 text-gray-400" />
                    <a href={`mailto:${selectedOrder.email}`} className="hover:text-primary">{selectedOrder.email}</a>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.email, 'Email')}
                      className="ml-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                    >
                      <FaCopy className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex items-center group text-sm text-gray-600">
                    <FaPhone className="h-4 w-4 mr-2 text-gray-400" />
                    <a href={`tel:${selectedOrder.phone}`} className="hover:text-primary">{selectedOrder.phone}</a>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.phone, 'Phone')}
                      className="ml-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                    >
                      <FaCopy className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex items-start group text-sm text-gray-600">
                    <FaMapMarkerAlt className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                    <span className="hover:text-primary">{selectedOrder.address}</span>
                    <button
                      onClick={() => copyToClipboard(selectedOrder.address, 'Address')}
                      className="ml-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded flex-shrink-0"
                    >
                      <FaCopy className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>

                  {/* Direct 1-Click Communication Shortcuts */}
                  <div className="flex flex-wrap gap-2 pt-3 mt-3 border-t border-gray-200">
                    {selectedOrder.phone && getWhatsAppLink(selectedOrder) && (
                      <a
                        href={getWhatsAppLink(selectedOrder)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all shadow-sm"
                      >
                        <FaWhatsapp className="h-3.5 w-3.5 mr-1.5" />
                        WhatsApp Customer
                      </a>
                    )}
                    {selectedOrder.phone && (
                      <a
                        href={`tel:${selectedOrder.phone}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all shadow-sm"
                      >
                        <FaPhone className="h-3 w-3 mr-1.5" />
                        Direct Call
                      </a>
                    )}
                    {selectedOrder.email && (
                      <a
                        href={`mailto:${selectedOrder.email}?subject=${encodeURIComponent(`Quotation & Specifications for Custom Order - Shree Manish Steel Furniture`)}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-semibold hover:bg-gray-900 transition-all shadow-sm"
                      >
                        <FaReply className="h-3 w-3 mr-1.5" />
                        Send Email Quote
                      </a>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Order Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Product Type</label>
                  <p className="text-gray-900">{formatProductType(selectedOrder.productType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Requirements</label>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">{selectedOrder.requirements}</p>
                </div>
                {formatDimensions(selectedOrder.dimensions) && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Dimensions</label>
                    <p className="text-gray-900">{formatDimensions(selectedOrder.dimensions)}</p>
                  </div>
                )}
                {selectedOrder.color && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Color Preference</label>
                    <p className="text-gray-900">{selectedOrder.color}</p>
                  </div>
                )}
                {selectedOrder.budget && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Budget Range</label>
                    <p className="text-gray-900 font-medium">{formatBudget(selectedOrder.budget)}</p>
                  </div>
                )}
                {selectedOrder.quotedPrice && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Quoted Price</label>
                    <p className="text-green-600 font-semibold">₹{selectedOrder.quotedPrice.toLocaleString()}</p>
                    {selectedOrder.quotedAt && (
                      <p className="text-xs text-gray-400">Quoted on {formatDate(selectedOrder.quotedAt)}</p>
                    )}
                  </div>
                )}
                {selectedOrder.adminNotes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Admin Notes</label>
                    <p className="text-gray-900 bg-yellow-50 p-3 rounded border border-yellow-200">{selectedOrder.adminNotes}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted On</label>
                  <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap justify-between gap-2 p-4 border-t">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Update Status:</label>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDelete(selectedOrder._id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 flex items-center"
                >
                  <FaTrash className="mr-2 h-4 w-4" />
                  Delete
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomOrders;

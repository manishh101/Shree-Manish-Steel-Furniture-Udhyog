'use client';

import React, { useState, useEffect } from 'react';
import { FaPlus, FaTimes, FaSave, FaTrash, FaEdit, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { servicesAPI, Service } from '@/services/api';

// Common icons for services
const commonIcons = ['🏠', '🔧', '🚚', '🛠️', '💼', '🏭', '⚡', '🎯', '📞', '💡', '🔒', '⭐', '✨', '🎨', '📦', '🤝'];

const AdminServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: '🔧',
    isActive: true
  });
  const [status, setStatus] = useState({ show: false, success: false, message: '' });

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await servicesAPI.getAll();
      if (response.success) {
        setServices(response.services);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      showMessage('Failed to load services', false);
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (message: string, success: boolean) => {
    setStatus({ show: true, success, message });
    setTimeout(() => {
      setStatus(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      showMessage('Title and description are required', false);
      return;
    }

    try {
      setSaving(true);
      
      if (editingService) {
        // Update existing service
        const response = await servicesAPI.update(editingService._id, formData);
        if (response.success) {
          setServices(services.map(s => s._id === editingService._id ? response.service : s));
          showMessage('Service updated successfully', true);
        }
      } else {
        // Create new service
        const response = await servicesAPI.create({
          ...formData,
          order: services.length + 1
        });
        if (response.success) {
          setServices([...services, response.service]);
          showMessage('Service added successfully', true);
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      showMessage('Failed to save service', false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon,
      isActive: service.isActive
    });
    setIsEditing(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      const response = await servicesAPI.delete(serviceId);
      if (response.success) {
        setServices(services.filter(s => s._id !== serviceId));
        showMessage('Service deleted successfully', true);
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      showMessage('Failed to delete service', false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const response = await servicesAPI.update(service._id, {
        isActive: !service.isActive
      });
      if (response.success) {
        setServices(services.map(s => s._id === service._id ? response.service : s));
        showMessage(`Service ${!service.isActive ? 'activated' : 'deactivated'} successfully`, true);
      }
    } catch (error) {
      console.error('Error toggling service:', error);
      showMessage('Failed to update service', false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: '🔧',
      isActive: true
    });
    setEditingService(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <FaSpinner className="animate-spin h-12 w-12 text-primary" />
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-primary">Services Management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage the services displayed on your homepage</p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center gap-2"
          >
            <FaPlus className="h-4 w-4" />
            Add Service
          </button>
        </div>

        {/* Status Message */}
        {status.show && (
          <div className={`mb-4 p-4 rounded-md flex items-center gap-3 ${
            status.success 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {status.success ? (
              <FaCheckCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <FaExclamationTriangle className="h-5 w-5 flex-shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Add/Edit Form */}
        {isEditing && (
          <div className="bg-gray-50 p-6 rounded-lg border mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="e.g., Custom Design"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {commonIcons.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon }))}
                        className={`p-2 rounded border text-xl ${
                          formData.icon === icon 
                            ? 'border-primary bg-primary/10' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    placeholder="Or enter custom emoji"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Describe the service..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (visible on website)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <FaSpinner className="animate-spin h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FaSave className="h-4 w-4" />
                      {editingService ? 'Update Service' : 'Add Service'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div 
              key={service._id} 
              className={`bg-white p-6 rounded-lg shadow-sm border ${
                !service.isActive ? 'opacity-60 border-gray-300' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{service.icon}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    service.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleToggleActive(service)}
                  className={`text-sm ${
                    service.isActive 
                      ? 'text-yellow-600 hover:text-yellow-700' 
                      : 'text-green-600 hover:text-green-700'
                  }`}
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <FaEdit className="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service._id)}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                  >
                    <FaTrash className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {services.length === 0 && !isEditing && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">No services found. Add your first service to get started.</p>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Add First Service
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ About Services</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Services are displayed on the homepage to showcase what you offer</li>
            <li>Active services are visible to visitors, inactive ones are hidden</li>
            <li>Use descriptive titles and clear descriptions for better engagement</li>
            <li>Choose relevant icons to make each service visually distinct</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminServices;

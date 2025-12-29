'use client';

import React, { useState, useEffect } from 'react';
import { getServices, saveServices } from '../../utils/storage';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

interface FormData {
  title: string;
  description: string;
  icon: string;
}

// Common icons for services
const COMMON_ICONS = ['🏠', '🔧', '🚚', '🛠️', '💼', '🏭', '⚡', '🎯', '📞', '💡', '🔒', '⭐'];

/**
 * ServicesManager - Admin component for managing services
 * 
 * Features:
 * - Add/Edit/Delete services
 * - Icon picker with common icons
 * - Local storage persistence
 * - Real-time preview
 */
const ServicesManager: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    icon: '🔧',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = () => {
    try {
      const loadedServices = getServices();
      setServices(loadedServices);
    } catch (err) {
      console.error('Error loading services:', err);
      setError('Failed to load services');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    try {
      let updatedServices: Service[];

      if (editingService) {
        // Update existing service
        updatedServices = services.map((service) =>
          service.id === editingService.id ? { ...service, ...formData } : service
        );
        setSuccess('Service updated successfully');
      } else {
        // Add new service
        const newService: Service = {
          id: `service${Date.now()}`,
          ...formData,
        };
        updatedServices = [...services, newService];
        setSuccess('Service added successfully');
      }

      saveServices(updatedServices);
      setServices(updatedServices);
      resetForm();
    } catch (err) {
      console.error('Error saving service:', err);
      setError('Failed to save service');
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      description: service.description,
      icon: service.icon,
    });
    setIsEditing(true);
  };

  const handleDelete = (serviceId: string) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        const updatedServices = services.filter((service) => service.id !== serviceId);
        saveServices(updatedServices);
        setServices(updatedServices);
        setSuccess('Service deleted successfully');
      } catch (err) {
        console.error('Error deleting service:', err);
        setError('Failed to delete service');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      icon: '🔧',
    });
    setEditingService(null);
    setIsEditing(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Services Management</h2>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Service
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Add/Edit Form */}
      {isEditing && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="e.g., Custom Design"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                <div className="flex gap-2 mb-2 flex-wrap">
                  {COMMON_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                      className={`p-2 rounded border ${
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
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="🔧"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Describe the service..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                {editingService ? 'Update Service' : 'Add Service'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
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
          <div key={service.id} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{service.icon}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(service)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
            <p className="text-gray-600 text-sm">{service.description}</p>
          </div>
        ))}
      </div>

      {services.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No services found. Add your first service to get started.</p>
        </div>
      )}
    </div>
  );
};

export default ServicesManager;

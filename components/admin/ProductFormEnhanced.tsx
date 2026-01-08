'use client';

import React, { useState, useEffect } from 'react';
import { productAPI, categoryAPI, subcategoryAPI, uploadAPI, Product, Category, Subcategory } from '@/services/api';
import { FaTimes, FaPlus, FaImage } from 'react-icons/fa';
import Image from 'next/image';

interface FormData {
  name: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  image: string;
  images: string[];
  imageFile: File | null;
  additionalImageFiles: (File | null)[];
  imagePreviews: {
    main: string;
    additional: string[];
  };
  features: string[];
  specifications: { label: string; value: string }[];
  deliveryInformation: {
    estimatedDelivery: string;
    shippingCost: string;
    availableLocations: string[];
    specialInstructions: string;
  };
  dimensions: { length: string; width: string; height: string };
  material: string;
  colors: string[];
  isAvailable: boolean;
  isMostSelling: boolean;
  isTopProduct: boolean;
  featured: boolean;
}

interface ProductFormEnhancedProps {
  product: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

const ProductFormEnhanced: React.FC<ProductFormEnhancedProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    categoryId: '',
    subcategoryId: '',
    description: '',
    image: '',
    images: [],
    imageFile: null,
    additionalImageFiles: [null, null, null],
    imagePreviews: { main: '', additional: ['', '', ''] },
    features: [],
    specifications: [],
    deliveryInformation: {
      estimatedDelivery: '7-10 business days',
      shippingCost: 'Free shipping',
      availableLocations: [],
      specialInstructions: ''
    },
    dimensions: { length: '', width: '', height: '' },
    material: '',
    colors: [],
    isAvailable: true,
    isMostSelling: false,
    isTopProduct: false,
    featured: false
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load categories and subcategories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, subcategoriesRes] = await Promise.all([
          categoryAPI.getAll(),
          subcategoryAPI.getAll()
        ]);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setSubcategories(Array.isArray(subcategoriesRes) ? subcategoriesRes : []);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
      }
    };
    loadData();
  }, []);

  // Filter subcategories when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subcategories.filter(sub => sub.categoryId === formData.categoryId);
      setFilteredSubcategories(filtered);
    } else {
      setFilteredSubcategories([]);
    }
  }, [formData.categoryId, subcategories]);

  // Initialize form with product data
  useEffect(() => {
    if (product) {
      // Extract proper category and subcategory IDs
      let categoryId = '';
      let subcategoryId = '';

      if (product.categoryId) {
        categoryId = typeof product.categoryId === 'object' ? (product.categoryId as { _id: string })._id : product.categoryId;
      } else if (product.category && typeof product.category === 'object') {
        categoryId = (product.category as { _id: string })._id;
      }

      if (product.subcategoryId) {
        subcategoryId = typeof product.subcategoryId === 'object' ? (product.subcategoryId as { _id: string })._id : product.subcategoryId;
      } else if (product.subcategory && typeof product.subcategory === 'object') {
        subcategoryId = (product.subcategory as { _id: string })._id;
      }

      const specs = product.specifications;
      let specificationsArray: { label: string; value: string }[] = [];
      if (Array.isArray(specs)) {
        specificationsArray = specs as { label: string; value: string }[];
      } else if (specs && typeof specs === 'object') {
        specificationsArray = Object.entries(specs).map(([label, value]) => ({ label, value: String(value) }));
      }

      const newFormData: FormData = {
        name: product.name || '',
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        description: product.description || '',
        image: product.image || '',
        images: Array.isArray(product.images) ? product.images : [],
        imageFile: null,
        additionalImageFiles: [null, null, null],
        imagePreviews: {
          main: product.image || '',
          additional: Array.isArray(product.images) ?
            [product.images[0] || '', product.images[1] || '', product.images[2] || ''] :
            ['', '', '']
        },
        features: product.features || [],
        specifications: specificationsArray,
        deliveryInformation: {
          estimatedDelivery: product.deliveryInformation?.estimatedDelivery || '7-10 business days',
          shippingCost: product.deliveryInformation?.shippingCost || 'Free shipping',
          availableLocations: product.deliveryInformation?.availableLocations || [],
          specialInstructions: product.deliveryInformation?.specialInstructions || ''
        },
        dimensions: {
          length: String(product.dimensions?.length || ''),
          width: String(product.dimensions?.width || ''),
          height: String(product.dimensions?.height || '')
        },
        material: product.material || '',
        colors: product.colors || [],
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
        isMostSelling: product.isMostSelling || false,
        isTopProduct: product.isTopProduct || false,
        featured: product.featured || false
      };

      setFormData(newFormData);
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...(prev[parent as keyof FormData] as Record<string, unknown>), [child]: value }
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      categoryId: e.target.value,
      subcategoryId: ''
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'additional', index: number | null = null) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (type === 'main') {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imagePreviews: { ...prev.imagePreviews, main: previewUrl }
      }));
    } else if (type === 'additional' && index !== null) {
      const newFiles = [...formData.additionalImageFiles];
      newFiles[index] = file;

      const newPreviews = [...formData.imagePreviews.additional];
      newPreviews[index] = previewUrl;

      setFormData(prev => ({
        ...prev,
        additionalImageFiles: newFiles,
        imagePreviews: { ...prev.imagePreviews, additional: newPreviews }
      }));
    }
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData(prev => ({ ...prev, features: updated }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { label: '', value: '' }]
    }));
  };

  const updateSpecification = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...formData.specifications];
    updated[index][field] = value;
    setFormData(prev => ({ ...prev, specifications: updated }));
  };

  const removeSpecification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index)
    }));
  };

  const handleDeliveryLocationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const locations = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({
      ...prev,
      deliveryInformation: { ...prev.deliveryInformation, availableLocations: locations }
    }));
  };

  const handleColorsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const colors = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, colors }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (!formData.name || !formData.description || !formData.categoryId) {
        setError('Please fill all required fields (Name, Description, and Category)');
        setIsLoading(false);
        return;
      }

      if (!product && !formData.imageFile && !formData.imagePreviews.main) {
        setError('At least one main image is required for new products.');
        setIsLoading(false);
        return;
      }

      const productData: Record<string, unknown> = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        features: formData.features.filter(f => f.trim() !== ''),
        specifications: formData.specifications.filter(s => s.label.trim() !== '' && s.value.trim() !== ''),
        deliveryInformation: formData.deliveryInformation,
        dimensions: formData.dimensions,
        material: formData.material,
        colors: formData.colors,
        isAvailable: formData.isAvailable,
        isMostSelling: formData.isMostSelling,
        isTopProduct: formData.isTopProduct,
        featured: formData.featured,
        image: formData.image || '',
        images: [] as string[]
      };

      // Upload images if provided
      if (formData.imageFile || formData.additionalImageFiles.some(file => file !== null)) {
        const uploadFormData = new FormData();

        if (formData.imageFile) {
          uploadFormData.append('images', formData.imageFile);
        }

        formData.additionalImageFiles.forEach((file) => {
          if (file) {
            uploadFormData.append('images', file);
          }
        });

        const uploadResponse = await uploadAPI.uploadImages(uploadFormData);
        const uploadedUrls = uploadResponse.urls || [];

        let urlIndex = 0;
        if (formData.imageFile && uploadedUrls[urlIndex]) {
          productData.image = uploadedUrls[urlIndex];
          urlIndex++;
        }

        const images: string[] = [];
        formData.additionalImageFiles.forEach((file) => {
          if (file && uploadedUrls[urlIndex]) {
            images.push(uploadedUrls[urlIndex]);
            urlIndex++;
          }
        });
        productData.images = images;
      } else if (product) {
        productData.image = formData.image;
        productData.images = Array.isArray(formData.images) ? formData.images : [];
      }

      if (product && product._id) {
        await productAPI.update(product._id, productData);
        setSuccess('Product updated successfully');
      } else {
        await productAPI.create(productData);
        setSuccess('Product created successfully');
      }

      setTimeout(() => onSave(), 1000);

    } catch (err) {
      console.error('Error saving product:', err);
      let errorMessage = 'Failed to save product';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleCategoryChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id || category.id} value={category._id || category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategory
              </label>
              <select
                name="subcategoryId"
                value={formData.subcategoryId || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!formData.categoryId || filteredSubcategories.length === 0}
              >
                <option value="">Select Subcategory</option>
                {filteredSubcategories.map((subcategory) => (
                  <option key={subcategory._id || subcategory.id} value={subcategory._id || subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Steel, Wood, etc."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required
              ></textarea>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Main Product Image *
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, 'main')}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2"
              />
              {formData.imagePreviews.main && (
                <div className="relative w-20 h-20">
                  <Image
                    src={formData.imagePreviews.main}
                    alt="Main preview"
                    fill
                    className="object-contain border rounded-md"
                    sizes="80px"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Images (up to 3)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'additional', index)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  {formData.imagePreviews.additional[index] && (
                    <div className="relative w-full h-32">
                      <Image
                        src={formData.imagePreviews.additional[index]}
                        alt={`Additional preview ${index + 1}`}
                        fill
                        className="object-contain border rounded-md"
                        sizes="(max-width: 768px) 100vw, 300px"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Features</h3>
          <div className="space-y-3">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter product feature"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <FaPlus className="h-5 w-5" />
              <span>Add Feature</span>
            </button>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Specifications</h3>
          <div className="space-y-3">
            {formData.specifications.map((spec, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={spec.label}
                  onChange={(e) => updateSpecification(index, 'label', e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Specification Label"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Specification Value"
                  />
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-2 text-red-600 hover:text-red-800"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecification}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <FaPlus className="h-5 w-5" />
              <span>Add Specification</span>
            </button>
          </div>
        </div>

        {/* Delivery Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Delivery Time
              </label>
              <input
                type="text"
                name="deliveryInformation.estimatedDelivery"
                value={formData.deliveryInformation.estimatedDelivery}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="7-10 business days"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Cost
              </label>
              <input
                type="text"
                name="deliveryInformation.shippingCost"
                value={formData.deliveryInformation.shippingCost}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Free shipping"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Delivery Locations
              </label>
              <input
                type="text"
                value={formData.deliveryInformation.availableLocations.join(', ')}
                onChange={handleDeliveryLocationsChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Mumbai, Delhi, Bangalore (comma-separated)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Delivery Instructions
              </label>
              <textarea
                name="deliveryInformation.specialInstructions"
                value={formData.deliveryInformation.specialInstructions}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Assembly required, fragile item, etc."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dimensions (cm)
              </label>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number"
                  name="dimensions.length"
                  value={formData.dimensions.length}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Length"
                  min="0"
                />
                <input
                  type="number"
                  name="dimensions.width"
                  value={formData.dimensions.width}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Width"
                  min="0"
                />
                <input
                  type="number"
                  name="dimensions.height"
                  value={formData.dimensions.height}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Height"
                  min="0"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Colors
              </label>
              <input
                type="text"
                value={formData.colors.join(', ')}
                onChange={handleColorsChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Red, Blue, Black, White (comma-separated)"
              />
            </div>
          </div>
        </div>

        {/* Homepage Display Settings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Homepage Display Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="featured" className="text-sm text-gray-700">
                Featured Product
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isMostSelling"
                name="isMostSelling"
                checked={formData.isMostSelling}
                onChange={handleInputChange}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isMostSelling" className="text-sm text-gray-700">
                Most Selling Product
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isTopProduct"
                name="isTopProduct"
                checked={formData.isTopProduct}
                onChange={handleInputChange}
                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isTopProduct" className="text-sm text-gray-700">
                Top Product
              </label>
            </div>
          </div>
        </div>

        {/* Product Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleInputChange}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAvailable" className="text-sm text-gray-700">
              Product is Available
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormEnhanced;

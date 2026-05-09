'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { productAPI, categoryAPI, subcategoryAPI, uploadAPI, Product, Category, Subcategory } from '@/services/api';
import {
  FaBoxOpen,
  FaCamera,
  FaCheck,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaSync,
  FaCubes,
  FaFileAlt,
  FaImage,
  FaInfoCircle,
  FaIndustry,
  FaLayerGroup,
  FaPaintBrush,
  FaPlus,
  FaRulerCombined,
  FaSave,
  FaStar,
  FaTags,
  FaTimes
} from 'react-icons/fa';
import Image from 'next/image';

interface ManufacturerDetails {
  name: string;
  address: string;
  email: string;
  countryOfOrigin: string;
}

interface ProductColorVariant {
  label: string;
  hex: string;
  productId: string;
  image: string;
}

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
  specifications: {
    material: string;
    dimensions: string;
    guarantee: string;
    modelType: string;
    modelWidth: string;
    hangers: string;
    noOfDoors: string;
    typeOfPaint: string;
    brand: string;
  };
  dimensions: { length: string; width: string; height: string };
  material: string;
  colorName: string;
  colorHex: string;
  colors: string[];
  colorVariants: ProductColorVariant[];
  isAvailable: boolean;
  isMostSelling: boolean;
  isTopProduct: boolean;
  featured: boolean;
  manufacturerDetails: ManufacturerDetails;
}

interface ProductFormEnhancedProps {
  product: Product | null;
  onSave: () => void;
  onCancel: () => void;
}

const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';
const labelClass = 'mb-1.5 block text-sm font-semibold text-slate-700';

const defaultManufacturerDetails: ManufacturerDetails = {
  name: 'Shree Manish Steel Furniture Udhyog',
  address: 'Biratnagar, Morang',
  email: 'shreemanishfurniture@gmail.com',
  countryOfOrigin: 'Nepal'
};

const normalizeManufacturerDetails = (details: Product['manufacturerDetails']): ManufacturerDetails => {
  if (!details) {
    return defaultManufacturerDetails;
  }

  if (typeof details === 'string') {
    const trimmed = details.trim();

    if (!trimmed) {
      return defaultManufacturerDetails;
    }

    try {
      const parsed = JSON.parse(trimmed) as Partial<ManufacturerDetails>;
      return {
        ...defaultManufacturerDetails,
        ...parsed
      };
    } catch {
      return {
        ...defaultManufacturerDetails,
        name: trimmed
      };
    }
  }

  return {
    ...defaultManufacturerDetails,
    ...details
  };
};

interface FormSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({ title, icon, children, className = '' }) => (
  <section className={`overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
    <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
        {icon}
      </span>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
    </div>
    <div className="p-5">
      {children}
    </div>
  </section>
);

interface ToggleCardProps {
  id: string;
  name: keyof FormData;
  checked: boolean;
  title: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ToggleCard: React.FC<ToggleCardProps> = ({ id, name, checked, title, icon, onChange }) => (
  <label
    htmlFor={id}
    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition ${checked
      ? 'border-primary bg-primary-light text-primary shadow-sm'
      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
      }`}
  >
    <input
      type="checkbox"
      id={id}
      name={name}
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${checked ? 'bg-white text-primary' : 'bg-slate-100 text-slate-500'}`}>
      {checked ? <FaCheck className="h-4 w-4" /> : icon}
    </span>
    <span className="text-sm font-semibold">{title}</span>
  </label>
);

const ProductFormEnhanced: React.FC<ProductFormEnhancedProps> = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    categoryId: '',
    subcategoryId: '',
    description: '',
    image: '',
    images: [],
    imageFile: null,
    additionalImageFiles: [null, null, null, null, null, null],
    imagePreviews: { main: '', additional: ['', '', '', '', '', ''] },
    features: [],
    specifications: {
      material: '',
      dimensions: '',
      guarantee: '',
      modelType: '',
      modelWidth: '',
      hangers: '',
      noOfDoors: '',
      typeOfPaint: '',
      brand: ''
    },
    dimensions: { length: '', width: '', height: '' },
    material: '',
    colorName: '',
    colorHex: '',
    colors: [],
    colorVariants: [],
    isAvailable: true,
    isMostSelling: false,
    isTopProduct: false,
    featured: false,
    manufacturerDetails: defaultManufacturerDetails
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [backlinkMap, setBacklinkMap] = useState<Record<string, boolean>>({});
  const [isSyncingVariants, setIsSyncingVariants] = useState(false);
  const [filteredSubcategories, setFilteredSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load categories and subcategories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesRes, subcategoriesRes, productsRes] = await Promise.all([
          categoryAPI.getAll(),
          subcategoryAPI.getAll(),
          productAPI.getAll(1, 500)
        ]);
        setCategories(Array.isArray(categoriesRes) ? categoriesRes : []);
        setSubcategories(Array.isArray(subcategoriesRes) ? subcategoriesRes : []);
        setAllProducts(Array.isArray(productsRes?.products) ? productsRes.products : []);
      } catch (err) {
        console.error('Error loading categories:', err);
        setError('Failed to load categories');
      }
    };
    loadData();
  }, []);

  // Check backlinks for linked variant product pages
  const checkBacklinks = useCallback(async () => {
    if (!product || !product._id) return;
    const map: Record<string, boolean> = {};

    const idsToCheck = formData.colorVariants
      .map(v => v.productId)
      .filter(Boolean) as string[];

    await Promise.all(idsToCheck.map(async (pid) => {
      try {
        const target = await productAPI.getById(pid);
        const hasBacklink = Array.isArray(target.colorVariants) && target.colorVariants.some((cv: any) => {
          const cvId = (cv.productId && (cv.productId._id || cv.productId)) || cv.productId;
          return String(cvId) === String(product._id);
        });
        map[pid] = !!hasBacklink;
      } catch (e) {
        map[pid] = false;
      }
    }));

    setBacklinkMap(map);
  }, [formData.colorVariants, product]);

  useEffect(() => {
    checkBacklinks();
  }, [checkBacklinks]);

  const ensureBidirectionalLinks = async () => {
    if (!product || !product._id) return;
    setIsSyncingVariants(true);
    try {
      const cleanColorVariants = formData.colorVariants
        .map((variant) => ({
          label: variant.label.trim(),
          hex: variant.hex.trim(),
          productId: variant.productId.trim() || undefined,
          image: variant.image.trim()
        }))
        .filter(Boolean);

      // Trigger the API sync by updating this product's colorVariants (server will sync bidirectionally)
      await productAPI.update(product._id, { colorVariants: cleanColorVariants });

      // Refresh backlink checks
      await checkBacklinks();
      setSuccess('Variant links synchronized successfully');
    } catch (e) {
      console.error(e);
      setError('Failed to sync variant links');
    } finally {
      setIsSyncingVariants(false);
    }
  };

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
      const specificationsData = {
        material: specs?.material || '',
        dimensions: specs?.dimensions || '',
        guarantee: specs?.guarantee || '',
        modelType: specs?.modelType || '',
        modelWidth: specs?.modelWidth || '',
        hangers: specs?.hangers || '',
        noOfDoors: specs?.noOfDoors || '',
        typeOfPaint: specs?.typeOfPaint || '',
        brand: specs?.brand || ''
      };

      const newFormData: FormData = {
        name: product.name || '',
        categoryId: categoryId,
        subcategoryId: subcategoryId,
        description: product.description || '',
        image: product.image || '',
        images: Array.isArray(product.images) ? product.images : [],
        imageFile: null,
        additionalImageFiles: [null, null, null, null, null, null],
        imagePreviews: {
          main: product.image || '',
          additional: Array.isArray(product.images) ?
            [product.images[0] || '', product.images[1] || '', product.images[2] || '', product.images[3] || '', product.images[4] || '', product.images[5] || ''] :
            ['', '', '', '', '', '']
        },
        features: product.features || [],
        specifications: specificationsData,
        dimensions: {
          length: String(product.dimensions?.length || ''),
          width: String(product.dimensions?.width || ''),
          height: String(product.dimensions?.height || '')
        },
        material: product.material || '',
        colorName: product.colorName || '',
        colorHex: product.colorHex || '',
        colors: Array.isArray(product.colors) ? product.colors : [],
        colorVariants: Array.isArray(product.colorVariants)
          ? product.colorVariants.map((variant) => ({
            label: variant.label || '',
            hex: variant.hex || '',
            productId: typeof variant.productId === 'object' && variant.productId
              ? variant.productId._id
              : variant.productId || '',
            image: variant.image || ''
          }))
          : [],
        isAvailable: product.isAvailable !== undefined ? product.isAvailable : true,
        isMostSelling: product.isMostSelling || false,
        isTopProduct: product.isTopProduct || false,
        featured: product.featured || false,
        manufacturerDetails: normalizeManufacturerDetails(product.manufacturerDetails)
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

  const removeMainImage = () => {
    setFormData(prev => ({
      ...prev,
      image: '',
      imageFile: null,
      imagePreviews: { ...prev.imagePreviews, main: '' }
    }));
  };

  const removeAdditionalImage = (index: number) => {
    setFormData(prev => {
      const additionalImageFiles = [...prev.additionalImageFiles];
      const additionalPreviews = [...prev.imagePreviews.additional];
      const images = [...prev.images];

      additionalImageFiles[index] = null;
      additionalPreviews[index] = '';
      images[index] = '';

      return {
        ...prev,
        images,
        additionalImageFiles,
        imagePreviews: { ...prev.imagePreviews, additional: additionalPreviews }
      };
    });
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

  const addColorVariant = () => {
    setFormData(prev => ({
      ...prev,
      colorVariants: [...prev.colorVariants, { label: '', hex: '', productId: '', image: '' }]
    }));
  };

  const updateColorVariant = (index: number, field: keyof ProductColorVariant, value: string) => {
    setFormData(prev => {
      const colorVariants = [...prev.colorVariants];
      colorVariants[index] = {
        ...colorVariants[index],
        [field]: value
      };
      return { ...prev, colorVariants };
    });
  };

  const handleVariantProductSelect = (index: number, selectedProductId: string) => {
    setFormData(prev => {
      const colorVariants = [...prev.colorVariants];
      const selectedProduct = allProducts.find((item) => (item._id || item.id) === selectedProductId);

      if (!colorVariants[index]) {
        return prev;
      }

      colorVariants[index] = {
        ...colorVariants[index],
        productId: selectedProductId,
        label: selectedProductId
          ? (selectedProduct?.colorName?.trim() || selectedProduct?.name || colorVariants[index].label)
          : colorVariants[index].label,
        hex: selectedProductId
          ? (selectedProduct?.colorHex?.trim() || colorVariants[index].hex)
          : colorVariants[index].hex
      };

      return { ...prev, colorVariants };
    });
  };

  const removeColorVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colorVariants: prev.colorVariants.filter((_, i) => i !== index)
    }));
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

      const cleanColorVariants = formData.colorVariants
        .map((variant) => ({
          label: variant.label.trim(),
          hex: variant.hex.trim(),
          productId: variant.productId.trim() || undefined,
          image: variant.image.trim()
        }))
        .filter((variant) => variant.label);

      const colorNames = Array.from(new Set([
        formData.colorName.trim(),
        ...formData.colors.map((color) => color.trim()),
        ...cleanColorVariants.map((variant) => variant.label)
      ].filter(Boolean)));

      const productData: Record<string, unknown> = {
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        features: formData.features.filter(f => f.trim() !== ''),
        specifications: formData.specifications,
        dimensions: formData.dimensions,
        material: formData.material,
        colors: colorNames,
        colorName: formData.colorName.trim(),
        colorHex: formData.colorHex.trim(),
        colorVariants: cleanColorVariants,
        isAvailable: formData.isAvailable,
        isMostSelling: formData.isMostSelling,
        isTopProduct: formData.isTopProduct,
        featured: formData.featured,
        manufacturerDetails: formData.manufacturerDetails,
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
        } else {
          productData.image = formData.imagePreviews.main || formData.image || '';
        }

        const images = formData.imagePreviews.additional.map((preview, index) => {
          const file = formData.additionalImageFiles[index];
          if (file && uploadedUrls[urlIndex]) {
            const uploadedUrl = uploadedUrls[urlIndex];
            urlIndex++;
            return uploadedUrl;
          }
          return preview || formData.images[index] || '';
        }).filter(Boolean);
        productData.images = images;
      } else if (product) {
        productData.image = formData.imagePreviews.main || formData.image;
        productData.images = formData.imagePreviews.additional.filter(Boolean);
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

  const selectedCategory = categories.find(category => (category._id || category.id) === formData.categoryId);
  const selectedSubcategory = filteredSubcategories.find(subcategory => (subcategory._id || subcategory.id) === formData.subcategoryId);
  const selectableProducts = allProducts.filter((item) => (item._id || item.id) !== product?._id);
  const visibleBadges = [
    formData.colorName ? formData.colorName : '',
    formData.featured ? 'Featured' : '',
    formData.isMostSelling ? 'Most Selling' : '',
    formData.isTopProduct ? 'Top Product' : '',
    formData.isAvailable ? 'Available' : 'Hidden'
  ].filter(Boolean);

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50">
      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <FaInfoCircle className="mt-0.5 h-4 w-4 flex-none" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <FaCheckCircle className="mt-0.5 h-4 w-4 flex-none" />
              {success}
            </div>
          )}

          <FormSection title="Basic Information" icon={<FaFileAlt className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Category *</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleCategoryChange}
                  className={inputClass}
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
                <label className={labelClass}>Subcategory</label>
                <select
                  name="subcategoryId"
                  value={formData.subcategoryId || ''}
                  onChange={handleInputChange}
                  className={inputClass}
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
                <label className={labelClass}>Material</label>
                <input
                  type="text"
                  name="material"
                  value={formData.material}
                  onChange={handleInputChange}
                  className={inputClass}
                  placeholder="Steel, Wood, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Product Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className={`${inputClass} min-h-32 resize-y`}
                  rows={5}
                  required
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Color Variants" icon={<FaPaintBrush className="h-4 w-4" />}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
                <div>
                  <label className={labelClass}>Current Product Color</label>
                  <input
                    type="text"
                    name="colorName"
                    value={formData.colorName}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="e.g. Silver, Coffee, Maroon"
                  />
                </div>
                <div>
                  <label className={labelClass}>Color Swatch</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={/^#[0-9A-Fa-f]{6}$/.test(formData.colorHex) ? formData.colorHex : '#0057A3'}
                      onChange={(e) => setFormData(prev => ({ ...prev, colorHex: e.target.value }))}
                      className="h-11 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                      aria-label="Current color swatch"
                    />
                    <input
                      type="text"
                      name="colorHex"
                      value={formData.colorHex}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="#c0c0c0"
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Linked Color Pages</h4>
                    <p className="mt-1 text-xs text-slate-500">Create each color as a separate product, then choose its matching product page here.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={addColorVariant}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/20 bg-white px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                    >
                      <FaPlus className="h-3.5 w-3.5" />
                      Add Color
                    </button>

                    <button
                      type="button"
                      onClick={ensureBidirectionalLinks}
                      disabled={isSyncingVariants || !product?._id}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-50 disabled:opacity-60"
                    >
                      <FaSync className="h-3.5 w-3.5" />
                      {isSyncingVariants ? 'Synchronizing...' : 'Ensure bidirectional links'}
                    </button>
                  </div>
                </div>

                {formData.colorVariants.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-5 text-center text-sm text-slate-500">
                    No linked colors yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.colorVariants.map((variant, index) => (
                      <div key={index} className="rounded-lg border border-slate-200 bg-white p-3">
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_120px_minmax(0,1.2fr)_40px]">
                          <input
                            type="text"
                            value={variant.label}
                            onChange={(e) => updateColorVariant(index, 'label', e.target.value)}
                            className={inputClass}
                            placeholder="Color name"
                            aria-label="Variant color name"
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={/^#[0-9A-Fa-f]{6}$/.test(variant.hex) ? variant.hex : '#0057A3'}
                              onChange={(e) => updateColorVariant(index, 'hex', e.target.value)}
                              className="h-11 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
                              aria-label="Variant color swatch"
                            />
                          </div>
                          <select
                            value={variant.productId}
                            onChange={(e) => handleVariantProductSelect(index, e.target.value)}
                            className={inputClass}
                            aria-label="Linked product page"
                          >
                            <option value="">Select product page</option>
                            {variant.productId && !selectableProducts.some((item) => (item._id || item.id) === variant.productId) && (
                              <option value={variant.productId}>Linked product</option>
                            )}
                            {selectableProducts.map((item) => (
                              <option key={item._id || item.id} value={item._id || item.id}>
                                {item.colorName ? `${item.name} - ${item.colorName}` : item.name}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2">
                            {variant.productId ? (
                              backlinkMap[variant.productId] ? (
                                <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                                  <FaCheck className="h-3 w-3" />
                                  Linked both ways
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 rounded-full bg-yellow-50 px-2 py-1 text-xs font-semibold text-yellow-700">
                                  <FaInfoCircle className="h-3 w-3" />
                                  Missing backlink
                                </span>
                              )
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeColorVariant(index)}
                            className="flex h-11 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                            aria-label="Remove color variant"
                          >
                            <FaTimes className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={variant.image}
                          onChange={(e) => updateColorVariant(index, 'image', e.target.value)}
                          className={`${inputClass} mt-3`}
                          placeholder="Optional swatch image URL"
                          aria-label="Variant swatch image URL"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </FormSection>

          <FormSection title="Product Images" icon={<FaImage className="h-4 w-4" />}>
            <div className="space-y-5">
              <div>
                <label className={labelClass}>Main Product Image *</label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_minmax(0,1fr)]">
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {formData.imagePreviews.main ? (
                      <>
                        <Image
                          src={formData.imagePreviews.main}
                          alt="Main preview"
                          fill
                          className="object-contain p-2"
                          sizes="180px"
                        />
                        <button
                          type="button"
                          onClick={removeMainImage}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                          aria-label="Remove main image"
                        >
                          <FaTimes className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <FaCamera className="h-9 w-9 text-slate-400" />
                    )}
                  </div>
                  <label
                    htmlFor="main-product-image"
                    className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-5 py-6 text-center transition hover:border-primary hover:bg-primary-light/40"
                  >
                    <FaCloudUploadAlt className="mb-3 h-9 w-9 text-primary" />
                    <span className="text-sm font-semibold text-slate-900">Choose main image</span>
                    <span className="mt-1 text-xs text-slate-500">JPG, PNG, or WEBP</span>
                    <input
                      id="main-product-image"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'main')}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className={labelClass}>Additional Images</label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                      <div className="relative flex h-36 items-center justify-center bg-slate-100">
                        {formData.imagePreviews.additional[index] ? (
                          <>
                            <Image
                              src={formData.imagePreviews.additional[index]}
                              alt={`Additional preview ${index + 1}`}
                              fill
                              className="object-contain p-2"
                              sizes="(max-width: 768px) 100vw, 240px"
                            />
                            <button
                              type="button"
                              onClick={() => removeAdditionalImage(index)}
                              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/95 text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-600"
                              aria-label={`Remove additional image ${index + 1}`}
                            >
                              <FaTimes className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <FaImage className="h-7 w-7 text-slate-400" />
                        )}
                      </div>
                      <label
                        htmlFor={`additional-product-image-${index}`}
                        className="flex cursor-pointer items-center justify-center gap-2 border-t border-slate-200 px-3 py-3 text-sm font-semibold text-primary transition hover:bg-primary-light"
                      >
                        <FaCloudUploadAlt className="h-4 w-4" />
                        Choose Image
                        <input
                          id={`additional-product-image-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'additional', index)}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Product Features" icon={<FaTags className="h-4 w-4" />}>
            <div className="space-y-3">
              {formData.features.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                  No features added yet.
                </div>
              )}

              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className={inputClass}
                    placeholder="Enter product feature"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                    aria-label="Remove feature"
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addFeature}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary-light px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
              >
                <FaPlus className="h-4 w-4" />
                Add Feature
              </button>
            </div>
          </FormSection>

          <FormSection title="Product Specifications" icon={<FaCubes className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Material</label>
                <input type="text" name="specifications.material" value={formData.specifications.material} onChange={handleInputChange} className={inputClass} placeholder="e.g. C.R. SHEET" />
              </div>
              <div>
                <label className={labelClass}>Dimension (MM)</label>
                <input type="text" name="specifications.dimensions" value={formData.specifications.dimensions} onChange={handleInputChange} className={inputClass} placeholder="e.g. 1630x915x530" />
              </div>
              <div>
                <label className={labelClass}>Guarantee</label>
                <input type="text" name="specifications.guarantee" value={formData.specifications.guarantee} onChange={handleInputChange} className={inputClass} placeholder="e.g. 10 Years on Paint & Locks" />
              </div>
              <div>
                <label className={labelClass}>Model Type</label>
                <input type="text" name="specifications.modelType" value={formData.specifications.modelType} onChange={handleInputChange} className={inputClass} placeholder="e.g. OFFICE MODEL" />
              </div>
              <div>
                <label className={labelClass}>Model Width</label>
                <input type="text" name="specifications.modelWidth" value={formData.specifications.modelWidth} onChange={handleInputChange} className={inputClass} placeholder="e.g. 36" />
              </div>
              <div>
                <label className={labelClass}>Hangers</label>
                <input type="text" name="specifications.hangers" value={formData.specifications.hangers} onChange={handleInputChange} className={inputClass} placeholder="e.g. NO HANGERS" />
              </div>
              <div>
                <label className={labelClass}>No. of Doors</label>
                <input type="text" name="specifications.noOfDoors" value={formData.specifications.noOfDoors} onChange={handleInputChange} className={inputClass} placeholder="e.g. 2" />
              </div>
              <div>
                <label className={labelClass}>Type of Paint</label>
                <input type="text" name="specifications.typeOfPaint" value={formData.specifications.typeOfPaint} onChange={handleInputChange} className={inputClass} placeholder="e.g. Powder Coated" />
              </div>
              <div>
                <label className={labelClass}>Brand</label>
                <input type="text" name="specifications.brand" value={formData.specifications.brand} onChange={handleInputChange} className={inputClass} placeholder="e.g. Shree Manish Steel" />
              </div>
            </div>
          </FormSection>

          <FormSection title="Card Dimensions" icon={<FaRulerCombined className="h-4 w-4" />}>
            <div>
              <label className={labelClass}>Dimensions shown on product cards (mm)</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <input type="number" name="dimensions.length" value={formData.dimensions.length} onChange={handleInputChange} className={inputClass} placeholder="Length" min="0" />
                <input type="number" name="dimensions.width" value={formData.dimensions.width} onChange={handleInputChange} className={inputClass} placeholder="Width" min="0" />
                <input type="number" name="dimensions.height" value={formData.dimensions.height} onChange={handleInputChange} className={inputClass} placeholder="Height" min="0" />
              </div>
            </div>
          </FormSection>

          <FormSection title="Manufacturer Details" icon={<FaIndustry className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  name="manufacturerDetails.name"
                  value={formData.manufacturerDetails.name}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input
                  type="text"
                  name="manufacturerDetails.address"
                  value={formData.manufacturerDetails.address}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  name="manufacturerDetails.email"
                  value={formData.manufacturerDetails.email}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Country of Origin</label>
                <input
                  type="text"
                  name="manufacturerDetails.countryOfOrigin"
                  value={formData.manufacturerDetails.countryOfOrigin}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
            </div>
          </FormSection>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="relative flex aspect-[4/3] items-center justify-center bg-slate-100">
              {formData.imagePreviews.main ? (
                <Image
                  src={formData.imagePreviews.main}
                  alt={formData.name || 'Product preview'}
                  fill
                  className="object-contain p-4"
                  sizes="320px"
                />
              ) : (
                <FaBoxOpen className="h-12 w-12 text-slate-400" />
              )}
            </div>
            <div className="space-y-4 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Preview</p>
                <h3 className="mt-1 line-clamp-2 text-lg font-bold text-slate-900">
                  {formData.name || 'Untitled product'}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {[selectedCategory?.name, selectedSubcategory?.name].filter(Boolean).join(' / ') || 'No category selected'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleBadges.map((badge) => (
                  <span key={badge} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <FormSection title="Display Settings" icon={<FaLayerGroup className="h-4 w-4" />}>
            <div className="space-y-3">
              <ToggleCard id="featured" name="featured" checked={formData.featured} title="Featured Product" icon={<FaStar className="h-4 w-4" />} onChange={handleInputChange} />
              <ToggleCard id="isMostSelling" name="isMostSelling" checked={formData.isMostSelling} title="Most Selling Product" icon={<FaTags className="h-4 w-4" />} onChange={handleInputChange} />
              <ToggleCard id="isTopProduct" name="isTopProduct" checked={formData.isTopProduct} title="Top Product" icon={<FaCheckCircle className="h-4 w-4" />} onChange={handleInputChange} />
              <ToggleCard id="isAvailable" name="isAvailable" checked={formData.isAvailable} title="Product Available" icon={<FaPaintBrush className="h-4 w-4" />} onChange={handleInputChange} />
            </div>
          </FormSection>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.08)] backdrop-blur sm:px-6">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FaSave className="h-4 w-4" />
            {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
          </button>
        </div>
      </div>
    </form>
  );
};

export default ProductFormEnhanced;

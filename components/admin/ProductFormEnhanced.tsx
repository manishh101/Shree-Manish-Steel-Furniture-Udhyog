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
  FaTimes,
  FaSearch,
  FaMagic,
  FaEye,
  FaQuestionCircle
} from 'react-icons/fa';
import { urlManager } from '@/lib/seo/urlManager';
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

interface DualKeywordPair {
  formal: string;
  colloquial: string;
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
  faqs: { question: string; answer: string; }[];
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
  
  // SEO Fields
  slug: string;
  metaTitle: string;
  metaDescription: string;
  focusKeywords: string[];
  dualKeywords: DualKeywordPair[];
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

// Build product-specific default FAQs
const buildProductFAQs = (prod: Partial<Product>): { question: string, answer: string }[] => {
  const name = prod.name || 'this furniture';
  const cat = typeof prod.category === 'string' ? prod.category : ((prod.category as any)?.name || 'furniture');
  const price = prod.price ? `Rs. ${prod.price.toLocaleString()}` : 'competitive prices';
  const deliveryLocations =
    prod.deliveryInformation?.availableLocations?.join(', ') ||
    'Biratnagar, Dharan, Itahari and nearby areas';

  return [
    {
      question: `What is the price of ${name}?`,
      answer: `The ${name} is available at ${price}. Prices may vary based on size, color, and customization. For bulk orders or special discounts, contact us via WhatsApp at +977 9824336371.`,
    },
    {
      question: `Is free delivery available for this ${cat}?`,
      answer: `Yes! Free home delivery is available in ${deliveryLocations}. Our team will also provide free installation and setup at your location.`,
    },
    {
      question: `What warranty is offered on the ${name}?`,
      answer: `All our steel furniture — including this ${name} — comes with a 10-year structural warranty. We guarantee the powder-coat paint finish and locking mechanism. Contact us if any issue arises.`,
    },
    {
      question: `Can I get a custom size for this ${cat}?`,
      answer: `Yes, we manufacture custom-sized steel furniture to your exact specifications. Visit our Biratnagar showroom or send your requirements via WhatsApp for a custom quote.`,
    },
    {
      question: `What payment options are available?`,
      answer: `We accept Cash, eSewa, Khalti, and bank transfer. For institutional or bulk orders, invoice-based payment is available.`,
    },
  ];
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

const tabs = [
  { id: 'general', label: 'General Info', icon: <FaFileAlt className="h-4 w-4" /> },
  { id: 'media', label: 'Media & Colors', icon: <FaImage className="h-4 w-4" /> },
  { id: 'specs', label: 'Specs & FAQ', icon: <FaCubes className="h-4 w-4" /> },
  { id: 'seo', label: 'SEO Settings', icon: <FaSearch className="h-4 w-4" /> },
] as const;

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
    faqs: [],
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
    manufacturerDetails: defaultManufacturerDetails,
    
    // SEO Fields
    slug: '',
    metaTitle: '',
    metaDescription: '',
    focusKeywords: [],
    dualKeywords: []
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
  const [keywordInput, setKeywordInput] = useState('');
  const [showSEOPreview, setShowSEOPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'specs' | 'seo'>('general');

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
        faqs: product.faqs && product.faqs.length > 0 ? product.faqs : buildProductFAQs(product),
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
        manufacturerDetails: normalizeManufacturerDetails(product.manufacturerDetails),
        
        // SEO Fields
        slug: product.slug || '',
        metaTitle: product.metaTitle || '',
        metaDescription: product.metaDescription || '',
        focusKeywords: Array.isArray(product.focusKeywords) ? product.focusKeywords : [],
        dualKeywords: Array.isArray(product.dualKeywords) ? (product.dualKeywords as any) : []
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

  const addFaq = () => {
    setFormData(prev => ({ ...prev, faqs: [...prev.faqs, { question: '', answer: '' }] }));
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const updated = [...formData.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, faqs: updated }));
  };

  const removeFaq = (index: number) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
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

  // SEO Helper Functions
  const generateSlugFromName = () => {
    if (!formData.name) return;
    
    const categoryName = selectedCategory?.name || selectedSubcategory?.name || '';
    const generatedSlug = urlManager.generateSlug(formData.name, {
      includeCategory: false,
      includeLocation: true,
      includeDualKeyword: true,
      categoryName: categoryName
    });
    
    setFormData(prev => ({ ...prev, slug: generatedSlug }));
  };

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    
    if (!formData.focusKeywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        focusKeywords: [...prev.focusKeywords, keywordInput.trim()]
      }));
    }
    
    setKeywordInput('');
  };

  const removeKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      focusKeywords: prev.focusKeywords.filter((_, i) => i !== index)
    }));
  };

  const addDualKeyword = () => {
    setFormData(prev => ({
      ...prev,
      dualKeywords: [...prev.dualKeywords, { formal: '', colloquial: '' }]
    }));
  };

  const updateDualKeyword = (index: number, field: 'formal' | 'colloquial', value: string) => {
    setFormData(prev => {
      const dualKeywords = [...prev.dualKeywords];
      dualKeywords[index] = { ...dualKeywords[index], [field]: value };
      return { ...prev, dualKeywords };
    });
  };

  const removeDualKeyword = (index: number) => {
    setFormData(prev => ({
      ...prev,
      dualKeywords: prev.dualKeywords.filter((_, i) => i !== index)
    }));
  };

  const getMetaTitleLength = () => formData.metaTitle.length;
  const getMetaDescriptionLength = () => formData.metaDescription.length;
  
  const getTitleColor = () => {
    const length = getMetaTitleLength();
    if (length === 0) return 'text-slate-500';
    if (length < 50) return 'text-orange-600';
    if (length > 60) return 'text-red-600';
    return 'text-green-600';
  };
  
  const getDescriptionColor = () => {
    const length = getMetaDescriptionLength();
    if (length === 0) return 'text-slate-500';
    if (length < 140) return 'text-orange-600';
    if (length > 160) return 'text-red-600';
    return 'text-green-600';
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
        faqs: formData.faqs.filter(f => f.question.trim() !== '' && f.answer.trim() !== ''),
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
        images: [] as string[],
        
        // SEO Fields
        slug: formData.slug.trim() || undefined,
        metaTitle: formData.metaTitle.trim() || undefined,
        metaDescription: formData.metaDescription.trim() || undefined,
        focusKeywords: formData.focusKeywords.filter(k => k.trim() !== ''),
        dualKeywords: formData.dualKeywords.filter(dk => dk.formal.trim() && dk.colloquial.trim())
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
    <form onSubmit={handleSubmit} className="bg-slate-50 min-h-full">
      <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          {/* Tab Navigation - Improved */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto">
              {tabs.map((tab, idx) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex flex-1 min-w-[120px] items-center justify-center gap-2 px-3 sm:px-4 py-3.5 text-xs sm:text-sm font-semibold transition-all duration-200 border-b-2 ${
                      isActive
                        ? 'border-primary text-primary bg-primary/5'
                        : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <span className={isActive ? 'text-primary' : 'text-slate-400'}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm font-medium text-red-700 shadow-sm">
              <FaInfoCircle className="mt-0.5 h-4 w-4 flex-none text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3.5 text-sm font-medium text-green-700 shadow-sm">
              <FaCheckCircle className="mt-0.5 h-4 w-4 flex-none text-green-500" />
              <span>{success}</span>
            </div>
          )}

          {activeTab === 'general' && (
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
          )}

          {activeTab === 'seo' && (
            <FormSection title="SEO Optimization" icon={<FaSearch className="h-4 w-4" />}>
              <div className="space-y-5">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <label className={labelClass}>URL Slug</label>
                    <button
                      type="button"
                      onClick={generateSlugFromName}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                    >
                      <FaMagic className="h-3 w-3" />
                      Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="product-name-biratnagar"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">SEO-friendly URL. Use lowercase letters, numbers, and hyphens only.</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className={labelClass}>Meta Title</label>
                    <span className={`text-xs font-semibold ${formData.metaTitle.length > 60 ? 'text-red-500' : 'text-slate-500'}`}>
                      {formData.metaTitle.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="Steel Almirah 72 Inch - Premium Daraj | Biratnagar"
                  />
                  <p className="mt-1.5 text-xs text-slate-500">Optimal: 50-60 characters. This appears as the page title in search results.</p>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className={labelClass}>Meta Description</label>
                    <span className={`text-xs font-semibold ${formData.metaDescription.length > 160 ? 'text-red-500' : 'text-slate-500'}`}>
                      {formData.metaDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    className={`${inputClass} min-h-20`}
                    placeholder="Premium steel almirah (daraj) 72 inch with 10-year warranty. Free delivery in Biratnagar, Dharan, Itahari. Buy quality furniture Nepal."
                    rows={3}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">Optimal: 140-160 characters. This appears below the title in search results.</p>
                </div>

                <div>
                  <label className={labelClass}>Focus Keywords</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                      className={inputClass}
                      placeholder="Type keyword and press Enter"
                    />
                    <button
                      type="button"
                      onClick={addKeyword}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm transition hover:bg-primary-dark"
                    >
                      <FaPlus className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">Primary keywords for this product (e.g., &quot;steel almirah&quot;, &quot;storage furniture&quot;)</p>
                  
                  {formData.focusKeywords.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {formData.focusKeywords.map((kw, i) => (
                        <span key={i} className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {kw}
                          <button type="button" onClick={() => removeKeyword(i)} className="text-slate-400 hover:text-red-500">
                            <FaTimes className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className={labelClass}>Dual Keywords (Formal/Colloquial)</label>
                    <button
                      type="button"
                      onClick={addDualKeyword}
                      className="inline-flex items-center gap-1 rounded border border-primary/20 bg-primary-light px-2.5 py-1 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
                    >
                      <FaPlus className="h-3 w-3" />
                      Add Pair
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">Use both formal and local terms for better search visibility</p>

                  <div className="space-y-2">
                    {formData.dualKeywords.map((pair, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={pair.formal}
                          onChange={(e) => updateDualKeyword(i, 'formal', e.target.value)}
                          className={inputClass}
                          placeholder="Formal (e.g., steel almirah)"
                        />
                        <span className="text-slate-400 text-xs font-medium">/</span>
                        <input
                          type="text"
                          value={pair.colloquial}
                          onChange={(e) => updateDualKeyword(i, 'colloquial', e.target.value)}
                          className={inputClass}
                          placeholder="Colloquial (e.g., daraj)"
                        />
                        <button
                          type="button"
                          onClick={() => removeDualKeyword(i)}
                          className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <FaTimes className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {formData.dualKeywords.length === 0 && (
                      <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg bg-slate-50 text-xs text-slate-500">
                        No dual keywords added. Add pairs like &apos;almirah/daraj&apos; or &apos;powder/coating&apos;
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <button
                    type="button"
                    onClick={() => setShowSEOPreview(!showSEOPreview)}
                    className="flex w-full items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <FaEye className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-slate-900">Search Result Preview</span>
                    </div>
                    <span className="text-xs text-slate-500">{showSEOPreview ? 'Hide' : 'Show'}</span>
                  </button>
                  
                  {showSEOPreview && (
                    <div className="mt-4 rounded-lg border border-slate-300 bg-white p-4">
                      <div className="text-xs text-green-700">
                        https://manishsteel.com.np/products/{formData.slug || 'product-slug'}
                      </div>
                      <div className="mt-1 text-lg font-medium text-blue-700 hover:underline">
                        {formData.metaTitle || formData.name || 'Product Title'}
                      </div>
                      <div className="mt-1 text-sm text-slate-600">
                        {formData.metaDescription || formData.description.substring(0, 160) || 'Product description will appear here...'}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </FormSection>
          )}

          {activeTab === 'media' && (
            <>
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
                        placeholder="e.g., Royal Blue, Matte Black"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Color Code (Hex/Visual)</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          name="colorHex"
                          value={formData.colorHex || '#475569'}
                          onChange={handleInputChange}
                          className="h-10 w-12 cursor-pointer rounded-lg border border-slate-300 p-0.5 bg-white shrink-0"
                        />
                        <input
                          type="text"
                          name="colorHex"
                          value={formData.colorHex}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
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
                          <div key={index} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
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
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                                      <FaCheck className="h-3 w-3" />
                                      Linked both ways
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
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
            </>
          )}

          {activeTab === 'specs' && (
            <>
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
                    <label className={labelClass}>Material Specification</label>
                    <input type="text" name="specifications.material" value={formData.specifications.material} onChange={handleInputChange} className={inputClass} placeholder="e.g., 20/22 Gauge Tata Steel" />
                  </div>
                  <div>
                    <label className={labelClass}>Dimensions (Overall H x W x D)</label>
                    <input type="text" name="specifications.dimensions" value={formData.specifications.dimensions} onChange={handleInputChange} className={inputClass} placeholder="e.g., 72 x 36 x 18 inches" />
                  </div>
                  <div>
                    <label className={labelClass}>Warranty / Guarantee</label>
                    <input type="text" name="specifications.guarantee" value={formData.specifications.guarantee} onChange={handleInputChange} className={inputClass} placeholder="e.g., 10-Year Warranty" />
                  </div>
                  <div>
                    <label className={labelClass}>Model Type</label>
                    <input type="text" name="specifications.modelType" value={formData.specifications.modelType} onChange={handleInputChange} className={inputClass} placeholder="e.g., Double Door" />
                  </div>
                  <div>
                    <label className={labelClass}>Model Width</label>
                    <input type="text" name="specifications.modelWidth" value={formData.specifications.modelWidth} onChange={handleInputChange} className={inputClass} placeholder="e.g., 3 Feet" />
                  </div>
                  <div>
                    <label className={labelClass}>Number of Hangers</label>
                    <input type="text" name="specifications.hangers" value={formData.specifications.hangers} onChange={handleInputChange} className={inputClass} placeholder="e.g., 1 Rod" />
                  </div>
                  <div>
                    <label className={labelClass}>Number of Doors</label>
                    <input type="text" name="specifications.noOfDoors" value={formData.specifications.noOfDoors} onChange={handleInputChange} className={inputClass} placeholder="e.g., 2 Doors" />
                  </div>
                  <div>
                    <label className={labelClass}>Type of Paint / Finish</label>
                    <input type="text" name="specifications.typeOfPaint" value={formData.specifications.typeOfPaint} onChange={handleInputChange} className={inputClass} placeholder="e.g., Powder Coated" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>Brand</label>
                    <input type="text" name="specifications.brand" value={formData.specifications.brand} onChange={handleInputChange} className={inputClass} placeholder="e.g., Manish Steel Furniture" />
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

              <FormSection title="Frequently Asked Questions (FAQ)" icon={<FaQuestionCircle className="h-4 w-4" />}>
                <div className="space-y-4">
                  <p className="text-xs text-slate-500">
                    These Q&amp;As appear on the product page. They help customers and improve SEO. Edit or add your own below.
                  </p>

                  {formData.faqs.length === 0 && (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                      No FAQs added yet. Click &quot;Add FAQ&quot; to create one.
                    </div>
                  )}

                  <div className="space-y-4">
                    {formData.faqs.map((faq, index) => (
                      <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold uppercase tracking-wide text-slate-400">FAQ #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.faqs.filter((_, i) => i !== index);
                              setFormData(prev => ({ ...prev, faqs: updated }));
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-500 transition hover:bg-red-100"
                            aria-label={`Remove FAQ ${index + 1}`}
                          >
                            <FaTimes className="h-3 w-3" />
                          </button>
                        </div>
                        <div>
                          <label className={labelClass}>Question</label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const updated = [...formData.faqs];
                              updated[index] = { ...updated[index], question: e.target.value };
                              setFormData(prev => ({ ...prev, faqs: updated }));
                            }}
                            className={inputClass}
                            placeholder="e.g. What is the price of this almirah?"
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Answer</label>
                          <textarea
                            value={faq.answer}
                            onChange={(e) => {
                              const updated = [...formData.faqs];
                              updated[index] = { ...updated[index], answer: e.target.value };
                              setFormData(prev => ({ ...prev, faqs: updated }));
                            }}
                            className={`${inputClass} min-h-20 resize-y`}
                            rows={3}
                            placeholder="Provide a helpful, detailed answer..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        faqs: [...prev.faqs, { question: '', answer: '' }]
                      }));
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary-light px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
                  >
                    <FaPlus className="h-4 w-4" />
                    Add FAQ
                  </button>
                </div>
              </FormSection>
            </>
          )}

          {activeTab === 'general' && (
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
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          {/* Product Preview Card */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-50">
              {formData.imagePreviews.main ? (
                <Image
                  src={formData.imagePreviews.main}
                  alt={formData.name || 'Product preview'}
                  fill
                  className="object-contain p-4"
                  sizes="300px"
                />
              ) : (
                <div className="text-center">
                  <FaBoxOpen className="h-14 w-14 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400 mt-2">No image yet</p>
                </div>
              )}
              {/* Status badge */}
              <div className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${
                formData.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {formData.isAvailable ? '● Live' : '● Hidden'}
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Live Preview</p>
              <h3 className="line-clamp-2 text-base font-bold text-slate-900">
                {formData.name || <span className="text-slate-400 italic">Untitled product</span>}
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                {[selectedCategory?.name, selectedSubcategory?.name].filter(Boolean).join(' › ') || 'No category selected'}
              </p>
              {formData.material && (
                <p className="mt-1 text-xs text-slate-400">Material: {formData.material}</p>
              )}
              {visibleBadges.filter(b => b !== (formData.isAvailable ? 'Available' : 'Hidden')).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {visibleBadges.filter(b => b !== (formData.isAvailable ? 'Available' : 'Hidden')).map((badge) => (
                    <span key={badge} className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Display Settings - Redesigned */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FaLayerGroup className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-sm font-bold text-slate-900">Display Settings</h3>
            </div>
            <div className="p-3 space-y-2">
              {[
                { id: 'featured', name: 'featured' as keyof FormData, checked: formData.featured, title: 'Featured', desc: 'Show on homepage featured section', icon: <FaStar className="h-3.5 w-3.5" />, color: 'amber' },
                { id: 'isMostSelling', name: 'isMostSelling' as keyof FormData, checked: formData.isMostSelling, title: 'Most Selling', desc: 'Show in most selling section', icon: <FaTags className="h-3.5 w-3.5" />, color: 'blue' },
                { id: 'isTopProduct', name: 'isTopProduct' as keyof FormData, checked: formData.isTopProduct, title: 'Top Product', desc: 'Show in top products section', icon: <FaCheckCircle className="h-3.5 w-3.5" />, color: 'violet' },
                { id: 'isAvailable', name: 'isAvailable' as keyof FormData, checked: formData.isAvailable, title: 'Available / Live', desc: 'Visible to customers on site', icon: <FaEye className="h-3.5 w-3.5" />, color: 'green' },
              ].map(toggle => (
                <label
                  key={toggle.id}
                  htmlFor={toggle.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-all ${
                    toggle.checked
                      ? 'border-primary/30 bg-primary/5'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    id={toggle.id}
                    name={toggle.name}
                    checked={toggle.checked}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg transition-colors ${
                    toggle.checked ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {toggle.checked ? <FaCheck className="h-3 w-3" /> : toggle.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs font-bold ${toggle.checked ? 'text-primary' : 'text-slate-700'}`}>
                      {toggle.title}
                    </p>
                    <p className="text-xs text-slate-400 leading-tight mt-0.5">{toggle.desc}</p>
                  </div>
                  <div className={`h-4 w-8 rounded-full transition-colors flex-none ${
                    toggle.checked ? 'bg-primary' : 'bg-slate-200'
                  }`}>
                    <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      toggle.checked ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Quick Tips */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold text-amber-800 mb-2">💡 Quick Tips</p>
            <ul className="space-y-1 text-xs text-amber-700">
              <li>• Fill all tabs before saving</li>
              <li>• Add images for better visibility</li>
              <li>• SEO fields help with Google ranking</li>
              <li>• FAQs appear on the product page</li>
            </ul>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 py-3.5 shadow-[0_-8px_24px_rgba(15,23,42,0.1)] backdrop-blur sm:px-6">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400 text-center sm:text-left">
            {product ? `Editing: ${product.name || 'Product'}` : 'Creating new product'}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 sm:flex-none rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4" />
                  {product ? 'Update Product' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default ProductFormEnhanced;

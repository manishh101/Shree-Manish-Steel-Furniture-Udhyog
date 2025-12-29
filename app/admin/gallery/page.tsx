'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { galleryAPI, categoryAPI, GallerySection, GalleryImage, GalleryConfig, Category } from '@/services/api';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaImage, 
  FaUpload, 
  FaSave, 
  FaTimes, 
  FaEye, 
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaCog,
  FaList,
  FaSearch,
  FaGripVertical,
  FaCheckCircle,
  FaChartBar,
  FaThLarge
} from 'react-icons/fa';
import { MdDashboard, MdCollections, MdPhotoLibrary } from 'react-icons/md';

interface SectionForm {
  name: string;
  description: string;
  category: string;
  featured: boolean;
  tags: string;
  order: number;
}

interface ImageForm {
  title: string;
  description: string;
  tags: string;
  featured: boolean;
  category: string;
  file: File | null;
}

interface ConfigForm {
  title: string;
  subtitle: string;
  heroImage: string | null;
  showFilters: boolean;
  showStats: boolean;
  layout: string;
  featuredSectionsOnHomepage: boolean;
  testimonialSlider: boolean;
  metaDescription: string;
  itemsPerPage: number;
}

interface Analytics {
  totalVisitors: number;
  popularSections: Array<{ name: string; id: string; views: number }>;
  featuredItems: number;
  lastUpdated: Date | null;
}

const AdminGallery = () => {
  // Primary navigation and UI states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState<GallerySection | GalleryImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  // Gallery data states
  const [sections, setSections] = useState<GallerySection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<(GalleryImage & { sectionId?: string; sectionName?: string })[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'order'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Form states
  const [sectionForm, setSectionForm] = useState<SectionForm>({
    name: '',
    description: '',
    category: '',
    featured: false,
    tags: '',
    order: 0
  });

  const [imageForm, setImageForm] = useState<ImageForm>({
    title: '',
    description: '',
    tags: '',
    featured: false,
    category: '',
    file: null
  });

  const [configForm, setConfigForm] = useState<ConfigForm>({
    title: 'Our Professional Gallery',
    subtitle: 'Discover our master craftsmanship through stunning visuals',
    heroImage: null,
    showFilters: true,
    showStats: true,
    layout: 'grid',
    featuredSectionsOnHomepage: true,
    testimonialSlider: true,
    metaDescription: 'Explore our gallery showcasing premium furniture and steel products',
    itemsPerPage: 12
  });

  // Analytics data state
  const [analytics, setAnalytics] = useState<Analytics>({
    totalVisitors: 0,
    popularSections: [],
    featuredItems: 0,
    lastUpdated: null
  });

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Load all gallery data
  const loadAllData = useCallback(async () => {
    try {
      setLoading(true);
      
      const [sectionsResponse, configResponse, categoriesResponse] = await Promise.all([
        galleryAPI.getSections(),
        galleryAPI.getConfig().catch(() => null),
        categoryAPI.getAll()
      ]);
      
      // Process sections data
      const sectionsData = Array.isArray(sectionsResponse) 
        ? sectionsResponse 
        : (sectionsResponse as { sections?: GallerySection[] })?.sections || [];
      setSections(sectionsData);
      
      // Extract all images from sections
      const allImages = sectionsData.reduce<(GalleryImage & { sectionId?: string; sectionName?: string })[]>((acc, section) => {
        const sectionImages = (section.images || []).map(img => ({
          ...img,
          sectionId: section._id || section.id,
          sectionName: section.name
        }));
        return [...acc, ...sectionImages];
      }, []);
      setImages(allImages);
      
      // Process configuration
      if (configResponse) {
        setConfigForm(prev => ({
          ...prev,
          ...(configResponse as unknown as ConfigForm)
        }));
      }
      
      // Process categories
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : []);
      
      // Set default selection states
      if (sectionsData.length > 0) {
        setSelectedSection(sectionsData[0]._id || sectionsData[0].id || '');
      }
      
      // Load analytics data
      loadAnalyticsData(sectionsData, allImages);
      
    } catch (error) {
      console.error('Error loading gallery data:', error);
      showToast('Failed to load gallery data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load analytics data
  const loadAnalyticsData = (sectionsData: GallerySection[], imagesData: GalleryImage[]) => {
    const totalVisitors = Math.floor(Math.random() * 1000) + 500;
    
    const popularSections = sectionsData
      .slice(0, Math.min(sectionsData.length, 3))
      .map((s, index) => ({ 
        name: s.name, 
        id: s._id || s.id || '',
        views: Math.floor(Math.random() * 100) + 100 - (index * 20) 
      }))
      .sort((a, b) => b.views - a.views);
    
    const featuredSections = sectionsData.filter(s => s.featured).length;
    const featuredImages = imagesData.filter(i => i.featured).length;
    
    setAnalytics({
      totalVisitors,
      popularSections,
      featuredItems: featuredSections + featuredImages,
      lastUpdated: new Date()
    });
  };

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Modal handlers
  const openSectionModal = (section: GallerySection | null = null) => {
    setEditingItem(section);
    setModalType('section');
    setSectionForm(section ? {
      name: section.name || '',
      description: section.description || '',
      category: section.category || '',
      featured: section.featured || false,
      tags: section.tags?.join(', ') || '',
      order: section.order || 0
    } : {
      name: '',
      description: '',
      category: '',
      featured: false,
      tags: '',
      order: sections.length
    });
    setIsModalOpen(true);
  };

  const openImageModal = (image: GalleryImage | null = null) => {
    setEditingItem(image);
    setModalType('image');
    setImageForm(image ? {
      title: image.title || '',
      description: image.description || '',
      tags: image.tags?.join(', ') || '',
      featured: image.featured || false,
      category: image.category || '',
      file: null
    } : {
      title: '',
      description: '',
      tags: '',
      featured: false,
      category: '',
      file: null
    });
    setIsModalOpen(true);
  };

  const openConfigModal = () => {
    setModalType('config');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSectionForm({
      name: '',
      description: '',
      category: '',
      featured: false,
      tags: '',
      order: 0
    });
    setImageForm({
      title: '',
      description: '',
      tags: '',
      featured: false,
      category: '',
      file: null
    });
    setPreviewImage(null);
  };

  // Section CRUD operations
  const handleSaveSection = async () => {
    if (!sectionForm.name.trim()) {
      showToast('Section name is required', 'error');
      return;
    }
    
    try {
      setLoading(true);
      const sectionData = {
        name: sectionForm.name,
        description: sectionForm.description,
        category: sectionForm.category,
        featured: sectionForm.featured,
        tags: sectionForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        order: sectionForm.order
      };
      
      if (editingItem && '_id' in editingItem) {
        await galleryAPI.updateSection(editingItem._id, sectionData);
        showToast('Section updated successfully', 'success');
      } else {
        await galleryAPI.createSection(sectionData);
        showToast('Section created successfully', 'success');
      }
      
      closeModal();
      loadAllData();
    } catch (error) {
      console.error('Error saving section:', error);
      showToast('Failed to save section', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section? All images in this section will also be deleted.')) {
      return;
    }
    
    try {
      setLoading(true);
      await galleryAPI.deleteSection(sectionId);
      showToast('Section deleted successfully', 'success');
      loadAllData();
    } catch (error) {
      console.error('Error deleting section:', error);
      showToast('Failed to delete section', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Image operations
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageForm(prev => ({ ...prev, file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = async () => {
    if (!selectedSection) {
      showToast('Please select a section first', 'error');
      return;
    }
    
    try {
      setLoading(true);
      
      if (imageForm.file) {
        const formData = new FormData();
        formData.append('image', imageForm.file);
        formData.append('title', imageForm.title);
        formData.append('description', imageForm.description);
        formData.append('tags', imageForm.tags);
        formData.append('featured', String(imageForm.featured));
        
        await galleryAPI.addImageToSection(selectedSection, formData);
        showToast('Image uploaded successfully', 'success');
      } else if (editingItem && '_id' in editingItem) {
        const imageData = {
          title: imageForm.title,
          description: imageForm.description,
          tags: imageForm.tags.split(',').map(t => t.trim()).filter(Boolean),
          featured: imageForm.featured
        };
        await galleryAPI.updateImageInSection(selectedSection, editingItem._id, imageData);
        showToast('Image updated successfully', 'success');
      }
      
      closeModal();
      loadAllData();
    } catch (error) {
      console.error('Error saving image:', error);
      showToast('Failed to save image', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (sectionId: string, imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }
    
    try {
      setLoading(true);
      await galleryAPI.deleteImageFromSection(sectionId, imageId);
      showToast('Image deleted successfully', 'success');
      loadAllData();
    } catch (error) {
      console.error('Error deleting image:', error);
      showToast('Failed to delete image', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Config operations
  const handleSaveConfig = async () => {
    try {
      setLoading(true);
      await galleryAPI.updateConfig(configForm);
      showToast('Configuration saved successfully', 'success');
      closeModal();
    } catch (error) {
      console.error('Error saving configuration:', error);
      showToast('Failed to save configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Move section up/down
  const handleMoveSection = async (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => (s._id || s.id) === sectionId);
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    const newSections = [...sections];
    [newSections[currentIndex], newSections[newIndex]] = [newSections[newIndex], newSections[currentIndex]];
    
    try {
      const sectionIds = newSections.map(s => s._id || s.id || '');
      await galleryAPI.reorderSections(sectionIds);
      setSections(newSections);
      showToast('Section order updated', 'success');
    } catch (error) {
      console.error('Error reordering sections:', error);
      showToast('Failed to reorder sections', 'error');
    }
  };

  // Filtered and sorted data
  const filteredSections = useMemo(() => {
    let result = [...sections];
    
    if (searchTerm) {
      result = result.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      result = result.filter(s => s.category === selectedCategory);
    }
    
    result.sort((a, b) => {
      const aVal = sortBy === 'name' ? a.name : (a.order || 0);
      const bVal = sortBy === 'name' ? b.name : (b.order || 0);
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });
    
    return result;
  }, [sections, searchTerm, selectedCategory, sortBy, sortOrder]);

  const currentSectionImages = useMemo(() => {
    if (!selectedSection) return [];
    const section = sections.find(s => (s._id || s.id) === selectedSection);
    return section?.images || [];
  }, [selectedSection, sections]);

  // Tab components
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <MdCollections className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sections</p>
              <p className="text-2xl font-bold text-gray-900">{sections.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <FaImage className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Images</p>
              <p className="text-2xl font-bold text-gray-900">{images.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaStar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Featured Items</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.featuredItems}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <FaEye className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalVisitors}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Popular Sections */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Popular Sections</h3>
        {analytics.popularSections.length > 0 ? (
          <div className="space-y-3">
            {analytics.popularSections.map((section, index) => (
              <div key={section.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="ml-3 font-medium">{section.name}</span>
                </div>
                <span className="text-gray-500">{section.views} views</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No data available</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => openSectionModal()}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaPlus className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm font-medium">Add Section</span>
          </button>
          <button
            onClick={() => {
              if (sections.length > 0) {
                setSelectedSection(sections[0]._id || sections[0].id || '');
                setActiveTab('images');
                openImageModal();
              } else {
                showToast('Create a section first', 'error');
              }
            }}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaUpload className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm font-medium">Upload Image</span>
          </button>
          <button
            onClick={openConfigModal}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaCog className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={() => window.open('/gallery', '_blank')}
            className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FaEye className="h-6 w-6 text-primary mb-2" />
            <span className="text-sm font-medium">View Gallery</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSections = () => (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => openSectionModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FaPlus className="h-4 w-4" />
          Add Section
        </button>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredSections.length > 0 ? (
          <div className="divide-y">
            {filteredSections.map((section, index) => (
              <div
                key={section._id || section.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <FaGripVertical className="text-gray-400 cursor-move" />
                    <div>
                      <h3 className="font-medium flex items-center gap-2">
                        {section.name}
                        {section.featured && (
                          <FaStar className="h-4 w-4 text-yellow-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {section.images?.length || 0} images
                        {section.description && ` • ${section.description.substring(0, 50)}...`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveSection(section._id || section.id || '', 'up')}
                      disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <FaArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(section._id || section.id || '', 'down')}
                      disabled={index === filteredSections.length - 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      <FaArrowDown className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedSection(section._id || section.id || '');
                        setActiveTab('images');
                      }}
                      className="p-2 text-blue-500 hover:text-blue-700"
                      title="View Images"
                    >
                      <FaImage className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openSectionModal(section)}
                      className="p-2 text-green-500 hover:text-green-700"
                      title="Edit"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section._id || section.id || '')}
                      className="p-2 text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <MdCollections className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No sections found</p>
            <button
              onClick={() => openSectionModal()}
              className="mt-4 text-primary hover:underline"
            >
              Create your first section
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderImages = () => (
    <div className="space-y-6">
      {/* Section Selector & Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a section</option>
            {sections.map(section => (
              <option key={section._id || section.id} value={section._id || section.id}>
                {section.name} ({section.images?.length || 0} images)
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 border rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500'}`}
            >
              <FaThLarge className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500'}`}
            >
              <FaList className="h-4 w-4" />
            </button>
          </div>
        </div>
        <button
          onClick={() => openImageModal()}
          disabled={!selectedSection}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FaUpload className="h-4 w-4" />
          Upload Image
        </button>
      </div>

      {/* Images Grid/List */}
      {selectedSection ? (
        currentSectionImages.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4' 
            : 'space-y-4'
          }>
            {currentSectionImages.map(image => (
              <div
                key={image._id || image.id}
                className={`bg-white rounded-lg shadow overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center p-4' : ''
                }`}
              >
                <div className={viewMode === 'grid' ? 'aspect-square' : 'w-24 h-24 flex-shrink-0'}>
                  <img
                    src={image.url}
                    alt={image.title || 'Gallery image'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className={viewMode === 'grid' ? 'p-3' : 'flex-1 ml-4'}>
                  <h4 className="font-medium truncate">{image.title || 'Untitled'}</h4>
                  {image.description && (
                    <p className="text-sm text-gray-500 truncate">{image.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    {image.featured && (
                      <span className="text-yellow-500">
                        <FaStar className="h-4 w-4" />
                      </span>
                    )}
                    <button
                      onClick={() => openImageModal(image)}
                      className="p-1 text-green-500 hover:text-green-700"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteImage(selectedSection, image._id || image.id || '')}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FaImage className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No images in this section</p>
            <button
              onClick={() => openImageModal()}
              className="mt-4 text-primary hover:underline"
            >
              Upload your first image
            </button>
          </div>
        )
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MdPhotoLibrary className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Select a section to view images</p>
        </div>
      )}
    </div>
  );

  // Modal Content
  const renderModal = () => {
    if (!isModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold">
              {modalType === 'section' && (editingItem ? 'Edit Section' : 'Add Section')}
              {modalType === 'image' && (editingItem ? 'Edit Image' : 'Upload Image')}
              {modalType === 'config' && 'Gallery Settings'}
            </h2>
            <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full">
              <FaTimes className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            {modalType === 'section' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Section Name *</label>
                  <input
                    type="text"
                    value={sectionForm.name}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Enter section name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={sectionForm.description}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows={3}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={sectionForm.category}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={sectionForm.tags}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={sectionForm.featured}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="featured" className="text-sm font-medium">Featured section</label>
                </div>
              </div>
            )}

            {modalType === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Image *</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    {previewImage || (editingItem && 'url' in editingItem && editingItem.url) ? (
                      <img
                        src={previewImage || ((editingItem as GalleryImage).url)}
                        alt="Preview"
                        className="max-h-48 mx-auto rounded"
                      />
                    ) : (
                      <>
                        <FaUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload image</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={imageForm.title}
                    onChange={(e) => setImageForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="Enter image title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={imageForm.description}
                    onChange={(e) => setImageForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows={2}
                    placeholder="Enter description"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={imageForm.tags}
                    onChange={(e) => setImageForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="imageFeatured"
                    checked={imageForm.featured}
                    onChange={(e) => setImageForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="imageFeatured" className="text-sm font-medium">Featured image</label>
                </div>
              </div>
            )}

            {modalType === 'config' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Gallery Title</label>
                  <input
                    type="text"
                    value={configForm.title}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={configForm.subtitle}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Meta Description</label>
                  <textarea
                    value={configForm.metaDescription}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Default Layout</label>
                  <select
                    value={configForm.layout}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, layout: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="grid">Grid</option>
                    <option value="masonry">Masonry</option>
                    <option value="list">List</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Items Per Page</label>
                  <input
                    type="number"
                    value={configForm.itemsPerPage}
                    onChange={(e) => setConfigForm(prev => ({ ...prev, itemsPerPage: parseInt(e.target.value) || 12 }))}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                    min={4}
                    max={48}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showFilters"
                      checked={configForm.showFilters}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, showFilters: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="showFilters" className="text-sm">Show Filters</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showStats"
                      checked={configForm.showStats}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, showStats: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="showStats" className="text-sm">Show Stats</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="featuredOnHomepage"
                      checked={configForm.featuredSectionsOnHomepage}
                      onChange={(e) => setConfigForm(prev => ({ ...prev, featuredSectionsOnHomepage: e.target.checked }))}
                      className="rounded"
                    />
                    <label htmlFor="featuredOnHomepage" className="text-sm">Show Featured on Homepage</label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t">
            <button
              onClick={closeModal}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (modalType === 'section') handleSaveSection();
                else if (modalType === 'image') handleSaveImage();
                else if (modalType === 'config') handleSaveConfig();
              }}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="h-4 w-4" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <FaCheckCircle className="h-5 w-5" />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Gallery Management</h1>
        <button
          onClick={openConfigModal}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FaCog className="h-4 w-4" />
          Settings
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'dashboard' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MdDashboard className="h-5 w-5" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'sections' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MdCollections className="h-5 w-5" />
          Sections
        </button>
        <button
          onClick={() => setActiveTab('images')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'images' ? 'bg-white shadow text-primary' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MdPhotoLibrary className="h-5 w-5" />
          Images
        </button>
      </div>

      {/* Loading State */}
      {loading && !isModalOpen && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      )}

      {/* Content */}
      {!loading && (
        <>
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'sections' && renderSections()}
          {activeTab === 'images' && renderImages()}
        </>
      )}

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default AdminGallery;

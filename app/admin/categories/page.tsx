'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { categoryAPI, Category, subcategoryAPI, Subcategory } from '@/services/api';
import {
  FaPencilAlt,
  FaTrash,
  FaPlusCircle,
  FaTimes,
  FaSync,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaGripVertical,
  FaFileAlt,
  FaSearch,
  FaQuestionCircle,
  FaInfoCircle,
  FaCheckCircle,
  FaPlus
} from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const AdminCategories = () => {
  const [categories, setCategories] = useState<(Category & { subcategories?: Subcategory[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Category Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    displayOrder: 0,
    metaTitle: '',
    metaDescription: '',
    focusKeywords: [] as string[],
    dualKeywords: [] as Array<{ formal: string; colloquial: string }>,
    faqs: [] as Array<{ question: string; answer: string }>
  });
  const [keywordInput, setKeywordInput] = useState('');
  const [showSEOFields, setShowSEOFields] = useState(false);
  const [categoryActiveTab, setCategoryActiveTab] = useState<'general' | 'seo' | 'faq'>('general');

  // Subcategory Modal State
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [subcategoryFormData, setSubcategoryFormData] = useState({ name: '', description: '', displayOrder: 0 });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Get all categories
      const categoriesData = await categoryAPI.getAll();

      // Get all subcategories
      const subcategoriesData = await subcategoryAPI.getAll();

      // Merge subcategories into categories
      const categoriesWithSubs = categoriesData.map((category: Category) => ({
        ...category,
        subcategories: subcategoriesData
          .filter((sub: Subcategory) => sub.categoryId === category._id || sub.parentId === category._id)
          .sort((a: Subcategory, b: Subcategory) => (a.displayOrder || 0) - (b.displayOrder || 0))
      })).sort((a: Category, b: Category) => (a.displayOrder || 0) - (b.displayOrder || 0));

      setCategories(categoriesWithSubs);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(`Failed to load categories: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Toggle category expansion
  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Category Modal Functions
  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      description: '',
      displayOrder: categories.length,
      metaTitle: '',
      metaDescription: '',
      focusKeywords: [],
      dualKeywords: [],
      faqs: []
    });
    setKeywordInput('');
    setShowSEOFields(false);
    setCategoryActiveTab('general');
    setError('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder || 0,
      metaTitle: (category as any).metaTitle || '',
      metaDescription: (category as any).metaDescription || '',
      focusKeywords: (category as any).focusKeywords || [],
      dualKeywords: (category as any).dualKeywords || [],
      faqs: (category as any).faqs || []
    });
    setKeywordInput('');
    setShowSEOFields(
      !!(category as any).metaTitle ||
      !!(category as any).metaDescription ||
      ((category as any).focusKeywords && (category as any).focusKeywords.length > 0)
    );
    setCategoryActiveTab('general');
    setError('');
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setError('');
  };

  // Subcategory Modal Functions
  const openAddSubcategoryModal = (categoryId: string) => {
    const category = categories.find(c => c._id === categoryId);
    const subCount = category?.subcategories?.length || 0;
    setSelectedCategoryId(categoryId);
    setEditingSubcategory(null);
    setSubcategoryFormData({ name: '', description: '', displayOrder: subCount });
    setError('');
    setIsSubcategoryModalOpen(true);
  };

  const openEditSubcategoryModal = (categoryId: string, subcategory: Subcategory) => {
    setSelectedCategoryId(categoryId);
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({
      name: subcategory.name,
      description: subcategory.description || '',
      displayOrder: subcategory.displayOrder || 0
    });
    setError('');
    setIsSubcategoryModalOpen(true);
  };

  const closeSubcategoryModal = () => {
    setIsSubcategoryModalOpen(false);
    setSelectedCategoryId(null);
    setEditingSubcategory(null);
    setError('');
  };

  // SEO Helper Functions for Categories
  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    
    if (!categoryFormData.focusKeywords.includes(keywordInput.trim())) {
      setCategoryFormData(prev => ({
        ...prev,
        focusKeywords: [...prev.focusKeywords, keywordInput.trim()]
      }));
    }
    
    setKeywordInput('');
  };

  const removeKeyword = (index: number) => {
    setCategoryFormData(prev => ({
      ...prev,
      focusKeywords: prev.focusKeywords.filter((_, i) => i !== index)
    }));
  };

  const addDualKeyword = () => {
    setCategoryFormData(prev => ({
      ...prev,
      dualKeywords: [...prev.dualKeywords, { formal: '', colloquial: '' }]
    }));
  };

  const updateDualKeyword = (index: number, field: 'formal' | 'colloquial', value: string) => {
    setCategoryFormData(prev => {
      const dualKeywords = [...prev.dualKeywords];
      dualKeywords[index] = { ...dualKeywords[index], [field]: value };
      return { ...prev, dualKeywords };
    });
  };

  const removeDualKeyword = (index: number) => {
    setCategoryFormData(prev => ({
      ...prev,
      dualKeywords: prev.dualKeywords.filter((_, i) => i !== index)
    }));
  };

  const addFAQ = () => {
    setCategoryFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }]
    }));
  };

  const updateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    setCategoryFormData(prev => {
      const faqs = [...prev.faqs];
      faqs[index] = { ...faqs[index], [field]: value };
      return { ...prev, faqs };
    });
  };

  const removeFAQ = (index: number) => {
    setCategoryFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };

  const getMetaTitleLength = () => categoryFormData.metaTitle.length;
  const getMetaDescriptionLength = () => categoryFormData.metaDescription.length;
  
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

  // Form Submit Handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!categoryFormData.name.trim()) {
      setError('Category name is required.');
      return;
    }

    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, categoryFormData);
      } else {
        await categoryAPI.create(categoryFormData);
      }
      await loadCategories();
      closeCategoryModal();
    } catch (err) {
      console.error('Error saving category:', err);
      setError(`Failed to save category: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!subcategoryFormData.name.trim()) {
      setError('Subcategory name is required.');
      return;
    }

    if (!selectedCategoryId) {
      setError('Parent category is required.');
      return;
    }

    try {
      const data = {
        ...subcategoryFormData,
        categoryId: selectedCategoryId
      };

      if (editingSubcategory) {
        await subcategoryAPI.update(editingSubcategory._id, data);
      } else {
        await subcategoryAPI.create(data);
      }
      await loadCategories();
      closeSubcategoryModal();
    } catch (err) {
      console.error('Error saving subcategory:', err);
      setError(`Failed to save subcategory: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Delete Handlers
  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      try {
        await categoryAPI.delete(categoryId);
        await loadCategories();
      } catch (err) {
        console.error('Error deleting category:', err);
        setError(`Failed to delete category: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleDeleteSubcategory = async (subcategoryId: string) => {
    if (window.confirm('Are you sure you want to delete this subcategory?')) {
      try {
        await subcategoryAPI.delete(subcategoryId);
        await loadCategories();
      } catch (err) {
        console.error('Error deleting subcategory:', err);
        setError(`Failed to delete subcategory: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleMoveCategory = async (category: Category, direction: 'up' | 'down') => {
    const currentIndex = categories.findIndex(c => c._id === category._id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === categories.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetCategory = categories[targetIndex];

    try {
      setLoading(true);
      // Swap order
      await categoryAPI.update(category._id, { displayOrder: targetCategory.displayOrder || targetIndex });
      await categoryAPI.update(targetCategory._id, { displayOrder: category.displayOrder || currentIndex });
      await loadCategories();
    } catch (err) {
      console.error('Error reordering category:', err);
      setError('Failed to reorder category');
      setLoading(false);
    }
  };

  const handleMoveSubcategory = async (categoryId: string, subcategory: Subcategory, direction: 'up' | 'down') => {
    const category = categories.find(c => c._id === categoryId);
    if (!category || !category.subcategories) return;

    const subs = category.subcategories;
    const currentIndex = subs.findIndex(s => s._id === subcategory._id);
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === subs.length - 1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const targetSub = subs[targetIndex];

    try {
      setLoading(true);
      // Swap order
      await subcategoryAPI.update(subcategory._id, { displayOrder: targetSub.displayOrder || targetIndex });
      await subcategoryAPI.update(targetSub._id, { displayOrder: subcategory.displayOrder || currentIndex });
      await loadCategories();
    } catch (err) {
      console.error('Error reordering subcategory:', err);
      setError('Failed to reorder subcategory');
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'category') {
      const newCategories = Array.from(categories);
      const [removed] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, removed);

      // Update state immediately for UX
      setCategories(newCategories);

      try {
        setLoading(true);
        // Update all categories in the database to ensure order is persisted
        // Ideally we would have a bulk update API but since we don't, we'll update affected ones
        // or just the moved one if we're confident in the displayOrder logic
        // To be safe and simple, let's update EVERY category with its new index as displayOrder
        const updates = newCategories.map((cat, index) =>
          categoryAPI.update(cat._id, { displayOrder: index })
        );
        await Promise.all(updates);
        await loadCategories(); // Reload to get fresh data
      } catch (err) {
        console.error('Error reordering categories:', err);
        setError('Failed to reorder categories');
        await loadCategories(); // Revert state on error
      } finally {
        setLoading(false);
      }
    } else if (type === 'subcategory') {
      const categoryId = source.droppableId.replace('sub-', '');
      const category = categories.find(c => c._id === categoryId);
      if (!category || !category.subcategories) return;

      const newSubs = Array.from(category.subcategories);
      const [removed] = newSubs.splice(source.index, 1);
      newSubs.splice(destination.index, 0, removed);

      // Update local state for UX
      const newCategories = categories.map(c =>
        c._id === categoryId ? { ...c, subcategories: newSubs } : c
      );
      setCategories(newCategories);

      try {
        setLoading(true);
        const updates = newSubs.map((sub, index) =>
          subcategoryAPI.update(sub._id, { displayOrder: index })
        );
        await Promise.all(updates);
        await loadCategories();
      } catch (err) {
        console.error('Error reordering subcategories:', err);
        setError('Failed to reorder subcategories');
        await loadCategories();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Manage Categories</h1>
        <div className="flex gap-2">
          <button
            onClick={loadCategories}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center text-sm"
            disabled={loading}
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={openAddCategoryModal}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center"
          >
            <FaPlusCircle className="h-5 w-5 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-transparent space-y-4">
          {categories.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <FaQuestionCircle className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">No categories found</p>
              <p className="text-xs text-slate-400 mt-1">Get started by creating a new product category.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categories-list" type="category">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {categories.map((category, index) => (
                      <Draggable key={category._id} draggableId={category._id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200/80 rounded-2xl transition-all duration-300 overflow-hidden"
                          >
                            <div className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {/* Drag Handle */}
                                <div 
                                  {...provided.dragHandleProps} 
                                  className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-grab active:cursor-grabbing transition-colors"
                                  title="Drag to reorder"
                                >
                                  <FaGripVertical />
                                </div>

                                {/* Toggle Expand */}
                                <button
                                  type="button"
                                  onClick={() => toggleCategoryExpansion(category._id)}
                                  className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                                  title={expandedCategories[category._id] ? "Collapse Subcategories" : "Expand Subcategories"}
                                >
                                  {expandedCategories[category._id] ? (
                                    <FaChevronUp className="h-4 w-4" />
                                  ) : (
                                    <FaChevronDown className="h-4 w-4" />
                                  )}
                                </button>

                                {/* Category Title & Badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span 
                                    onClick={() => toggleCategoryExpansion(category._id)}
                                    className="font-bold text-slate-800 text-base md:text-lg hover:text-primary transition-colors cursor-pointer"
                                  >
                                    {category.name}
                                  </span>
                                  <span className="inline-flex items-center text-xs bg-slate-50 text-slate-600 font-semibold px-2 py-0.5 rounded-full border border-slate-100">
                                    {category.subcategories?.length || 0} subcategories
                                  </span>
                                  <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-2 py-0.5 rounded-full">
                                    Rank: {category.displayOrder || 0}
                                  </span>
                                  {category.faqs && category.faqs.length > 0 && (
                                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <FaCheckCircle className="w-3 h-3" />
                                      {category.faqs.length} FAQs
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => openAddSubcategoryModal(category._id)}
                                  className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-2 rounded-xl border border-transparent hover:border-emerald-100 transition-all"
                                  title="Add Subcategory"
                                >
                                  <FaPlusCircle className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openEditCategoryModal(category)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-xl border border-transparent hover:border-blue-100 transition-all"
                                  title="Edit Category"
                                >
                                  <FaPencilAlt className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(category._id)}
                                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-xl border border-transparent hover:border-rose-100 transition-all"
                                  title="Delete Category"
                                >
                                  <FaTrash className="h-4 w-4" />
                                </button>
                              </div>
                            </div>

                            {/* Subcategories (Expanded view) */}
                            {expandedCategories[category._id] && (
                              <div className="border-t border-slate-100 bg-slate-50/40 p-4">
                                <div className="ml-0 md:ml-12 border-l-2 border-slate-200 pl-3 md:pl-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subcategories</span>
                                  </div>
                                  
                                  {category.subcategories && category.subcategories.length === 0 ? (
                                    <div className="py-4 text-center bg-white rounded-xl border border-dashed border-slate-200">
                                      <p className="text-sm text-slate-400 italic">No subcategories defined for this category.</p>
                                    </div>
                                  ) : (
                                    <Droppable droppableId={`sub-${category._id}`} type="subcategory">
                                      {(provided) => (
                                        <ul
                                          {...provided.droppableProps}
                                          ref={provided.innerRef}
                                          className="space-y-2"
                                        >
                                          {category.subcategories?.map((subcategory, subIndex) => (
                                            <Draggable key={subcategory._id} draggableId={subcategory._id} index={subIndex}>
                                              {(provided) => (
                                                <li
                                                  ref={provided.innerRef}
                                                  {...provided.draggableProps}
                                                  className="flex items-center justify-between py-2 px-3 hover:shadow-sm bg-white border border-slate-100 rounded-xl transition-all duration-200 group hover:border-slate-200"
                                                >
                                                  <div className="flex items-center gap-2">
                                                    <div 
                                                      {...provided.dragHandleProps} 
                                                      className="p-1 px-1.5 text-slate-300 group-hover:text-slate-500 hover:bg-slate-50 rounded cursor-grab active:cursor-grabbing transition-colors"
                                                      title="Drag to reorder subcategory"
                                                    >
                                                      <FaGripVertical className="h-3 w-3" />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-700">{subcategory.name}</span>
                                                    <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1.5 py-0.5 rounded border border-slate-200/20">
                                                      Rank: {subcategory.displayOrder || 0}
                                                    </span>
                                                  </div>
                                                  
                                                  <div className="flex items-center gap-1.5">
                                                    <button
                                                      type="button"
                                                      onClick={() => openEditSubcategoryModal(category._id, subcategory)}
                                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-lg transition-all"
                                                      title="Edit Subcategory"
                                                    >
                                                      <FaPencilAlt className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                      type="button"
                                                      onClick={() => handleDeleteSubcategory(subcategory._id)}
                                                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-all"
                                                      title="Delete Subcategory"
                                                    >
                                                      <FaTrash className="h-3.5 w-3.5" />
                                                    </button>
                                                  </div>
                                                </li>
                                              )}
                                            </Draggable>
                                          ))}
                                          {provided.placeholder}
                                        </ul>
                                      )}
                                    </Droppable>
                                  )}
                                </div>
                              </div>
                            )}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden animate-fadeIn scale-100 my-8">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h2>
                {editingCategory && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    Modifying: <span className="font-semibold text-slate-700">{editingCategory.name}</span>
                  </p>
                )}
              </div>
              <button 
                type="button"
                onClick={closeCategoryModal} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-all hover:rotate-90 duration-200"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-slate-100 bg-slate-50/50 px-4">
              <button
                type="button"
                onClick={() => setCategoryActiveTab('general')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  categoryActiveTab === 'general'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FaFileAlt className="h-4 w-4" />
                <span>General Info</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryActiveTab('seo')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  categoryActiveTab === 'seo'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FaSearch className="h-4 w-4" />
                <span>SEO Settings</span>
              </button>
              <button
                type="button"
                onClick={() => setCategoryActiveTab('faq')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${
                  categoryActiveTab === 'faq'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FaQuestionCircle className="h-4 w-4" />
                <span>Category FAQs</span>
                {categoryFormData.faqs.length > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    categoryActiveTab === 'faq' ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {categoryFormData.faqs.length}
                  </span>
                )}
              </button>
            </div>

            {/* Form & Content Area */}
            <form onSubmit={handleCategorySubmit} className="flex flex-col flex-1 overflow-hidden">
              {error && (
                <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm flex items-center gap-2">
                  <FaInfoCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="p-6 space-y-6 overflow-y-auto flex-1 max-h-[calc(90vh-170px)]">
                {categoryActiveTab === 'general' && (
                  <div className="space-y-5">
                    {/* Category Name */}
                    <div>
                      <label htmlFor="categoryName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Category Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="categoryName"
                        value={categoryFormData.name}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-slate-50/20 transition-all font-medium text-slate-800"
                        placeholder="Enter category name (e.g. Almirahs)"
                        required
                      />
                    </div>

                    {/* Display Order */}
                    <div>
                      <label htmlFor="categoryDisplayOrder" className="block text-sm font-semibold text-slate-700 mb-1.5">
                        Display Order / Rank
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          id="categoryDisplayOrder"
                          value={categoryFormData.displayOrder}
                          onChange={(e) => setCategoryFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                          className="w-32 px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 text-center font-bold text-slate-800"
                          min="0"
                        />
                        <span className="text-xs text-slate-500">
                          Determines sorting of categories in menus (lower values appear first).
                        </span>
                      </div>
                    </div>

                    {/* Rich Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="categoryDescription" className="block text-sm font-semibold text-slate-700">
                          Rich Description
                        </label>
                        {(() => {
                          const wordCount = categoryFormData.description.split(/\s+/).filter(Boolean).length;
                          let pillColor = 'bg-slate-100 text-slate-600';
                          if (wordCount >= 200 && wordCount <= 300) {
                            pillColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                          } else if (wordCount > 0) {
                            pillColor = 'bg-amber-50 text-amber-700 border border-amber-100';
                          }
                          return (
                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all ${pillColor}`}>
                              {wordCount} words {wordCount >= 200 && wordCount <= 300 ? '✓' : '(200-300 recommended)'}
                            </span>
                          );
                        })()}
                      </div>
                      <textarea
                        id="categoryDescription"
                        value={categoryFormData.description}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 hover:bg-slate-50/20 transition-all text-slate-700 text-sm leading-relaxed"
                        placeholder="Enter detailed category description for SEO pages..."
                        rows={6}
                      />
                    </div>
                  </div>
                )}

                {categoryActiveTab === 'seo' && (
                  <div className="space-y-6">
                    {/* Meta Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-slate-700">Meta Title</label>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          getMetaTitleLength() >= 50 && getMetaTitleLength() <= 60 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {getMetaTitleLength()}/60 {getMetaTitleLength() >= 50 && getMetaTitleLength() <= 60 ? '✓' : ''}
                        </span>
                      </div>
                      <input
                        type="text"
                        value={categoryFormData.metaTitle}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 text-slate-800 text-sm font-medium"
                        placeholder="e.g. Steel Furniture | Almirahs & Wardrobes"
                        maxLength={70}
                      />
                    </div>

                    {/* Meta Description */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-slate-700">Meta Description</label>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          getMetaDescriptionLength() >= 140 && getMetaDescriptionLength() <= 160 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {getMetaDescriptionLength()}/160 {getMetaDescriptionLength() >= 140 && getMetaDescriptionLength() <= 160 ? '✓' : ''}
                        </span>
                      </div>
                      <textarea
                        value={categoryFormData.metaDescription}
                        onChange={(e) => setCategoryFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 text-slate-700 text-sm leading-relaxed"
                        rows={3}
                        placeholder="Explore premium steel furniture. Free delivery, 10-year warranty. Shop almirahs, beds, tables."
                        maxLength={180}
                      />
                    </div>

                    {/* Focus Keywords */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Focus Keywords</label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={keywordInput}
                          onChange={(e) => setKeywordInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                          className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-slate-50/50 text-sm"
                          placeholder="Type keyword and press Enter"
                        />
                        <button
                          type="button"
                          onClick={addKeyword}
                          className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-semibold flex items-center justify-center"
                        >
                          <FaPlus />
                        </button>
                      </div>
                      {categoryFormData.focusKeywords.length > 0 ? (
                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                          {categoryFormData.focusKeywords.map((keyword, index) => (
                            <span key={index} className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-100">
                              {keyword}
                              <button type="button" onClick={() => removeKeyword(index)} className="hover:text-blue-900 focus:outline-none">
                                <FaTimes className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">No focus keywords added yet</p>
                      )}
                    </div>

                    {/* Dual Keywords */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700">
                            Dual Keywords
                          </label>
                          <p className="text-xs text-slate-400 mt-0.5">Map formal search terms to local colloquial terms</p>
                        </div>
                        <button
                          type="button"
                          onClick={addDualKeyword}
                          className="text-xs px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg flex items-center gap-1.5 transition-all font-semibold"
                        >
                          <FaPlusCircle className="h-3.5 w-3.5" />
                          Add Pair
                        </button>
                      </div>
                      {categoryFormData.dualKeywords.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                          <p className="text-xs text-slate-400 italic">No keyword pairs added yet (e.g. Almirah → Daraj)</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                          {categoryFormData.dualKeywords.map((pair, index) => (
                            <div key={index} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <input
                                type="text"
                                value={pair.formal}
                                onChange={(e) => updateDualKeyword(index, 'formal', e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                                placeholder="Formal (e.g. Almirah)"
                              />
                              <span className="text-slate-400 text-xs font-semibold">→</span>
                              <input
                                type="text"
                                value={pair.colloquial}
                                onChange={(e) => updateDualKeyword(index, 'colloquial', e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-primary"
                                placeholder="Colloquial (e.g. Daraj)"
                              />
                              <button
                                type="button"
                                onClick={() => removeDualKeyword(index)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Remove Pair"
                              >
                                <FaTrash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {categoryActiveTab === 'faq' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700">Category FAQs</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Add frequently asked questions to display on the category page</p>
                      </div>
                      <button
                        type="button"
                        onClick={addFAQ}
                        className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/95 flex items-center gap-1.5 transition-all font-semibold"
                      >
                        <FaPlusCircle className="h-3.5 w-3.5" />
                        Add FAQ
                      </button>
                    </div>

                    {categoryFormData.faqs.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                        <FaQuestionCircle className="h-10 w-10 text-slate-300 mx-auto mb-2.5" />
                        <p className="text-sm font-medium text-slate-500">No FAQs Added</p>
                        <p className="text-xs text-slate-400 mt-1">FAQ schema helps boost visibility in Google search results.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                        {categoryFormData.faqs.map((faq, index) => (
                          <div key={index} className="p-4 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 transition-all flex flex-col gap-3 relative">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">
                                FAQ #{index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeFAQ(index)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                title="Remove FAQ"
                              >
                                <FaTrash className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">Question</label>
                              <input
                                type="text"
                                value={faq.question}
                                onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-slate-800 font-medium"
                                placeholder="Enter question"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold text-slate-600 mb-1">Answer</label>
                              <textarea
                                value={faq.answer}
                                onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary text-slate-700 leading-relaxed"
                                rows={3}
                                placeholder="Enter answer"
                                required
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sticky Footer */}
              <div className="flex justify-end space-x-3 px-6 py-4 border-t border-slate-100 bg-white">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 flex items-center transition-all"
                >
                  <FaCheck className="h-4 w-4 mr-2" />
                  <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {isSubcategoryModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingSubcategory ? 'Edit Subcategory' : 'Add Subcategory'}
              </h2>
              <button onClick={closeSubcategoryModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubcategorySubmit} className="p-4">
              <div className="mb-4">
                <label htmlFor="subcategoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Name *
                </label>
                <input
                  type="text"
                  id="subcategoryName"
                  value={subcategoryFormData.name}
                  onChange={(e) => setSubcategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter subcategory name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="subcategoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="subcategoryDescription"
                  value={subcategoryFormData.description}
                  onChange={(e) => setSubcategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter subcategory description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeSubcategoryModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                >
                  <FaCheck className="h-4 w-4 mr-2" />
                  {editingSubcategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

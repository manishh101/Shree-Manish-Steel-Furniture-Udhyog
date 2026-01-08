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
  FaGripVertical
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
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '', displayOrder: 0 });

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
    setCategoryFormData({ name: '', description: '', displayOrder: categories.length });
    setError('');
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      displayOrder: category.displayOrder || 0
    });
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
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {categories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No categories found. Add a new category to get started.
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="categories-list" type="category">
                {(provided) => (
                  <ul
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="divide-y divide-gray-200"
                  >
                    {categories.map((category, index) => (
                      <Draggable key={category._id} draggableId={category._id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="p-4 hover:bg-gray-50 transition-colors bg-white"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div {...provided.dragHandleProps} className="p-2 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                                  <FaGripVertical />
                                </div>
                                <button
                                  onClick={() => toggleCategoryExpansion(category._id)}
                                  className="text-gray-500 hover:text-primary"
                                >
                                  {expandedCategories[category._id] ? (
                                    <FaChevronUp className="h-5 w-5" />
                                  ) : (
                                    <FaChevronDown className="h-5 w-5" />
                                  )}
                                </button>
                                <span className="font-medium text-lg">{category.name}</span>
                                <span className="text-sm text-gray-500">
                                  ({category.subcategories?.length || 0} subcategories)
                                </span>
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded ml-2">
                                  Rank: {category.displayOrder || 0}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => openAddSubcategoryModal(category._id)}
                                  className="text-primary hover:text-primary/80 p-2"
                                  title="Add Subcategory"
                                >
                                  <FaPlusCircle className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => openEditCategoryModal(category)}
                                  className="text-primary hover:text-primary/80 p-2"
                                  title="Edit Category"
                                >
                                  <FaPencilAlt className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCategory(category._id)}
                                  className="text-red-600 hover:text-red-800 p-2"
                                  title="Delete Category"
                                >
                                  <FaTrash className="h-5 w-5" />
                                </button>
                              </div>
                            </div>

                            {/* Subcategories */}
                            {expandedCategories[category._id] && (
                              <div className="mt-3 ml-12 border-l-2 border-gray-200 pl-4">
                                {category.subcategories && category.subcategories.length === 0 ? (
                                  <p className="text-sm text-gray-500 italic py-2">No subcategories</p>
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
                                                className="flex items-center justify-between py-2 px-2 hover:bg-gray-100 rounded transition-colors group bg-white border border-transparent hover:border-gray-200"
                                              >
                                                <div className="flex items-center">
                                                  <div {...provided.dragHandleProps} className="p-1 px-2 text-gray-300 group-hover:text-gray-500 cursor-grab active:cursor-grabbing">
                                                    <FaGripVertical className="h-3 w-3" />
                                                  </div>
                                                  <span className="text-sm font-medium">{subcategory.name}</span>
                                                  <span className="ml-2 text-[10px] bg-gray-200 text-gray-600 px-1.5 rounded">
                                                    {subcategory.displayOrder || 0}
                                                  </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  <button
                                                    onClick={() => openEditSubcategoryModal(category._id, subcategory)}
                                                    className="text-primary hover:text-primary/80 p-1"
                                                    title="Edit Subcategory"
                                                  >
                                                    <FaPencilAlt className="h-4 w-4" />
                                                  </button>
                                                  <button
                                                    onClick={() => handleDeleteSubcategory(subcategory._id)}
                                                    className="text-red-600 hover:text-red-800 p-1"
                                                    title="Delete Subcategory"
                                                  >
                                                    <FaTrash className="h-4 w-4" />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button onClick={closeCategoryModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-4">
              <div className="mb-4">
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter category name"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="categoryDescription"
                  value={categoryFormData.description}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Enter category description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeCategoryModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                >
                  <FaCheck className="h-4 w-4 mr-2" />
                  {editingCategory ? 'Update' : 'Create'}
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

'use client';

import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaTimes, FaSave, FaTrash, FaEdit, FaSpinner, 
  FaCheckCircle, FaExclamationTriangle, FaSearch, FaEye, 
  FaUpload, FaNewspaper, FaTags, FaClock, FaCheck, FaTimesCircle 
} from 'react-icons/fa';
import Link from 'next/link';
import { blogsAPI, Blog } from '@/services/api';

const AdminBlogs = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    readTime: 5,
    tags: '',
    status: 'draft' as 'draft' | 'published',
    metaTitle: '',
    metaDescription: ''
  });
  
  const [status, setStatus] = useState({ show: false, success: false, message: '' });
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    loadBlogs();
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!editingBlog && formData.title) {
      const generatedSlug = formData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.title, editingBlog]);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      // Fetch all posts (including drafts since we are admin)
      const response = await blogsAPI.getAll({ status: 'all' });
      if (response.success) {
        setBlogs(response.blogs);
      }
    } catch (error) {
      console.error('Error loading blogs:', error);
      showStatus('Failed to load blog posts', false);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (message: string, success: boolean) => {
    setStatus({ show: true, success, message });
    setTimeout(() => {
      setStatus(prev => ({ ...prev, show: false }));
    }, 4500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showStatus('Please select an image file', false);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showStatus('Image size must be less than 5MB', false);
      return;
    }

    setUploadingImage(true);
    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      uploadData.append('folder', 'manish-steel/blogs');

      const token = localStorage.getItem('token');
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: uploadData,
      });

      const result = await response.json();
      if (response.ok && result.url) {
        setFormData(prev => ({ ...prev, image: result.url }));
        showStatus('Image uploaded successfully', true);
      } else {
        showStatus(result.error || 'Failed to upload image', false);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showStatus('Failed to upload image', false);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.excerpt.trim() || !formData.content.trim()) {
      showStatus('Title, excerpt, and content are required', false);
      return;
    }

    try {
      setSaving(true);
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      const payload = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        image: formData.image,
        readTime: Number(formData.readTime) || 5,
        tags: tagsArray,
        status: formData.status,
        metaTitle: formData.metaTitle || formData.title,
        metaDescription: formData.metaDescription || formData.excerpt
      };

      if (editingBlog) {
        // Update existing blog
        const response = await blogsAPI.update(editingBlog._id, payload);
        if (response.success) {
          setBlogs(blogs.map(b => b._id === editingBlog._id ? response.blog : b));
          showStatus('Blog post updated successfully', true);
          resetForm();
        }
      } else {
        // Create new blog
        const response = await blogsAPI.create(payload);
        if (response.success) {
          setBlogs([response.blog, ...blogs]);
          showStatus('Blog post created successfully', true);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      showStatus('Failed to save blog post', false);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.image || '',
      readTime: blog.readTime || 5,
      tags: blog.tags ? blog.tags.join(', ') : '',
      status: blog.status || 'draft',
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || ''
    });
    setIsEditing(true);
    setActiveTab('edit');
  };

  const handleDelete = async (blogId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this blog post?')) {
      return;
    }

    try {
      const response = await blogsAPI.delete(blogId);
      if (response.success) {
        setBlogs(blogs.filter(b => b._id !== blogId));
        showStatus('Blog post deleted successfully', true);
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      showStatus('Failed to delete blog post', false);
    }
  };

  const handleToggleStatus = async (blog: Blog) => {
    const newStatus = blog.status === 'published' ? 'draft' : 'published';
    try {
      const response = await blogsAPI.update(blog._id, { status: newStatus });
      if (response.success) {
        setBlogs(blogs.map(b => b._id === blog._id ? response.blog : b));
        showStatus(`Blog post ${newStatus === 'published' ? 'published' : 'saved to drafts'} successfully`, true);
      }
    } catch (error) {
      console.error('Error toggling blog status:', error);
      showStatus('Failed to change blog post status', false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      readTime: 5,
      tags: '',
      status: 'draft',
      metaTitle: '',
      metaDescription: ''
    });
    setEditingBlog(null);
    setIsEditing(false);
    setActiveTab('edit');
  };

  const filteredBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-150">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FaNewspaper className="text-primary" /> Blog & Articles Manager
            </h1>
            <p className="text-sm text-gray-500 mt-1">Write high-converting content marketing articles to boost SEO visibility in Biratnagar & across Nepal</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/95 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow"
            >
              <FaPlus className="h-4 w-4" /> Add Blog Post
            </button>
          )}
        </div>

        {/* Status Messages */}
        {status.show && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 border ${
            status.success 
              ? 'bg-green-50 text-green-700 border-green-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {status.success ? (
              <FaCheckCircle className="h-5 w-5 flex-shrink-0 text-green-600" />
            ) : (
              <FaExclamationTriangle className="h-5 w-5 flex-shrink-0 text-red-600" />
            )}
            <span className="font-medium text-sm">{status.message}</span>
          </div>
        )}

        {/* Add/Edit Form Panel */}
        {isEditing && (
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 mb-8 shadow-inner">
            <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
              <h3 className="text-lg font-bold text-gray-800">
                {editingBlog ? 'Edit Blog Article' : 'Write New Blog Article'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 bg-white p-2 rounded-full shadow border transition-colors"
                aria-label="Cancel"
              >
                <FaTimes className="h-4 w-4" />
              </button>
            </div>

            {/* Editing / Preview Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('edit')}
                className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all ${
                  activeTab === 'edit'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-850'
                }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`py-2 px-4 font-semibold text-sm border-b-2 transition-all ${
                  activeTab === 'preview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-850'
                }`}
              >
                Live Preview
              </button>
            </div>

            {activeTab === 'edit' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Core Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-750 mb-1.5">
                        Article Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-850 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="e.g., Best Steel Almirah Designs in Biratnagar"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-750 mb-1.5">
                        URL Slug <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-850 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="best-steel-almirah-designs-biratnagar"
                        required
                      />
                      <p className="text-xs text-gray-450 mt-1">This will be the web address: /blogs/your-slug</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-750 mb-1.5">
                          Read Time (mins)
                        </label>
                        <div className="relative">
                          <FaClock className="absolute left-3.5 top-3.5 text-gray-400" />
                          <input
                            type="number"
                            name="readTime"
                            value={formData.readTime}
                            onChange={handleInputChange}
                            min="1"
                            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 bg-white text-gray-850 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-750 mb-1.5">
                          Publish Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-850 font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        >
                          <option value="draft">Draft (Hidden)</option>
                          <option value="published">Published (Live)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-750 mb-1.5">
                        Tags (Comma separated)
                      </label>
                      <div className="relative">
                        <FaTags className="absolute left-3.5 top-3.5 text-gray-400" />
                        <input
                          type="text"
                          name="tags"
                          value={formData.tags}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 bg-white text-gray-850 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          placeholder="e.g., Almirah, Steel Furniture, Home Decor"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Image and SEO */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-750 mb-1.5">
                        Cover Image
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="text"
                          name="image"
                          value={formData.image}
                          onChange={handleInputChange}
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-850 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                          placeholder="Paste image URL or upload file →"
                        />
                        <label className="bg-white hover:bg-gray-100 border border-gray-300 px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm font-medium">
                          {uploadingImage ? (
                            <FaSpinner className="animate-spin text-primary" />
                          ) : (
                            <FaUpload className="text-gray-500" />
                          )}
                          <span>Upload</span>
                          <input
                            type="file"
                            onChange={handleImageUpload}
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                      </div>
                      
                      {formData.image && (
                        <div className="mt-3 relative rounded-lg overflow-hidden border border-gray-200 aspect-[2/1] bg-gray-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={formData.image} 
                            alt="Cover preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                            className="absolute top-2 right-2 bg-black/75 hover:bg-black text-white p-1.5 rounded-full transition-colors"
                          >
                            <FaTimes className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* SEO Collapsible Section */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                      <h4 className="text-sm font-bold text-blue-900">SEO Custom Meta Tags (Google Search Optimizations)</h4>
                      
                      <div>
                        <label className="block text-xs font-semibold text-blue-800 mb-1">
                          Meta Title (Title shown in Google results)
                        </label>
                        <input
                          type="text"
                          name="metaTitle"
                          value={formData.metaTitle}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-850 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                          placeholder="Leave blank to use article title"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-blue-800 mb-1">
                          Meta Description (Snippet shown in Google results)
                        </label>
                        <textarea
                          name="metaDescription"
                          value={formData.metaDescription}
                          onChange={handleInputChange}
                          rows={2}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-850 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none"
                          placeholder="Leave blank to use excerpt"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-semibold text-gray-750 mb-1.5">
                    Excerpt / Brief Summary <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white text-gray-850 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Provide a compelling 1-2 sentence description that hooks readers and search engines..."
                    required
                  />
                </div>

                {/* Article Content */}
                <div>
                  <label className="block text-sm font-semibold text-gray-750 mb-1.5">
                    Article Body Content <span className="text-red-500">*</span> (HTML or Rich Text)
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={12}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-850 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Write your article here. You can use standard HTML tags (e.g. <h2>, <p>, <strong>, <ul>, <li>) for layout formatting."
                    required
                  />
                  <p className="text-xs text-gray-450 mt-1">{"Tip: Use headings (<h2>, <h3>) and paragraph (<p>) tags to ensure structured SEO hierarchy."}</p>
                </div>

                {/* Save Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 border border-gray-350 rounded-lg text-gray-700 bg-white hover:bg-gray-100 font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 font-semibold transition-all shadow shadow-primary/25 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <FaSpinner className="animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <FaSave /> {editingBlog ? 'Update Article' : 'Publish Article'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Live Preview Mode */
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 space-y-6 max-w-4xl mx-auto">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                      Preview
                    </span>
                    <span className="text-sm text-gray-500 flex items-center gap-1.5">
                      <FaClock /> {formData.readTime} min read
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
                    {formData.title || 'Untitled Article'}
                  </h1>
                  
                  {formData.tags && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.split(',').map((tag, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-650 px-2.5 py-0.5 rounded text-xs font-semibold">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-3 border-y border-gray-100 py-3 mt-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                      SM
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Shree Manish Steel Furniture</p>
                      <p className="text-xs text-gray-500">Author • Biratnagar, Nepal</p>
                    </div>
                  </div>
                </div>

                {formData.image && (
                  <div className="rounded-xl overflow-hidden border border-gray-150 aspect-[2/1] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={formData.image} 
                      alt={formData.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <p className="text-lg font-medium text-gray-650 italic leading-relaxed border-l-4 border-accent pl-4 py-1">
                  {formData.excerpt || 'No excerpt summary provided yet.'}
                </p>

                <div 
                  className="prose prose-blue max-w-none text-gray-800 leading-relaxed space-y-4"
                  dangerouslySetInnerHTML={{ __html: formData.content || '<p className="text-gray-450 italic">Write content to see HTML preview here...</p>' }}
                />
              </div>
            )}
          </div>
        )}

        {/* Filters and Searches (When not editing) */}
        {!isEditing && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <FaSearch className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles by title or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-gray-50 hover:bg-gray-100/50"
                />
              </div>
            </div>

            {/* List Table */}
            {filteredBlogs.length === 0 ? (
              <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <FaNewspaper className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <h3 className="text-lg font-bold text-gray-700">No blog posts found</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">Start writing informative articles to drive local organic queries and capture commercial interest.</p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-primary/95 transition-colors shadow-sm"
                >
                  <FaPlus className="h-3.5 w-3.5" /> Write First Article
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Article</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Slug</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Read Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date Created</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBlogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border flex-shrink-0">
                              {blog.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/5 text-primary">
                                  <FaNewspaper className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="max-w-xs md:max-w-sm truncate">
                              <div className="font-bold text-gray-900 truncate" title={blog.title}>{blog.title}</div>
                              <div className="text-xs text-gray-500 truncate" title={blog.excerpt}>{blog.excerpt}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                          /{blog.slug}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(blog)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
                              blog.status === 'published'
                                ? 'bg-green-55/10 text-green-700 hover:bg-green-100 border border-green-200/50'
                                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-250/50'
                            }`}
                            title={`Click to ${blog.status === 'published' ? 'revert to Draft' : 'Publish'}`}
                          >
                            {blog.status === 'published' ? (
                              <>
                                <FaCheck className="w-2.5 h-2.5" /> Published
                              </>
                            ) : (
                              <>
                                <FaTimesCircle className="w-2.5 h-2.5" /> Draft
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-650">
                          {blog.readTime || 5} mins
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(blog.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold space-x-2">
                          <Link
                            href={`/blogs/${blog.slug}`}
                            target="_blank"
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                            title="View Public Post"
                          >
                            <FaEye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleEdit(blog)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                            title="Edit Post"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(blog._id)}
                            className="inline-flex items-center justify-center p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="Delete Post"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminBlogs;

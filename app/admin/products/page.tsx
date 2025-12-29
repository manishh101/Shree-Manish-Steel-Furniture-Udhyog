'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { productAPI, Product } from '@/services/api';
import OptimizedImage from '@/components/common/OptimizedImage';
import ProductFormEnhanced from '@/components/admin/ProductFormEnhanced';
import { 
  FaPencilAlt, 
  FaTrash, 
  FaPlusCircle, 
  FaTimes,
  FaStar,
  FaSync,
  FaImage
} from 'react-icons/fa';

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('🔄 Admin loading products...');
      
      const response = await productAPI.getAll(1, 1000);
      
      // Handle different response structures
      let productsData: Product[] = [];
      if (Array.isArray(response)) {
        productsData = response;
      } else if (response?.products && Array.isArray(response.products)) {
        productsData = response.products;
      }
      
      console.log(`✅ Admin loaded ${productsData.length} products`);
      setProducts(productsData);
      
      if (productsData.length === 0) {
        setError('No products found. The database might be empty or there could be a connection issue.');
      }
    } catch (err) {
      console.error('❌ Admin products loading error:', err);
      setError(`Failed to load products: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openAddModal = () => {
    console.log('Opening add modal');
    setEditingProduct(null);
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    console.log('Opening edit modal for product:', product);
    setEditingProduct(product);
    setError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    setEditingProduct(null);
    setError('');
  };

  const handleSave = () => {
    console.log('Product saved, reloading products');
    loadProducts();
    closeModal();
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productAPI.delete(productId);
        console.log(`Successfully deleted product with ID: ${productId}`);
        await loadProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
        setError(`Failed to delete product: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }
  };

  const handleFeaturedToggle = async (productId: string, currentFeaturedStatus: boolean) => {
    try {
      const newFeaturedStatus = !currentFeaturedStatus;
      await productAPI.updateFeaturedStatus(productId, newFeaturedStatus);
      console.log(`Updated featured status for product ${productId} to ${newFeaturedStatus}`);
      
      setProducts(prev => prev.map(product => 
        product._id === productId 
          ? { ...product, featured: newFeaturedStatus }
          : product
      ));
    } catch (err) {
      console.error('Error updating featured status:', err);
      setError(`Failed to update featured status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleMostSellingToggle = async (productId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await productAPI.updateMostSellingStatus(productId, newStatus);
      console.log(`Updated most selling status for product ${productId} to ${newStatus}`);
      
      setProducts(prev => prev.map(product => 
        product._id === productId 
          ? { ...product, isMostSelling: newStatus }
          : product
      ));
    } catch (err) {
      console.error('Error updating most selling status:', err);
      setError(`Failed to update most selling status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleTopProductToggle = async (productId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await productAPI.updateTopProductStatus(productId, newStatus);
      console.log(`Updated top product status for product ${productId} to ${newStatus}`);
      
      setProducts(prev => prev.map(product => 
        product._id === productId 
          ? { ...product, isTopProduct: newStatus }
          : product
      ));
    } catch (err) {
      console.error('Error updating top product status:', err);
      setError(`Failed to update top product status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCategoryThumbnailToggle = async (productId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await productAPI.updateCategoryThumbnailStatus(productId, newStatus);
      console.log(`Updated category thumbnail status for product ${productId} to ${newStatus}`);
      
      // Reload products to ensure consistency
      await loadProducts();
    } catch (err) {
      console.error('Error updating category thumbnail status:', err);
      setError(`Failed to update category thumbnail status: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const getCategoryDisplay = (product: Product) => {
    let display = product.category || 'Uncategorized';
    if (product.subcategory) {
      display += ` > ${product.subcategory}`;
    }
    return display;
  };

  // Test API connection function
  const testConnection = async () => {
    try {
      console.log('🔍 Testing API connection...');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      console.log('✅ API Connection Test Success:', data);
      alert(`✅ API Connection Success!\nStatus: ${data.status}\nTime: ${data.timestamp}`);
    } catch (error) {
      console.error('❌ API Connection Test Failed:', error);
      alert(`❌ API Connection Failed!\nError: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease ensure the backend server is running.`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-primary">Manage Products</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={testConnection}
            className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm"
            title="Test backend connection"
          >
            🔗 Test API
          </button>
          <button 
            onClick={loadProducts}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center text-sm"
            disabled={loading}
          >
            <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={openAddModal}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center flex-1 sm:flex-none"
          >
            <FaPlusCircle className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[30vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Mobile card view */}
          <div className="lg:hidden space-y-3">
            {products.map((product) => (
              <div key={product._id} className="bg-white shadow rounded-lg p-4">
                <div className="flex items-start">
                  <OptimizedImage 
                    src={product.image || ''} 
                    alt={product.name}
                    className="h-16 w-16 rounded-md object-cover mr-3"
                    width={64}
                    height={64}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">
                      {getCategoryDisplay(product)}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {product.isMostSelling && (
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Most Selling
                        </span>
                      )}
                      {product.isTopProduct && (
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          Top Product
                        </span>
                      )}
                      {product.usedAsCategoryThumbnail && (
                        <span className="inline-flex px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Category Image
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-3 mt-2">
                      <button 
                        onClick={() => openEditModal(product)} 
                        className="bg-blue-50 text-blue-600 p-2 rounded-md hover:bg-blue-100"
                      >
                        <FaPencilAlt className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product._id)} 
                        className="bg-red-50 text-red-600 p-2 rounded-md hover:bg-red-100"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleCategoryThumbnailToggle(product._id, product.usedAsCategoryThumbnail || false)} 
                        className={`p-2 rounded-md ${
                          product.usedAsCategoryThumbnail 
                            ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                        title={product.usedAsCategoryThumbnail ? 'Remove as Category Image' : 'Use as Category Image'}
                      >
                        <FaImage className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {products.length === 0 && (
              <div className="bg-white shadow rounded-lg p-4 text-center text-gray-500">
                No products found. Add a new product to get started.
              </div>
            )}
          </div>
          
          {/* Desktop table view */}
          <div className="hidden lg:block bg-white rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Homepage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <OptimizedImage 
                        src={product.image || ''} 
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover"
                        width={40}
                        height={40}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCategoryDisplay(product)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleFeaturedToggle(product._id, product.featured || false)}
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          product.featured
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        <FaStar 
                          className={`h-3 w-3 mr-1 ${product.featured ? 'text-yellow-600' : 'text-gray-400'}`} 
                        />
                        {product.featured ? 'Featured' : 'Regular'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleMostSellingToggle(product._id, product.isMostSelling || false)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                            product.isMostSelling
                              ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={product.isMostSelling ? 'Remove from Most Selling' : 'Add to Most Selling'}
                        >
                          {product.isMostSelling ? '✓ Most Selling' : 'Most Selling'}
                        </button>
                        <button
                          onClick={() => handleTopProductToggle(product._id, product.isTopProduct || false)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                            product.isTopProduct
                              ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={product.isTopProduct ? 'Remove from Top Products' : 'Add to Top Products'}
                        >
                          {product.isTopProduct ? '✓ Top Product' : 'Top Product'}
                        </button>
                        <button
                          onClick={() => handleCategoryThumbnailToggle(product._id, product.usedAsCategoryThumbnail || false)}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                            product.usedAsCategoryThumbnail
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={product.usedAsCategoryThumbnail ? 'Remove as Category Image' : 'Use as Category Image'}
                        >
                          {product.usedAsCategoryThumbnail ? '✓ Category Image' : 'Category Image'}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button onClick={() => openEditModal(product)} className="text-primary hover:text-primary/80 mr-3">
                        <FaPencilAlt className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:text-red-800">
                        <FaTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No products found. Add a new product to get started.
                    </td>
                  </tr> 
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start z-50 p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl my-2">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-lg sm:text-xl font-bold text-primary">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            
            <div className="p-4 sm:p-6">
              <ProductFormEnhanced 
                product={editingProduct}
                onSave={handleSave}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;

/**
 * API Service for Next.js
 * Centralized API calls using fetch
 */

// Use absolute URL for server-side fetching, otherwise use relative URL for client-side
const API_BASE_URL = typeof window === 'undefined'
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api`
  : '/api';

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function fetchAPI<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...fetchOptions } = options;

  let url = `${API_BASE_URL}${endpoint}`;

  // Add query parameters
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth Token Helper
function getAuthHeader(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Product Types
export interface Product {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  image?: string | null;
  images?: string[];
  category?: string;
  categoryId?: string;
  subcategory?: string;
  subcategoryId?: string;
  price?: number;
  featured?: boolean;
  isMostSelling?: boolean;
  isTopProduct?: boolean;
  isAvailable?: boolean;
  usedAsCategoryThumbnail?: boolean;
  salesCount?: number;
  inStock?: boolean;
  specifications?: Record<string, string> | Array<{ label: string; value: string }>;
  features?: string[];
  material?: string;
  finish?: string;
  weight?: string;
  colors?: string[];
  dimensions?: {
    length?: string | number;
    width?: string | number;
    height?: string | number;
  };
  deliveryInformation?: {
    estimatedDelivery?: string;
    shippingCost?: string;
    availableLocations?: string[];
    specialInstructions?: string;
  };
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown; // Index signature for additional properties
}

export interface ProductsResponse {
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
}

// Category Types
export interface Subcategory {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  categoryId?: string;
  parentId?: string;
  category?: string | { _id: string; name: string };
  displayOrder?: number;
}

export interface Category {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  image?: string;
  displayOrder?: number;
  subcategories?: Subcategory[];
}

// Inquiry Types
export interface Inquiry {
  _id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  category: 'product' | 'service' | 'support' | 'business' | 'general';
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
  productId?: string;
}

export interface InquiriesResponse {
  inquiries: Inquiry[];
  totalPages: number;
  currentPage: number;
  totalInquiries: number;
}

// Custom Order Types
export interface CustomOrder {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  productType: 'household' | 'office' | 'wood' | 'other' | 'steel';
  dimensions?: {
    width?: string;
    height?: string;
    depth?: string;
  };
  color?: string;
  budget?: string;
  requirements: string;
  status: 'new' | 'in-progress' | 'quoted' | 'approved' | 'manufacturing' | 'completed' | 'delivered' | 'cancelled';
  adminNotes?: string;
  quotedPrice?: number;
  quotedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// Product API
export const productAPI = {
  getAll: (page = 1, limit = 100, params: Record<string, unknown> = {}) =>
    fetchAPI<ProductsResponse>('/products', { params: { page, limit, ...params } }),

  getById: (id: string) =>
    fetchAPI<Product>(`/products/${id}`),

  getByCategory: (category: string, options: { subcategory?: string; limit?: number } = {}) =>
    fetchAPI<ProductsResponse>('/products/filter', {
      params: {
        category,
        // Only include all subcategories if no specific subcategory is selected
        ...(options.subcategory ? { subcategory: options.subcategory } : { includeAllSubcategories: true }),
        limit: options.limit || 100
      }
    }),

  getByCategoryAlternative: (category: string, options: { subcategory?: string; limit?: number; timestamp?: number } = {}) =>
    fetchAPI<ProductsResponse>('/products/filter', {
      params: {
        category,
        subcategory: options.subcategory,
        limit: options.limit || 100,
        timestamp: options.timestamp
      }
    }),

  getProductsByCategory: (category: string, options: { limit?: number } = {}) =>
    fetchAPI<ProductsResponse>('/products/filter', {
      params: {
        category,
        includeAllSubcategories: true,
        limit: options.limit || 1000
      }
    }),

  getFeatured: (limit = 6) =>
    fetchAPI<{ products: Product[] }>('/products/featured', { params: { limit } }),

  getMostSelling: (limit = 6) =>
    fetchAPI<{ products: Product[] }>('/products/most-selling', { params: { limit } }),

  getTopProducts: (limit = 6) =>
    fetchAPI<{ products: Product[] }>('/products/top-products', { params: { limit } }),

  search: (query: string) =>
    fetchAPI<ProductsResponse>('/products', { params: { search: query, limit: 100 } }),

  create: (data: Record<string, unknown>) =>
    fetchAPI<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),

  update: (id: string, data: Record<string, unknown>) =>
    fetchAPI<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }),

  updateFeaturedStatus: (id: string, featured: boolean) =>
    fetchAPI<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ featured }),
      headers: getAuthHeader()
    }),

  updateMostSellingStatus: (id: string, isMostSelling: boolean) =>
    fetchAPI<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isMostSelling }),
      headers: getAuthHeader()
    }),

  updateTopProductStatus: (id: string, isTopProduct: boolean) =>
    fetchAPI<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ isTopProduct }),
      headers: getAuthHeader()
    }),

  updateCategoryThumbnailStatus: (id: string, usedAsCategoryThumbnail: boolean) =>
    fetchAPI<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ usedAsCategoryThumbnail }),
      headers: getAuthHeader()
    }),
};

// Category API
export const categoryAPI = {
  getAll: (detailed = false) =>
    fetchAPI<Category[]>('/categories', { params: { detailed } }),

  getById: (id: string, withSubcategories = false) =>
    fetchAPI<Category>(`/categories/${id}`, { params: { subcategories: withSubcategories } }),

  create: (data: { name: string; description?: string; image?: string; displayOrder?: number }) =>
    fetchAPI<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),

  update: (id: string, data: { name?: string; description?: string; image?: string; displayOrder?: number }) =>
    fetchAPI<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }),
};

// Subcategory API
export const subcategoryAPI = {
  getAll: () =>
    fetchAPI<Subcategory[]>('/subcategories'),

  getByCategoryId: (categoryId: string) =>
    fetchAPI<Subcategory[]>('/subcategories', { params: { categoryId } }),

  create: (data: { name: string; categoryId: string; description?: string; displayOrder?: number }) =>
    fetchAPI<Subcategory>('/subcategories', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),

  update: (id: string, data: { name?: string; categoryId?: string; description?: string; displayOrder?: number }) =>
    fetchAPI<Subcategory>(`/subcategories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/subcategories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }),
};

// Inquiry API
export const inquiryAPI = {
  create: (data: Omit<Inquiry, '_id' | 'status' | 'createdAt'>) =>
    fetchAPI<Inquiry>('/inquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getAll: (page = 1, limit = 10, status?: string, search?: string) =>
    fetchAPI<InquiriesResponse>('/inquiries', {
      params: { page, limit, status, search },
      headers: getAuthHeader()
    }),

  getById: (id: string) =>
    fetchAPI<Inquiry>(`/inquiries/${id}`, {
      headers: getAuthHeader()
    }),

  updateStatus: (id: string, status: string) =>
    fetchAPI<Inquiry>(`/inquiries/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: getAuthHeader()
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/inquiries/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }),
};

// Custom Order API
export const customOrderAPI = {
  create: (data: Omit<CustomOrder, '_id' | 'status' | 'createdAt'>) =>
    fetchAPI<CustomOrder>('/custom-orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getAll: (page = 1, status?: string) =>
    fetchAPI<{ orders: CustomOrder[]; totalPages: number }>('/custom-orders', {
      params: { page, status: status !== 'all' ? status : undefined },
      headers: getAuthHeader()
    }),

  getById: (id: string) =>
    fetchAPI<CustomOrder>(`/custom-orders/${id}`, {
      headers: getAuthHeader()
    }),

  updateStatus: (id: string, status: string) =>
    fetchAPI<CustomOrder>(`/custom-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
      headers: getAuthHeader()
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/custom-orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }),
};

// About API
export interface AboutSection {
  title?: string;
  description?: string;
  content?: string;
}

export interface CoreValue {
  _id?: string;
  icon?: string;
  title: string;
  description: string;
}

export interface AboutData {
  _id?: string;
  heroTitle?: string;
  heroDescription?: string;
  storyTitle?: string;
  storyImage?: string;
  storyContent?: string[];
  yearsExperience?: string;
  happyCustomers?: string;
  vision?: string;
  mission?: string;
  coreValues?: CoreValue[];
  workshopTitle?: string;
  workshopDescription?: string;
  workshopImages?: string[];
}

export interface AboutContent {
  hero?: AboutSection;
  story?: AboutSection;
  mission?: AboutSection;
  vision?: AboutSection;
  coreValues?: CoreValue[];
  workshopImages?: string[];
}

export const aboutAPI = {
  getContent: () =>
    fetchAPI<{ success: boolean; data: AboutData }>('/about'),

  updateContent: (data: Partial<AboutData>) =>
    fetchAPI<{ success: boolean; data: AboutData; message?: string }>('/about', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),

  updateSection: (section: string, data: Partial<AboutData>) =>
    fetchAPI<{ success: boolean; data: AboutData }>(`/about/section/${section}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),

  updateCoreValue: (valueId: string, data: Partial<CoreValue>) =>
    fetchAPI<{ success: boolean }>(`/about/core-value/${valueId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),

  addCoreValue: (data: Partial<CoreValue>) =>
    fetchAPI<{ success: boolean; data: CoreValue }>('/about/core-value', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),

  deleteCoreValue: (valueId: string) =>
    fetchAPI<{ success: boolean }>(`/about/core-value/${valueId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }),

  uploadWorkshopImage: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/about/workshop-images`, {
      method: 'POST',
      body: formData,
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },

  deleteWorkshopImage: (imageUrl: string) =>
    fetchAPI<{ success: boolean }>('/about/workshop-images', {
      method: 'DELETE',
      body: JSON.stringify({ imageUrl }),
      headers: getAuthHeader()
    }),
};

// Gallery API
export interface GalleryImage {
  _id: string;
  id?: string;
  url: string;
  title?: string;
  description?: string;
  category?: string;
  order?: number;
  featured?: boolean;
  tags?: string[];
  alt?: string;
  sectionId?: string;
  sectionName?: string;
}

export interface GallerySection {
  _id: string;
  id?: string;
  name: string;
  description?: string;
  images: GalleryImage[];
  order?: number;
  active?: boolean;
  featured?: boolean;
  category?: string;
  tags?: string[];
}

export interface GalleryConfig {
  title?: string;
  subtitle?: string;
  heroImage?: string | null;
  showFilters?: boolean;
  showStats?: boolean;
  layout?: string;
  featuredSectionsOnHomepage?: boolean;
  testimonialSlider?: boolean;
  metaDescription?: string;
  itemsPerPage?: number;
}

export const galleryAPI = {
  // Sections
  getSections: () =>
    fetchAPI<{ sections: GallerySection[] } | GallerySection[]>('/gallery/sections'),

  getSection: (sectionId: string) =>
    fetchAPI<GallerySection>(`/gallery/sections/${sectionId}`),

  createSection: (sectionData: Partial<GallerySection>) =>
    fetchAPI<GallerySection>('/gallery/sections', {
      method: 'POST',
      body: JSON.stringify(sectionData),
      headers: getAuthHeader()
    }),

  updateSection: (sectionId: string, sectionData: Partial<GallerySection>) =>
    fetchAPI<GallerySection>(`/gallery/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(sectionData),
      headers: getAuthHeader()
    }),

  deleteSection: (sectionId: string) =>
    fetchAPI<{ message: string }>(`/gallery/sections/${sectionId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }),

  reorderSections: (sectionIds: string[]) =>
    fetchAPI<{ message: string }>('/gallery/sections/reorder', {
      method: 'PUT',
      body: JSON.stringify({ sectionIds }),
      headers: getAuthHeader()
    }),

  // Images within sections
  addImageToSection: async (sectionId: string, imageData: FormData | Partial<GalleryImage>) => {
    if (imageData instanceof FormData) {
      const response = await fetch(`${API_BASE_URL}/gallery/sections/${sectionId}/images`, {
        method: 'POST',
        body: imageData,
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error('Failed to upload image');
      return response.json();
    }
    return fetchAPI<GalleryImage>(`/gallery/sections/${sectionId}/images`, {
      method: 'POST',
      body: JSON.stringify(imageData),
      headers: getAuthHeader()
    });
  },

  updateImageInSection: (sectionId: string, imageId: string, imageData: Partial<GalleryImage>) =>
    fetchAPI<GalleryImage>(`/gallery/sections/${sectionId}/images/${imageId}`, {
      method: 'PUT',
      body: JSON.stringify(imageData),
      headers: getAuthHeader()
    }),

  deleteImageFromSection: (sectionId: string, imageId: string) =>
    fetchAPI<{ message: string }>(`/gallery/sections/${sectionId}/images/${imageId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    }),

  // Config
  getConfig: () =>
    fetchAPI<GalleryConfig>('/gallery/config'),

  updateConfig: (config: Partial<GalleryConfig>) =>
    fetchAPI<GalleryConfig>('/gallery/config', {
      method: 'PUT',
      body: JSON.stringify(config),
      headers: getAuthHeader()
    }),

  // Upload image
  uploadImage: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/gallery/upload`, {
      method: 'POST',
      body: formData,
      headers: getAuthHeader()
    });
    if (!response.ok) throw new Error('Failed to upload image');
    return response.json();
  },
};

// Auth API
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      name?: string;
      email?: string;
      phone?: string;
      role: string;
    };
  };
}

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetchAPI<LoginResponse>('/auth', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    // Return in a format the login page expects
    return {
      token: response.data.token,
      user: response.data.user
    };
  },

  getCurrentUser: () =>
    fetchAPI<{ user: { id: string; phone: string; role: string } }>('/auth', {
      headers: getAuthHeader()
    }),
};

// Health Check
export const healthAPI = {
  check: () =>
    fetchAPI<{ status: string; message: string }>('/health'),
};

// Search API
export const searchAPI = {
  /**
   * Search products by query
   */
  searchProducts: (query: string, options: { limit?: number; page?: number; filters?: Record<string, unknown> } = {}) =>
    fetchAPI<ProductsResponse>('/products', {
      params: {
        search: query,
        limit: options.limit || 50,
        page: options.page || 1,
        ...options.filters
      }
    }),

  /**
   * Get search suggestions/autocomplete
   */
  getSuggestions: async (query: string, limit: number = 8): Promise<{ data: { suggestions: string[]; totalProducts?: number } }> => {
    if (!query || query.trim().length < 2) {
      return { data: { suggestions: [] } };
    }

    try {
      // Get products that match the query
      const response = await fetchAPI<ProductsResponse>('/products/filter', {
        params: {
          search: query.trim(),
          limit: limit * 2 // Get more products to generate better suggestions
        }
      });

      const products = response?.products || [];

      // Extract unique suggestions from product names, categories, and subcategories
      const suggestions = new Set<string>();
      const queryLower = query.toLowerCase().trim();

      products.forEach(product => {
        // Product name suggestions
        const nameWords = product.name.toLowerCase().split(/\s+/);
        nameWords.forEach(word => {
          if (word.startsWith(queryLower) && word !== queryLower) {
            suggestions.add(word);
          }
        });

        // Category suggestions
        if (product.category && product.category.toLowerCase().includes(queryLower)) {
          suggestions.add(product.category);
        }

        // Subcategory suggestions
        if (product.subcategory && product.subcategory.toLowerCase().includes(queryLower)) {
          suggestions.add(product.subcategory);
        }
      });

      // Convert to array and limit
      const suggestionsList = Array.from(suggestions).slice(0, limit);

      return {
        data: {
          suggestions: suggestionsList,
          totalProducts: products.length
        }
      };
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      return { data: { suggestions: [] } };
    }
  },

  /**
   * Get popular search terms (based on product names and categories)
   */
  getPopularSearchTerms: async (limit: number = 10): Promise<{ data: { popularTerms: string[]; totalProducts?: number } }> => {
    try {
      // Get a sample of popular products to extract common terms
      const response = await fetchAPI<ProductsResponse>('/products', {
        params: {
          limit: 100,
          sortBy: 'featured' // Get featured/popular products
        }
      });

      const products = response?.products || [];

      // Extract common terms
      const termFrequency = new Map<string, number>();

      products.forEach(product => {
        // Count terms from product names
        const nameWords = product.name.toLowerCase().split(/\s+/)
          .filter(word => word.length > 2); // Filter out short words

        nameWords.forEach(word => {
          termFrequency.set(word, (termFrequency.get(word) || 0) + 1);
        });

        // Count categories
        if (product.category) {
          const category = product.category.toLowerCase();
          termFrequency.set(category, (termFrequency.get(category) || 0) + 2); // Weight categories higher
        }

        // Count subcategories
        if (product.subcategory) {
          const subcategory = product.subcategory.toLowerCase();
          termFrequency.set(subcategory, (termFrequency.get(subcategory) || 0) + 1.5);
        }
      });

      // Sort by frequency and return top terms
      const popularTerms = Array.from(termFrequency.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([term]) => term);

      return {
        data: {
          popularTerms,
          totalProducts: products.length
        }
      };
    } catch (error) {
      console.error('Error fetching popular terms:', error);
      return { data: { popularTerms: [] } };
    }
  }
};

/**
 * Enhanced search scoring algorithm
 */
export const calculateSearchScore = (query: string, product: Product): number => {
  const queryLower = query.toLowerCase().trim();
  const searchTerms = queryLower.split(/\s+/).filter(term => term.length > 0);

  if (searchTerms.length === 0) return 0;

  let score = 0;
  let matchedTerms = 0;

  const productName = (product.name || '').toLowerCase();
  const productCategory = (product.category || '').toLowerCase();
  const productSubcategory = (product.subcategory || '').toLowerCase();
  const productDescription = (product.description || '').toLowerCase();

  searchTerms.forEach(term => {
    // Exact name match (highest priority)
    if (productName.includes(term)) {
      score += productName.startsWith(term) ? 100 : 80;
      matchedTerms++;
    }

    // Category match (high priority)
    if (productCategory.includes(term)) {
      score += productCategory === term ? 60 : 40;
      matchedTerms++;
    }

    // Subcategory match (medium priority)
    if (productSubcategory.includes(term)) {
      score += productSubcategory === term ? 50 : 30;
      matchedTerms++;
    }

    // Description match (lower priority)
    if (productDescription.includes(term)) {
      score += 20;
      matchedTerms++;
    }
  });

  // Bonus for matching multiple terms
  if (matchedTerms >= searchTerms.length) {
    score += 30;
  }

  // Bonus for featured/top products
  if (product.isTopProduct || product.featured) {
    score += 10;
  }

  // Bonus for most selling products
  if (product.isMostSelling) {
    score += 15;
  }

  // Penalty if not enough terms matched
  const matchRatio = matchedTerms / searchTerms.length;
  if (matchRatio < 0.5) {
    score *= matchRatio;
  }

  return score;
};

// Upload API
export const uploadAPI = {
  uploadImages: async (formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<{ urls: string[] }>;
  },

  uploadSingleImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/single`, {
      method: 'POST',
      body: formData,
      headers: {
        ...getAuthHeader(),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<{ url: string }>;
  },
};

// Site Settings Types
export interface SiteSettings {
  _id?: string;
  phone: string;
  email: string;
  address: string;
  businessHours: string;
  social: {
    whatsapp?: string;
    viber?: string;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    twitter?: string;
    youtube?: string;
  };
  mapUrl?: string;
  businessName: string;
  tagline?: string;
  logo?: string;
  updatedAt?: string;
}

// Settings API
export const settingsAPI = {
  // Get site settings (public)
  get: async (): Promise<{ success: boolean; settings: SiteSettings }> => {
    return fetchAPI('/settings');
  },

  // Update site settings (admin only)
  update: async (data: Partial<SiteSettings>): Promise<{ success: boolean; settings: SiteSettings; message: string }> => {
    return fetchAPI('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        ...getAuthHeader(),
      },
    });
  },
};

// Service Types
export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

// Services API
export const servicesAPI = {
  // Get all services (public)
  getAll: async (activeOnly = false): Promise<{ success: boolean; services: Service[] }> => {
    return fetchAPI('/services', {
      params: activeOnly ? { active: 'true' } : undefined,
    });
  },

  // Get single service
  getById: async (id: string): Promise<{ success: boolean; service: Service }> => {
    return fetchAPI(`/services/${id}`);
  },

  // Create new service (admin only)
  create: async (data: Omit<Service, '_id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; service: Service; message: string }> => {
    return fetchAPI('/services', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        ...getAuthHeader(),
      },
    });
  },

  // Update single service (admin only)
  update: async (id: string, data: Partial<Service>): Promise<{ success: boolean; service: Service; message: string }> => {
    return fetchAPI(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        ...getAuthHeader(),
      },
    });
  },

  // Update multiple services at once (admin only)
  updateAll: async (services: Partial<Service>[]): Promise<{ success: boolean; services: Service[]; message: string }> => {
    return fetchAPI('/services', {
      method: 'PUT',
      body: JSON.stringify({ services }),
      headers: {
        ...getAuthHeader(),
      },
    });
  },

  // Delete service (admin only)
  delete: async (id: string): Promise<{ success: boolean; message: string }> => {
    return fetchAPI(`/services/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader(),
      },
    });
  },
};

// Homepage API
export interface HomepageFeature {
  icon: string;
  title: string;
  description: string;
}

export interface HomepageData {
  _id?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroImage: string;
  heroButtonText: string;
  heroButtonLink: string;
  heroSecondaryButtonText: string;
  heroSecondaryButtonLink: string;
  featuresTitle: string;
  featuresEnabled: boolean;
  features: HomepageFeature[];
  whyChooseUsTitle: string;
  whyChooseUsDescription: string;
  whyChooseUsEnabled: boolean;
  whyChooseUsItems: HomepageFeature[];
  ctaTitle: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  ctaSecondaryButtonText: string;
  ctaSecondaryButtonLink: string;
  ctaEnabled: boolean;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
  testimonialsEnabled: boolean;
  servicesTitle: string;
  servicesSubtitle: string;
  servicesEnabled: boolean;
  locationTitle: string;
  locationSubtitle: string;
  locationEnabled: boolean;
  metaTitle: string;
  metaDescription: string;
  lastUpdated?: string;
}

export const homepageAPI = {
  getContent: () =>
    fetchAPI<{ success: boolean; data: HomepageData }>('/homepage'),

  updateContent: (data: Partial<HomepageData>) =>
    fetchAPI<{ success: boolean; data: HomepageData; message?: string }>('/homepage', {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: getAuthHeader()
    }),
};

export default {
  product: productAPI,
  category: categoryAPI,
  subcategory: subcategoryAPI,
  inquiry: inquiryAPI,
  customOrder: customOrderAPI,
  about: aboutAPI,
  gallery: galleryAPI,
  auth: authAPI,
  health: healthAPI,
  upload: uploadAPI,
  search: searchAPI,
  settings: settingsAPI,
  services: servicesAPI,
  homepage: homepageAPI,
};

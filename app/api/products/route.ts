import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category'; // Required for populate()
import '@/models/Subcategory'; // Required for populate()
import { getUserFromRequest } from '@/lib/auth';
import { ValidationSchemas, escapeRegex } from '@/lib/validation';
import { logger } from '@/lib/logger';

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    // Build query with safe parameters
    const query: Record<string, unknown> = {};
    
    // Fix MongoDB injection vulnerability
    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$text = { $search: escapedSearch };
    }
    
    if (category) {
      query.categoryId = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }

    const skip = (page - 1) * limit;

    const [rawProducts, totalProducts] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ dateAdded: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    // Transform products to include category and subcategory as string fields
    const products = rawProducts.map((product: any) => ({
      ...product,
      // Ensure category is a string (from populated categoryId or existing category field)
      category: product.category || (product.categoryId?.name) || 'Steel Furniture',
      // Ensure subcategory is a string (from populated subcategoryId or existing subcategory field)
      subcategory: product.subcategory || (product.subcategoryId?.name) || null,
    }));

    return NextResponse.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts
    });
  } catch (error) {
    logger.error('Error fetching products', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      logger.warn('Unauthorized product creation attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();

    logger.debug('Received product creation request', logger.sanitize({ ...data, image: '[REDACTED]' }));

    // Validate required fields
    if (!data.name || !data.name.trim() || data.name.length > 200) {
      return NextResponse.json(
        { error: 'Product name is required and must be less than 200 characters' },
        { status: 400 }
      );
    }
    
    if (!data.description || !data.description.trim() || data.description.length > 2000) {
      return NextResponse.json(
        { error: 'Product description is required and must be less than 2000 characters' },
        { status: 400 }
      );
    }
    
    if (!data.categoryId) {
      return NextResponse.json(
        { error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!data.image || !data.image.trim()) {
      return NextResponse.json(
        { error: 'Product image is required' },
        { status: 400 }
      );
    }

    // Create product
    const product = new Product({
      name: data.name.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId || undefined,
      image: data.image,
      images: data.images || [],
      features: data.features || [],
      specifications: data.specifications || {},
      deliveryInformation: data.deliveryInformation || {},
      dimensions: data.dimensions || {},
      material: data.material || '',
      colors: data.colors || [],
      colorName: data.colorName || '',
      colorHex: data.colorHex || '',
      colorVariants: data.colorVariants || [],
      isAvailable: data.isAvailable !== false,
      isMostSelling: data.isMostSelling || false,
      isTopProduct: data.isTopProduct || false,
      featured: data.featured || false,
      manufacturerDetails: data.manufacturerDetails,
    });
    
    await product.save();

    logger.info('Product created successfully', { productId: product._id });

    // Revalidate cache for product-related pages
    try {
      revalidatePath('/products');
      revalidatePath('/');
      revalidatePath('/admin/products');
      if (product.slug) {
        revalidatePath(`/products/${product.slug}`);
      }
      revalidateTag('products', {});
    } catch (revalError) {
      logger.error('Error revalidating paths on product creation', revalError as Error);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    logger.error('Error creating product', error as Error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

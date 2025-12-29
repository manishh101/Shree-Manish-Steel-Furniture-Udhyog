import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    // Build query
    const query: any = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (category) {
      query.categoryId = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }

    const skip = (page - 1) * limit;

    const [products, totalProducts] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ dateAdded: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    return NextResponse.json({
      products,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
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
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();

    console.log('Creating product with data:', JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.name || !data.name.trim()) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      );
    }
    
    if (!data.description || !data.description.trim()) {
      return NextResponse.json(
        { error: 'Product description is required' },
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
      specifications: data.specifications || [],
      deliveryInformation: data.deliveryInformation || {},
      dimensions: data.dimensions || {},
      material: data.material || '',
      colors: data.colors || [],
      isAvailable: data.isAvailable !== false,
      isMostSelling: data.isMostSelling || false,
      isTopProduct: data.isTopProduct || false,
      featured: data.featured || false,
    });
    
    await product.save();

    console.log('Product created successfully:', product._id);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create product: ${errorMessage}` },
      { status: 500 }
    );
  }
}

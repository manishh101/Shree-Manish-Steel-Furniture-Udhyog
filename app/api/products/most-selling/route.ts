import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category'; // Required for populate()
import '@/models/Subcategory'; // Required for populate()

// Helper function to transform products with subcategory names
function transformProducts(products: any[]) {
  return products.map((product: any) => ({
    ...product,
    category: product.category || product.categoryId?.name || 'Steel Furniture',
    subcategory: product.subcategory || product.subcategoryId?.name || null,
  }));
}

// GET /api/products/most-selling - Get most selling products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    // First try to get products marked as isMostSelling
    let products = await Product.find({ isMostSelling: true })
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .sort({ salesCount: -1 })
      .limit(limit)
      .lean();

    // If no most selling products found, get by sales count
    if (!products || products.length === 0) {
      products = await Product.find({ salesCount: { $gt: 0 } })
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ salesCount: -1 })
        .limit(limit)
        .lean();
    }

    // If still no products, get featured products
    if (!products || products.length === 0) {
      products = await Product.find({ featured: true })
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }

    // If still no products, get latest products
    if (!products || products.length === 0) {
      products = await Product.find({})
        .populate('categoryId', 'name')
        .populate('subcategoryId', 'name')
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
    }

    // Transform products to include subcategory names
    const transformedProducts = transformProducts(products);

    // Return in the expected format { products: [] }
    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    logger.error('Error fetching most selling products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch most selling products', products: [] },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category'; // Required for populate()
import '@/models/Subcategory'; // Required for populate()

// GET /api/products/featured - Get featured products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const rawProducts = await Product.find({ featured: true })
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .sort({ salesCount: -1 })
      .limit(limit)
      .lean();

    // Transform products to include subcategory names
    const products = rawProducts.map((product: any) => ({
      ...product,
      category: product.category || product.categoryId?.name || 'Steel Furniture',
      subcategory: product.subcategory || product.subcategoryId?.name || null,
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}

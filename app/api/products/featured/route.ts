import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import '@/models/Category'; // Required for populate()

// GET /api/products/featured - Get featured products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const products = await Product.find({ featured: true })
      .populate('categoryId', 'name')
      .sort({ salesCount: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Subcategory from '@/models/Subcategory';

// GET /api/products/filter - Filter products
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '100');
    const category = searchParams.get('category');
    const subcategory = searchParams.get('subcategory');
    const includeAllSubcategories = searchParams.get('includeAllSubcategories') === 'true';
    const search = searchParams.get('search');

    // Build query
    const query: any = {};

    // If subcategory is specified, filter by subcategory only (highest priority)
    if (subcategory) {
      query.subcategoryId = subcategory;
    } else if (category) {
      if (includeAllSubcategories) {
        // Get all subcategories for this category
        const subcategories = await Subcategory.find({ categoryId: category }).select('_id');
        const subcategoryIds = subcategories.map(s => s._id);
        
        // Match products that either belong to the category OR any of its subcategories
        query.$or = [
          { categoryId: category },
          { subcategoryId: { $in: subcategoryIds } }
        ];
      } else {
        query.categoryId = category;
      }
    }

    if (search) {
      query.$text = { $search: search };
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
    console.error('Error filtering products:', error);
    return NextResponse.json(
      { error: 'Failed to filter products' },
      { status: 500 }
    );
  }
}

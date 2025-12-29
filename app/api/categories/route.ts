import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';

    let categories;
    
    if (detailed) {
      categories = await Category.find()
        .sort({ displayOrder: 1 })
        .lean();
      
      // Get subcategories for each category
      for (const category of categories) {
        const subcategories = await Subcategory.find({ categoryId: category._id })
          .sort({ displayOrder: 1 })
          .lean();
        (category as any).subcategories = subcategories;
      }
    } else {
      categories = await Category.find()
        .sort({ displayOrder: 1 })
        .lean();
    }

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    const category = new Category(data);
    await category.save();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Category from '@/models/Category';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/subcategories - Get all subcategories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');

    const filter: any = {};
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const subcategories = await Subcategory.find(filter)
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    return NextResponse.json(subcategories);
  } catch (error) {
    logger.error('Error fetching subcategories:', error);
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/subcategories - Create new subcategory
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

    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      return NextResponse.json(
        { errors: [{ msg: 'Name is required' }] },
        { status: 400 }
      );
    }

    if (!data.categoryId) {
      return NextResponse.json(
        { errors: [{ msg: 'Parent category ID is required' }] },
        { status: 400 }
      );
    }

    // Verify the parent category exists
    const category = await Category.findById(data.categoryId);
    if (!category) {
      return NextResponse.json(
        { msg: 'Parent category not found' },
        { status: 404 }
      );
    }

    // Create new subcategory
    const subcategory = new Subcategory({
      name: data.name,
      description: data.description || '',
      categoryId: data.categoryId,
      displayOrder: data.displayOrder || 0
    });

    await subcategory.save();

    return NextResponse.json(subcategory, { status: 201 });
  } catch (error) {
    logger.error('Error creating subcategory:', error);
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

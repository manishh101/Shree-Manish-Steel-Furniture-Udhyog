import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subcategory from '@/models/Subcategory';

// GET /api/subcategories/category/[categoryId] - Get all subcategories for a specific category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    await connectDB();

    const subcategories = await Subcategory.find({ categoryId })
      .sort({ displayOrder: 1, name: 1 })
      .lean();

    return NextResponse.json(subcategories);
  } catch (error: any) {
    logger.error('Error fetching category subcategories:', error);
    if (error.kind === 'ObjectId') {
      return NextResponse.json(
        { msg: 'Category not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

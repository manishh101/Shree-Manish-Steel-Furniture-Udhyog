import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Subcategory from '@/models/Subcategory';
import Category from '@/models/Category';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/subcategories/[id] - Get single subcategory
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const subcategory = await Subcategory.findById(id).lean();

    if (!subcategory) {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subcategory);
  } catch (error: any) {
    console.error('Error fetching subcategory:', error);
    if (error.kind === 'ObjectId') {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/subcategories/[id] - Update subcategory
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();
    const data = await request.json();

    // Validate required fields
    if (!data.name || data.name.trim() === '') {
      return NextResponse.json(
        { errors: [{ msg: 'Name is required' }] },
        { status: 400 }
      );
    }

    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }

    // Update fields
    subcategory.name = data.name;
    subcategory.description = data.description || '';

    // Only update categoryId if provided
    if (data.categoryId) {
      // Verify the new parent category exists
      const category = await Category.findById(data.categoryId);
      if (!category) {
        return NextResponse.json(
          { msg: 'Parent category not found' },
          { status: 404 }
        );
      }
      subcategory.categoryId = data.categoryId;
    }

    if (data.displayOrder !== undefined) {
      subcategory.displayOrder = data.displayOrder;
    }

    await subcategory.save();

    return NextResponse.json(subcategory);
  } catch (error: any) {
    console.error('Error updating subcategory:', error);
    if (error.kind === 'ObjectId') {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/subcategories/[id] - Delete subcategory
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const subcategory = await Subcategory.findById(id);

    if (!subcategory) {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }

    await Subcategory.findByIdAndDelete(id);

    return NextResponse.json({ msg: 'Subcategory removed' });
  } catch (error: any) {
    console.error('Error deleting subcategory:', error);
    if (error.kind === 'ObjectId') {
      return NextResponse.json(
        { msg: 'Subcategory not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Server Error' },
      { status: 500 }
    );
  }
}

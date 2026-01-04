import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/categories/[id] - Get category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const { searchParams } = new URL(request.url);
    const withSubcategories = searchParams.get('subcategories') === 'true';

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (withSubcategories) {
      const subcategories = await Subcategory.find({ categoryId: id })
        .sort({ displayOrder: 1 })
        .lean();
      (category as any).subcategories = subcategories;
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Update category
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

    // Get the old category to check if name changed
    const oldCategory = await Category.findById(id);
    
    if (!oldCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // If the category name changed, update all products with this category
    if (data.name && data.name !== oldCategory.name) {
      await Product.updateMany(
        { categoryId: id },
        { $set: { category: data.name } }
      );
      console.log(`Updated category name from "${oldCategory.name}" to "${data.name}" in all related products`);
    }

    // Revalidate cache for all category-related pages
    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/admin/categories');
    revalidateTag('categories', {});
    revalidateTag('products', {});

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete category
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

    // Delete all subcategories first
    await Subcategory.deleteMany({ categoryId: id });

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}

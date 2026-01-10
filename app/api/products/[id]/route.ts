import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const rawProduct = await Product.findById(id)
      .populate('categoryId', 'name')
      .populate('subcategoryId', 'name')
      .lean();

    if (!rawProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Transform product to include category and subcategory as string fields
    const product = {
      ...rawProduct,
      category: (rawProduct as any).category || ((rawProduct as any).categoryId?.name) || 'Steel Furniture',
      subcategory: (rawProduct as any).subcategory || ((rawProduct as any).subcategoryId?.name) || null,
    };

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);

    if (!user || user.role !== 'admin') {
      console.log('PUT /api/products/[id] - Unauthorized. User:', user);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    await connectDB();

    const data = await request.json();
    console.log('PUT /api/products/[id] - Updating product:', id, 'with data:', data);

    // If categoryId or subcategoryId is being updated, fetch the names
    if (data.categoryId) {
      const category = await Category.findById(data.categoryId);
      if (category) {
        data.category = category.name;
      }
    }

    if (data.subcategoryId) {
      const subcategory = await Subcategory.findById(data.subcategoryId);
      if (subcategory) {
        data.subcategory = subcategory.name;
      }
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Revalidate cache for product-related pages
    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/admin/products');
    revalidatePath(`/products/${id}`);
    revalidateTag('products', {});

    console.log('PUT /api/products/[id] - Product updated successfully:', product._id);
    return NextResponse.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete product
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

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    revalidatePath('/products');
    revalidatePath('/');
    revalidatePath('/admin/products');
    revalidatePath(`/products/${id}`);
    revalidateTag('products', {});

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

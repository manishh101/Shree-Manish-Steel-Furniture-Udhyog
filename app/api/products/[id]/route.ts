import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

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
      .populate('colorVariants.productId', 'name image images colorName colorHex')
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

    // SYNC COLOR VARIANTS BIDIRECTIONALLY
    if (data.colorVariants !== undefined) {
      // 1. Find all products that currently mention THIS product
      // Use ObjectId to ensure matches whether productId is stored as ObjectId
      // or string in existing records.
      let targetObjectId: any;
      try {
        targetObjectId = new mongoose.Types.ObjectId(id);
      } catch (e) {
        targetObjectId = id;
      }

      await Product.updateMany(
        { 'colorVariants.productId': targetObjectId },
        { $pull: { colorVariants: { productId: targetObjectId } } }
      );

      // 2. The products in the current submitted colorVariants
      if (data.colorVariants && data.colorVariants.length > 0) {
        const variantIds = data.colorVariants
          .filter((v: any) => v.productId)
          .map((v: any) => (typeof v.productId === 'string' ? v.productId : v.productId.toString()));

        if (variantIds.length > 0) {
          // For each linked product, we need to add THIS product (id) to their colorVariants,
          // AND we add all OTHER variants to their colorVariants, 
          // effectively treating this group as a fully connected cluster.
          const allConnectedIds = [id.toString(), ...variantIds.map((v: any) => v.toString())];

          for (const targetId of variantIds) {
            // Find what should be added to targetId
            const othersToTarget = allConnectedIds.filter(cid => cid !== targetId.toString());
            
            // First we need the details of these "others" to format the colorVariants properly
            const othersDocs = await Product.find({ _id: { $in: othersToTarget } }).lean();
            
            const newVariantsForTarget = othersDocs.map((doc: any) => ({
              label: doc.colorName || doc.name,
              hex: doc.colorHex || '',
              productId: doc._id,
              image: doc.image || (doc.images && doc.images[0]) || ''
            }));

            // Update the target product
            let targetObjId: any;
            try {
              targetObjId = new mongoose.Types.ObjectId(targetId);
            } catch (e) {
              targetObjId = targetId;
            }

            // Build canonical (alphabetically sorted) variant list for this product
            const canonicalVariants = newVariantsForTarget
              .sort((a: any, b: any) => {
                const aLabel = (a.label || '').toLowerCase();
                const bLabel = (b.label || '').toLowerCase();
                return aLabel.localeCompare(bLabel);
              });

            // Overwrite the target product's colorVariants with
            // the canonical ordered list for this cluster. This ensures
            // every product in the group shows the same ordering (when
            // combined with the current product's own color).
            await Product.updateOne(
              { _id: targetObjId },
              { $set: { colorVariants: canonicalVariants } }
            );
          }
        }
      }
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

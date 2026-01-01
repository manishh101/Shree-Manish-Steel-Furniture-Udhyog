import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import mongoose from 'mongoose';

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
      // Check if subcategory is an ObjectId or a name
      if (mongoose.Types.ObjectId.isValid(subcategory)) {
        query.subcategoryId = subcategory;
      } else {
        // It's a name, find the subcategory first
        const subcategoryDoc = await Subcategory.findOne({ name: subcategory }).select('_id');
        if (subcategoryDoc) {
          query.subcategoryId = subcategoryDoc._id;
        } else {
          // Fall back to string match on subcategory field
          query.subcategory = subcategory;
        }
      }
    } else if (category) {
      // Check if category is an ObjectId or a name
      const isObjectId = mongoose.Types.ObjectId.isValid(category);
      
      if (includeAllSubcategories) {
        let categoryId: mongoose.Types.ObjectId | null = null;
        
        if (isObjectId) {
          categoryId = new mongoose.Types.ObjectId(category);
        } else {
          // Find category by name
          const categoryDoc = await Category.findOne({ name: category }).select('_id');
          if (categoryDoc) {
            categoryId = categoryDoc._id as mongoose.Types.ObjectId;
          }
        }
        
        if (categoryId) {
          // Get all subcategories for this category
          const subcategories = await Subcategory.find({ categoryId: categoryId }).select('_id');
          const subcategoryIds = subcategories.map(s => s._id);
          
          // Match products that either belong to the category OR any of its subcategories
          query.$or = [
            { categoryId: categoryId },
            { subcategoryId: { $in: subcategoryIds } },
            { category: category } // Also match by category name string
          ];
        } else {
          // No category found by ID, try matching by name string
          query.category = category;
        }
      } else {
        if (isObjectId) {
          query.categoryId = category;
        } else {
          // Try to find by category name in the string field or by looking up the category
          const categoryDoc = await Category.findOne({ name: category }).select('_id');
          if (categoryDoc) {
            query.$or = [
              { categoryId: categoryDoc._id },
              { category: category }
            ];
          } else {
            query.category = category;
          }
        }
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

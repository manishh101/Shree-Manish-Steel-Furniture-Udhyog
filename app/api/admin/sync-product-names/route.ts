import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Subcategory from '@/models/Subcategory';
import { getUserFromRequest } from '@/lib/auth';

/**
 * POST /api/admin/sync-product-names
 * Utility endpoint to sync all product category/subcategory names
 * with their current category/subcategory references
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();

    let updatedCount = 0;
    let errors = 0;
    const debugInfo: string[] = [];

    // Get all products
    const products = await Product.find({}).lean();
    
    console.log(`Starting sync for ${products.length} products...`);
    debugInfo.push(`Total products found: ${products.length}`);

    // Check first product structure
    if (products.length > 0) {
      const sampleProduct = products[0];
      debugInfo.push(`Sample product fields: ${Object.keys(sampleProduct).join(', ')}`);
      debugInfo.push(`Sample categoryId: ${sampleProduct.categoryId}`);
      debugInfo.push(`Sample subcategoryId: ${sampleProduct.subcategoryId}`);
      debugInfo.push(`Sample category: ${sampleProduct.category}`);
      debugInfo.push(`Sample subcategory: ${sampleProduct.subcategory}`);
    }

    // Count products with subcategoryId
    const productsWithSubcategoryId = products.filter(p => p.subcategoryId);
    debugInfo.push(`Products with subcategoryId: ${productsWithSubcategoryId.length}`);

    for (const productData of products) {
      try {
        let needsUpdate = false;
        const updates: any = {};

        // Sync category name if categoryId exists
        if (productData.categoryId) {
          const category = await Category.findById(productData.categoryId).lean();
          if (category) {
            const categoryName = (category as any).name;
            if (!productData.category || categoryName !== productData.category) {
              updates.category = categoryName;
              needsUpdate = true;
              debugInfo.push(`Product "${productData.name}": category "${productData.category}" -> "${categoryName}"`);
            }
          }
        }

        // Sync subcategory name if subcategoryId exists
        if (productData.subcategoryId) {
          const subcategory = await Subcategory.findById(productData.subcategoryId).lean();
          if (subcategory) {
            const subcategoryName = (subcategory as any).name;
            if (!productData.subcategory || subcategoryName !== productData.subcategory) {
              updates.subcategory = subcategoryName;
              needsUpdate = true;
              debugInfo.push(`Product "${productData.name}": subcategory "${productData.subcategory}" -> "${subcategoryName}"`);
            }
          }
        }

        if (needsUpdate) {
          await Product.findByIdAndUpdate(productData._id, { $set: updates });
          updatedCount++;
        }
      } catch (error) {
        console.error(`Error syncing product ${productData._id}:`, error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Sync completed. Updated ${updatedCount} products.`,
      totalProducts: products.length,
      updatedCount,
      errors,
      debug: debugInfo.slice(0, 20) // Limit debug info
    });
  } catch (error) {
    console.error('Error syncing product names:', error);
    return NextResponse.json(
      { error: 'Failed to sync product names' },
      { status: 500 }
    );
  }
}

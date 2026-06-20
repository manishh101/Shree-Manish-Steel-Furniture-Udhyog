import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { connectDB } from '@/lib/db';
import FAQ from '@/models/FAQ';
import { getUserFromRequest } from '@/lib/auth';
import {
  GENERAL_FAQS,
  DELIVERY_FAQS,
  PAYMENT_FAQS,
  WARRANTY_FAQS,
  CUSTOM_ORDER_FAQS,
} from '@/lib/seo/faqContent';

// Helper to seed default FAQs
async function seedDefaultFAQs() {
  const seedData: any[] = [];

  const addCategory = (staticList: any[], categoryName: string) => {
    staticList.forEach((faq, index) => {
      seedData.push({
        question: faq.question,
        answer: faq.answer,
        category: categoryName,
        displayOrder: index,
      });
    });
  };

  addCategory(GENERAL_FAQS, 'general');
  addCategory(DELIVERY_FAQS, 'delivery');
  addCategory(PAYMENT_FAQS, 'payment');
  addCategory(WARRANTY_FAQS, 'warranty');
  addCategory(CUSTOM_ORDER_FAQS, 'custom_orders');

  await FAQ.insertMany(seedData);
  logger.info(`Successfully seeded ${seedData.length} default FAQs into database`);
}

// GET /api/faq - Retrieve all FAQs, sorted by category and displayOrder
export async function GET() {
  try {
    await connectDB();

    let faqs = await FAQ.find().sort({ category: 1, displayOrder: 1 }).lean();

    // If no FAQs exist, seed default FAQs
    if (faqs.length === 0) {
      await seedDefaultFAQs();
      faqs = await FAQ.find().sort({ category: 1, displayOrder: 1 }).lean();
    }

    return NextResponse.json({
      success: true,
      data: faqs,
    });
  } catch (error) {
    logger.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

// PUT /api/faq - Bulk update all global FAQs (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    const { faqs } = body;

    if (!Array.isArray(faqs)) {
      return NextResponse.json(
        { success: false, error: 'Payload must contain a faqs array' },
        { status: 400 }
      );
    }

    // Validate FAQs
    const validCategories = ['general', 'delivery', 'payment', 'warranty', 'custom_orders'];
    const cleanedFaqs = [];

    for (let i = 0; i < faqs.length; i++) {
      const item = faqs[i];
      if (!item.question || !item.question.trim()) {
        return NextResponse.json(
          { success: false, error: `FAQ at index ${i} is missing a question` },
          { status: 400 }
        );
      }
      if (!item.answer || !item.answer.trim()) {
        return NextResponse.json(
          { success: false, error: `FAQ at index ${i} is missing an answer` },
          { status: 400 }
        );
      }
      if (!item.category || !validCategories.includes(item.category.toLowerCase().trim())) {
        return NextResponse.json(
          { success: false, error: `FAQ at index ${i} has an invalid category. Must be one of: ${validCategories.join(', ')}` },
          { status: 400 }
        );
      }

      cleanedFaqs.push({
        question: item.question.trim(),
        answer: item.answer.trim(),
        category: item.category.toLowerCase().trim(),
        displayOrder: typeof item.displayOrder === 'number' ? item.displayOrder : i,
      });
    }

    // In order to perform updates, reordering, and deletes cleanly, we clear the table and insert all
    await FAQ.deleteMany({});
    const insertedFaqs = await FAQ.insertMany(cleanedFaqs);

    // Revalidate paths for global FAQ page
    try {
      revalidatePath('/faq');
      revalidatePath('/admin/faq');
    } catch (revalError) {
      logger.error('Error revalidating global FAQ paths:', revalError as Error);
    }

    return NextResponse.json({
      success: true,
      message: 'FAQs updated successfully',
      data: insertedFaqs,
    });
  } catch (error) {
    logger.error('Error updating FAQs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update FAQs' },
      { status: 500 }
    );
  }
}

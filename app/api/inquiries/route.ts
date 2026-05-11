import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import { getUserFromRequest } from '@/lib/auth';
import { sendWhatsAppInquiryAlert } from '@/services/notification';
import { ValidationSchemas, escapeRegex } from '@/lib/validation';
import { logger } from '@/lib/logger';

// GET /api/inquiries - Get all inquiries (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || user.role !== 'admin') {
      logger.warn('Unauthorized inquiry access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: Record<string, unknown> = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    // Fix MongoDB injection vulnerability by escaping regex
    if (search) {
      const escapedSearch = escapeRegex(search);
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
        { phone: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [inquiries, totalInquiries] = await Promise.all([
      Inquiry.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Inquiry.countDocuments(query)
    ]);

    return NextResponse.json({
      inquiries,
      currentPage: page,
      totalPages: Math.ceil(totalInquiries / limit),
      totalInquiries
    });
  } catch (error) {
    logger.error('Error fetching inquiries', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

// POST /api/inquiries - Create new inquiry (public)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    // Validate request payload with Zod schema
    const validation = ValidationSchemas.inquiry.safeParse(data);
    if (!validation.success) {
      logger.warn('Invalid inquiry submission', validation.error.errors);
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    const validData = validation.data;

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    const inquiryData = {
      name: validData.name,
      email: validData.email,
      phone: validData.phone,
      message: validData.message,
      category: validData.category || 'general',
      ipAddress: ip,
      status: 'new'
    };

    const inquiry = new Inquiry(inquiryData);
    await inquiry.save();

    logger.debug('Inquiry created successfully', { id: inquiry._id });

    // Send WhatsApp notification - don't block response
    try {
      await sendWhatsAppInquiryAlert({
        name: validData.name,
        phone: validData.phone,
        email: validData.email,
        message: validData.message,
        category: validData.category
      });
    } catch (err) {
      logger.error('Background WhatsApp notification failed', err as Error);
    }

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating inquiry', error as Error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

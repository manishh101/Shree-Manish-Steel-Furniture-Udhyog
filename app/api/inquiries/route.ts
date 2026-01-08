import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import { getUserFromRequest } from '@/lib/auth';
import { sendWhatsAppInquiryAlert } from '@/services/notification';

// GET /api/inquiries - Get all inquiries (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
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
    console.error('Error fetching inquiries:', error);
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

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'message'];
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Set default category if not provided
    if (!data.category) {
      data.category = 'general';
    }

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    data.ipAddress = ip;

    const inquiry = new Inquiry(data);
    await inquiry.save();

    // Send WhatsApp notification (don't await to avoid delaying the response)
    sendWhatsAppInquiryAlert({
      name: data.name,
      phone: data.phone,
      email: data.email,
      message: data.message,
      category: data.category
    }).catch(err => console.error('Background WhatsApp notification failed:', err));

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully',
      data: inquiry
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to submit inquiry' },
      { status: 500 }
    );
  }
}

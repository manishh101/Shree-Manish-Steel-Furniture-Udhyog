import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CustomOrder from '@/models/CustomOrder';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/custom-orders - Get all custom orders (admin only)
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
        { phone: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      CustomOrder.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CustomOrder.countDocuments(query)
    ]);

    return NextResponse.json({
      orders,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders
    });
  } catch (error) {
    console.error('Error fetching custom orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom orders' },
      { status: 500 }
    );
  }
}

// POST /api/custom-orders - Create new custom order (public)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'requirements'];
    for (const field of requiredFields) {
      if (!data[field] || data[field].trim() === '') {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    data.ipAddress = ip;

    const customOrder = new CustomOrder(data);
    await customOrder.save();

    return NextResponse.json({
      success: true,
      message: 'Custom order submitted successfully',
      data: customOrder
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating custom order:', error);
    return NextResponse.json(
      { error: 'Failed to submit custom order' },
      { status: 500 }
    );
  }
}

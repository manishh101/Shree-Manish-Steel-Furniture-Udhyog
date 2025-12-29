import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import CustomOrder from '@/models/CustomOrder';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/custom-orders/[id] - Get single custom order
export async function GET(
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

    const order = await CustomOrder.findById(id).lean();

    if (!order) {
      return NextResponse.json(
        { error: 'Custom order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching custom order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch custom order' },
      { status: 500 }
    );
  }
}

// PUT /api/custom-orders/[id] - Update custom order status
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

    const order = await CustomOrder.findByIdAndUpdate(
      id,
      { 
        ...data,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Custom order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Custom order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating custom order:', error);
    return NextResponse.json(
      { error: 'Failed to update custom order' },
      { status: 500 }
    );
  }
}

// DELETE /api/custom-orders/[id] - Delete custom order
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

    const order = await CustomOrder.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { error: 'Custom order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Custom order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting custom order:', error);
    return NextResponse.json(
      { error: 'Failed to delete custom order' },
      { status: 500 }
    );
  }
}

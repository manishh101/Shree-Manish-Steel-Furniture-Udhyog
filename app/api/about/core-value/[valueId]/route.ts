import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import About from '@/models/About';
import { getUserFromRequest } from '@/lib/auth';

// PUT /api/about/core-value/[valueId] - Update or add core value
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ valueId: string }> }
) {
  try {
    const { valueId } = await params;
    await connectDB();
    const { value } = await request.json();

    let aboutContent = await About.findOne();
    
    if (!aboutContent) {
      return NextResponse.json(
        { success: false, error: 'About page content not found' },
        { status: 404 }
      );
    }

    // If valueId is 'new', add new value
    if (valueId === 'new') {
      aboutContent.coreValues.push(value);
    } else {
      // Update existing value
      const valueIndex = aboutContent.coreValues.findIndex(
        (v: any) => v._id?.toString() === valueId
      );
      
      if (valueIndex === -1) {
        return NextResponse.json(
          { success: false, error: 'Core value not found' },
          { status: 404 }
        );
      }
      
      const existingValue = aboutContent.coreValues[valueIndex] as any;
      aboutContent.coreValues[valueIndex] = {
        ...(existingValue?.toObject ? existingValue.toObject() : existingValue),
        ...value
      };
    }

    aboutContent.lastUpdated = new Date();
    await aboutContent.save();

    return NextResponse.json({
      success: true,
      message: valueId === 'new' ? 'Core value added successfully' : 'Core value updated successfully',
      data: aboutContent
    });
  } catch (error) {
    logger.error('Error updating core value:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update core value' },
      { status: 500 }
    );
  }
}

// DELETE /api/about/core-value/[valueId] - Delete core value
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ valueId: string }> }
) {
  try {
    const { valueId } = await params;
    await connectDB();

    let aboutContent = await About.findOne();
    
    if (!aboutContent) {
      return NextResponse.json(
        { success: false, error: 'About page content not found' },
        { status: 404 }
      );
    }

    aboutContent.coreValues = aboutContent.coreValues.filter(
      (v: any) => v._id?.toString() !== valueId
    );

    aboutContent.lastUpdated = new Date();
    await aboutContent.save();

    return NextResponse.json({
      success: true,
      message: 'Core value deleted successfully',
      data: aboutContent
    });
  } catch (error) {
    logger.error('Error deleting core value:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete core value' },
      { status: 500 }
    );
  }
}

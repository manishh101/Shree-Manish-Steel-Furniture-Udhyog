import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import About from '@/models/About';
import { getUserFromRequest } from '@/lib/auth';

// PUT /api/about/workshop-images - Update workshop images
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { images } = await request.json();

    let aboutContent = await About.findOne();
    
    if (!aboutContent) {
      return NextResponse.json(
        { success: false, error: 'About page content not found' },
        { status: 404 }
      );
    }

    aboutContent = await About.findByIdAndUpdate(
      aboutContent._id,
      { workshopImages: images, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Workshop images updated successfully',
      data: aboutContent
    });
  } catch (error) {
    logger.error('Error updating workshop images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update workshop images' },
      { status: 500 }
    );
  }
}

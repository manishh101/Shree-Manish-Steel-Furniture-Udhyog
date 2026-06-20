import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GallerySection } from '@/models/Gallery';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

// POST /api/gallery/sections/[id]/images - Add image to section
export async function POST(
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
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section ID' },
        { status: 400 }
      );
    }

    await connectDB();
    const data = await request.json();

    const section = await GallerySection.findById(id);

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    const imageData = {
      ...data,
      order: section.images.length
    };

    section.images.push(imageData);
    await section.save();

    return NextResponse.json({
      success: true,
      data: section,
      message: 'Image added successfully'
    }, { status: 201 });
  } catch (error) {
    logger.error('Error adding image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add image' },
      { status: 500 }
    );
  }
}

// PUT /api/gallery/sections/[id]/images - Reorder images
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
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section ID' },
        { status: 400 }
      );
    }

    await connectDB();
    const { imageOrders } = await request.json();

    const section = await GallerySection.findById(id);

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    // Update image orders
    imageOrders.forEach(({ id: imageId, order }: { id: string; order: number }) => {
      const imageIndex = section.images.findIndex((img: any) => img.id === imageId || img._id?.toString() === imageId);
      if (imageIndex !== -1) {
        section.images[imageIndex].order = order;
      }
    });

    // Sort images by order
    section.images.sort((a: any, b: any) => a.order - b.order);

    await section.save();

    return NextResponse.json({
      success: true,
      data: section,
      message: 'Images reordered successfully'
    });
  } catch (error) {
    logger.error('Error reordering images:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder images' },
      { status: 500 }
    );
  }
}

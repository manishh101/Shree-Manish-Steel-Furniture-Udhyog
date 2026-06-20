import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GallerySection } from '@/models/Gallery';
import { getUserFromRequest } from '@/lib/auth';
import mongoose from 'mongoose';

// PUT /api/gallery/sections/[id]/images/[imageId] - Update image
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, imageId } = await params;
    
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

    const imageIndex = section.images.findIndex(
      (img: any) => img.id === imageId || img._id?.toString() === imageId
    );

    if (imageIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    // Spread existing image properties and merge with new data
    const existingImage = section.images[imageIndex] as any;
    section.images[imageIndex] = {
      ...(existingImage.toObject ? existingImage.toObject() : { ...existingImage }),
      ...data
    };

    await section.save();

    return NextResponse.json({
      success: true,
      data: section,
      message: 'Image updated successfully'
    });
  } catch (error) {
    logger.error('Error updating image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

// DELETE /api/gallery/sections/[id]/images/[imageId] - Delete image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, imageId } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid section ID' },
        { status: 400 }
      );
    }

    await connectDB();

    const section = await GallerySection.findById(id);

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Section not found' },
        { status: 404 }
      );
    }

    section.images = section.images.filter(
      (img: any) => img.id !== imageId && img._id?.toString() !== imageId
    );

    await section.save();

    return NextResponse.json({
      success: true,
      data: section,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting image:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GallerySection, GalleryConfig } from '@/models/Gallery';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/gallery - Get all gallery sections (public)
export async function GET() {
  try {
    await connectDB();

    const sections = await GallerySection.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    const config = await GalleryConfig.findOne().lean() || {
      title: 'Our Gallery',
      description: 'Explore our collection of premium furniture',
      enableLightbox: true,
      imagesPerRow: 3,
      showCaptions: true,
      enableFiltering: true
    };

    return NextResponse.json({
      success: true,
      data: {
        sections,
        config
      }
    });
  } catch (error) {
    logger.error('Error fetching gallery:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GalleryConfig } from '@/models/Gallery';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/gallery/config - Get gallery configuration
export async function GET() {
  try {
    await connectDB();

    let config = await GalleryConfig.findOne().lean();
    
    if (!config) {
      // Return default config matching the IGalleryConfig interface
      const defaultConfig = {
        title: 'Our Gallery',
        subtitle: 'Explore our collection of premium furniture',
        layout: 'grid' as const,
        showFilters: true,
        showStats: true
      };
      return NextResponse.json({
        success: true,
        data: defaultConfig
      });
    }

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching gallery config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gallery config' },
      { status: 500 }
    );
  }
}

// PUT /api/gallery/config - Update gallery configuration (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();
    const data = await request.json();

    let config = await GalleryConfig.findOne();
    
    if (!config) {
      config = new GalleryConfig({
        ...data,
        lastUpdatedBy: user.id
      });
    } else {
      Object.assign(config, data, { lastUpdatedBy: user.id });
    }
    
    await config.save();

    return NextResponse.json({
      success: true,
      data: config,
      message: 'Gallery configuration updated successfully'
    });
  } catch (error) {
    console.error('Error updating gallery config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gallery config' },
      { status: 500 }
    );
  }
}

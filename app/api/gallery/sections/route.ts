import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { GallerySection } from '@/models/Gallery';
import { getUserFromRequest } from '@/lib/auth';

// GET /api/gallery/sections - Get all sections (admin)
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

    const sections = await GallerySection.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: sections
    });
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sections' },
      { status: 500 }
    );
  }
}

// POST /api/gallery/sections - Create new section (admin)
export async function POST(request: NextRequest) {
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

    const sectionData = {
      ...data,
      images: data.images || []
    };

    const section = new GallerySection(sectionData);
    await section.save();

    return NextResponse.json({
      success: true,
      data: section,
      message: 'Gallery section created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create section' },
      { status: 500 }
    );
  }
}

// PUT /api/gallery/sections - Reorder sections (admin)
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
    const { sectionOrders } = await request.json();

    const updatePromises = sectionOrders.map(({ id, order }: { id: string; order: number }) =>
      GallerySection.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Sections reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering sections:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder sections' },
      { status: 500 }
    );
  }
}

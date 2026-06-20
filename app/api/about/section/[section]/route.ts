import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import About from '@/models/About';
import { getUserFromRequest } from '@/lib/auth';

// PUT /api/about/section/[section] - Update specific section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    const { section } = await params;
    await connectDB();
    const data = await request.json();

    let aboutContent = await About.findOne();
    
    if (!aboutContent) {
      // Create default content first
      const defaultContent = {
        heroTitle: 'About Our Company',
        heroDescription: 'Shree Manish Steel Furnitry Industry is a leading manufacturer of high-quality steel and wooden furniture in Nepal.',
        storyTitle: 'Our Story',
        storyImage: '/images/furniture-1.jpg',
        storyContent: [
          'Founded over a decade ago, Shree Manish Steel Furnitry Industry began with a simple mission: to create high-quality, affordable furniture for Nepali homes and businesses.'
        ],
        yearsExperience: '10+',
        happyCustomers: '1000+',
        vision: 'To be the leading furniture manufacturer in Nepal, recognized for quality, innovation, and customer service.',
        mission: 'To create furniture that combines functionality, durability, and aesthetic appeal at competitive prices.',
        coreValues: [],
        workshopTitle: 'Our Workshop & Team',
        workshopDescription: 'Take a glimpse into our production facility and meet the skilled craftsmen behind our quality furniture.',
        workshopImages: []
      };
      
      aboutContent = new About(defaultContent);
      await aboutContent.save();
    }

    // Check if the section exists in the request body
    if (data[section] === undefined) {
      return NextResponse.json(
        { success: false, error: `Section "${section}" not found in request body` },
        { status: 400 }
      );
    }

    // Update only the specific section
    const updateData: any = {};
    updateData[section] = data[section];
    updateData.lastUpdated = new Date();

    aboutContent = await About.findByIdAndUpdate(
      aboutContent._id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      success: true,
      message: `${section} section updated successfully`,
      data: aboutContent
    });
  } catch (error) {
    logger.error('Error updating about section:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update section' },
      { status: 500 }
    );
  }
}

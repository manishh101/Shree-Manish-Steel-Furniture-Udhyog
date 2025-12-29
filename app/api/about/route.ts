import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import About from '@/models/About';
import { getUserFromRequest } from '@/lib/auth';

const defaultAboutContent = {
  heroTitle: 'About Our Company',
  heroDescription: 'Shree Manish Steel Furnitry Industry is a leading manufacturer of high-quality steel and wooden furniture in Nepal.',
  storyTitle: 'Our Story',
  storyImage: '/images/furniture-1.jpg',
  storyContent: [
    'Founded over a decade ago, Shree Manish Steel Furnitry Industry began with a simple mission: to create high-quality, affordable furniture for Nepali homes and businesses. What started as a small workshop has grown into one of the most trusted furniture manufacturers in the region.',
    'Our journey has been defined by a commitment to craftsmanship, innovation, and customer satisfaction. We take pride in our Nepali heritage and continue to support local communities through employment opportunities and sustainable business practices.',
    'Today, we offer a comprehensive range of steel and wooden furniture solutions, from household almirahs to complete office setups, all designed with the unique needs of our customers in mind.'
  ],
  yearsExperience: '10+',
  happyCustomers: '1000+',
  vision: 'To be the leading furniture manufacturer in Nepal, recognized for quality, innovation, and customer service. We envision a future where every Nepali home and office is furnished with our durable, stylish, and affordable products.',
  mission: 'To create furniture that combines functionality, durability, and aesthetic appeal at competitive prices. We are committed to using quality materials, employing skilled craftsmen, and maintaining high standards of production to deliver products that exceed customer expectations.',
  coreValues: [
    {
      title: 'Quality',
      description: 'We never compromise on the quality of our materials or craftsmanship, ensuring products that last for generations.',
      icon: 'CheckBadgeIcon'
    },
    {
      title: 'Innovation',
      description: 'We continuously explore new designs, technologies, and processes to improve our products and meet evolving customer needs.',
      icon: 'LightBulbIcon'
    },
    {
      title: 'Integrity',
      description: 'We conduct our business with honesty, transparency, and ethical practices, building trust with customers, employees, and partners.',
      icon: 'ShieldCheckIcon'
    },
    {
      title: 'Customer Focus',
      description: 'We prioritize customer satisfaction by listening to feedback, providing excellent service, and creating products that meet real needs.',
      icon: 'UsersIcon'
    }
  ],
  workshopTitle: 'Our Workshop & Team',
  workshopDescription: 'Take a glimpse into our production facility and meet the skilled craftsmen behind our quality furniture.',
  workshopImages: [
    '/images/furniture-1.jpg',
    '/images/furniture-2.jpg',
    '/images/furniture-1.jpg',
    '/images/furniture-2.jpg',
    '/images/furniture-1.jpg',
    '/images/furniture-2.jpg'
  ]
};

// GET /api/about - Get about page content (public)
export async function GET() {
  try {
    await connectDB();

    let aboutContent = await About.findOne().lean();
    
    // If no content exists, create default content
    if (!aboutContent) {
      const newAbout = new About(defaultAboutContent);
      await newAbout.save();
      aboutContent = newAbout.toObject();
    }

    return NextResponse.json({
      success: true,
      data: aboutContent
    });
  } catch (error) {
    console.error('Error fetching about content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch about content' },
      { status: 500 }
    );
  }
}

// PUT /api/about - Update about page content
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    // Basic validation
    if (data.coreValues && !Array.isArray(data.coreValues)) {
      return NextResponse.json(
        { success: false, error: 'Core values must be an array' },
        { status: 400 }
      );
    }
    
    if (data.storyContent && !Array.isArray(data.storyContent)) {
      return NextResponse.json(
        { success: false, error: 'Story content must be an array' },
        { status: 400 }
      );
    }
    
    if (data.workshopImages && !Array.isArray(data.workshopImages)) {
      return NextResponse.json(
        { success: false, error: 'Workshop images must be an array' },
        { status: 400 }
      );
    }

    let aboutContent = await About.findOne();
    
    if (!aboutContent) {
      aboutContent = new About(data);
    } else {
      aboutContent = await About.findByIdAndUpdate(
        aboutContent._id,
        { ...data, lastUpdated: new Date() },
        { new: true, runValidators: true }
      );
    }
    
    if (aboutContent) {
      await aboutContent.save();
    }

    return NextResponse.json({
      success: true,
      message: 'About page content updated successfully',
      data: aboutContent
    });
  } catch (error: any) {
    console.error('Error updating about content:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: messages },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update about content' },
      { status: 500 }
    );
  }
}

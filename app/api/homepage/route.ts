import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Homepage from '@/models/Homepage';

// Default homepage content
const defaultHomepageContent = {
  heroTitle: 'Shree Manish Steel',
  heroSubtitle: 'Furniture Udhyog',
  heroDescription: 'Quality Steel Furniture for Every Space',
  heroImage: '/images/home-page-1.png',
  heroButtonText: 'View Products',
  heroButtonLink: '/products',
  heroSecondaryButtonText: 'Contact Us',
  heroSecondaryButtonLink: '/contact',
  
  featuresTitle: 'Why Choose Us?',
  featuresEnabled: true,
  features: [
    { icon: 'shield', title: 'Premium Quality', description: 'High-grade durable steel furniture built to last.' },
    { icon: 'paint', title: 'Modern Design', description: 'Contemporary and stylish designs for every space.' },
    { icon: 'bolt', title: 'Fast Delivery', description: 'Quick and reliable delivery service across Nepal.' },
    { icon: 'support', title: 'Customer Support', description: '24/7 dedicated customer support and assistance.' }
  ],
  
  whyChooseUsTitle: "Nepal's Leading Steel Furniture Manufacturer",
  whyChooseUsDescription: 'Trusted by thousands of customers across Nepal for premium quality steel furniture at affordable prices.',
  whyChooseUsEnabled: true,
  whyChooseUsItems: [
    { icon: '🏆', title: '15+ Years Experience', description: 'Trusted manufacturing expertise' },
    { icon: '🚚', title: 'Fast Delivery', description: 'Across Biratnagar, Dharan, Itahari & nearby places' },
    { icon: '💎', title: 'Premium Quality', description: '5-year warranty & free installation' }
  ],
  
  ctaTitle: 'Ready to Transform Your Space?',
  ctaDescription: 'Contact us today to discuss your furniture needs or visit our showroom to see our products in person.',
  ctaButtonText: 'Contact Us',
  ctaButtonLink: '/contact',
  ctaSecondaryButtonText: 'Request Custom Order',
  ctaSecondaryButtonLink: '/custom-order',
  ctaEnabled: true,
  
  testimonialsTitle: 'What Our Customers Say',
  testimonialsSubtitle: 'Discover why our customers trust us with their furniture needs.',
  testimonialsEnabled: true,
  
  servicesTitle: 'Our Services',
  servicesSubtitle: 'Comprehensive furniture solutions tailored to your needs',
  servicesEnabled: true,
  
  locationTitle: 'Visit Our Showroom',
  locationSubtitle: 'Experience our furniture collection in person at our Biratnagar showroom.',
  locationEnabled: true,
  
  metaTitle: 'Shree Manish Steel Furniture - Quality Steel & Wooden Furniture in Nepal',
  metaDescription: 'Premium quality steel and wooden furniture manufacturer in Biratnagar, Nepal. Almirahs, beds, office furniture and more.'
};

// GET /api/homepage - Get homepage content (public)
export async function GET() {
  try {
    await connectDB();

    let homepageContent = await Homepage.findOne().lean();
    
    // If no content exists, create default content
    if (!homepageContent) {
      const newHomepage = new Homepage(defaultHomepageContent);
      await newHomepage.save();
      homepageContent = newHomepage.toObject();
    }

    return NextResponse.json({
      success: true,
      data: homepageContent
    });
  } catch (error) {
    logger.error('Error fetching homepage content:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch homepage content' },
      { status: 500 }
    );
  }
}

// PUT /api/homepage - Update homepage content
export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const data = await request.json();

    let homepageContent = await Homepage.findOne();
    
    if (!homepageContent) {
      homepageContent = new Homepage({ ...defaultHomepageContent, ...data });
    } else {
      // Update existing document
      Object.assign(homepageContent, data);
      homepageContent.lastUpdated = new Date();
    }
    
    await homepageContent.save();

    return NextResponse.json({
      success: true,
      message: 'Homepage content updated successfully',
      data: homepageContent
    });
  } catch (error: any) {
    logger.error('Error updating homepage content:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { success: false, error: 'Validation failed', errors: messages },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update homepage content' },
      { status: 500 }
    );
  }
}

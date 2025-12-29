import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { getUserFromRequest } from '@/lib/auth';

// GET - Get site settings (public)
export async function GET() {
  try {
    await connectDB();
    
    // Find settings or create default
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      // Create default settings
      settings = await SiteSettings.create({
        phone: '+977 9824336371',
        email: 'shreemanishfurniture@gmail.com',
        address: 'Dharan Rd, Biratnagar 56613, Nepal',
        businessHours: 'Sunday - Friday: 8:00 AM - 7:00 PM\nSaturday: 8:00 AM - 12:00 PM',
        businessName: 'Shree Manish Steel Furniture Udhyog',
        tagline: 'Quality Steel Furniture for Your Home & Office',
        social: {
          whatsapp: '',
          viber: '',
          facebook: '',
          instagram: '',
          tiktok: '',
          twitter: '',
          youtube: ''
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

// PUT - Update site settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const body = await request.json();
    
    // Find existing settings or create new
    let settings = await SiteSettings.findOne();
    
    if (!settings) {
      settings = new SiteSettings({});
    }
    
    // Update fields
    const allowedFields = [
      'phone', 'email', 'address', 'businessHours',
      'social', 'mapUrl', 'businessName', 'tagline', 'logo'
    ];
    
    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        if (field === 'social' && typeof body[field] === 'object') {
          // Merge social object
          settings.social = {
            ...settings.social,
            ...body[field]
          };
        } else {
          (settings as any)[field] = body[field];
        }
      }
    });
    
    settings.updatedAt = new Date();
    if (user.id) {
      settings.updatedBy = new mongoose.Types.ObjectId(user.id);
    }
    
    await settings.save();
    
    return NextResponse.json({
      success: true,
      message: 'Site settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update site settings' },
      { status: 500 }
    );
  }
}

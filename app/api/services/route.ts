import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Service from '@/models/Service';
import { getUserFromRequest } from '@/lib/auth';

// Default services data
const defaultServices = [
  {
    title: 'Custom Design',
    description: 'Personalized furniture designs crafted to match your space and style preferences perfectly.',
    icon: '🏠',
    isActive: true,
    order: 1
  },
  {
    title: 'Installation',
    description: 'Professional installation services ensuring your furniture is set up correctly and safely.',
    icon: '🔧',
    isActive: true,
    order: 2
  },
  {
    title: 'Delivery',
    description: 'Fast and secure delivery across Nepal with careful handling of your furniture pieces.',
    icon: '🚚',
    isActive: true,
    order: 3
  },
  {
    title: 'Maintenance',
    description: 'Regular maintenance and repair services to keep your steel furniture in perfect condition.',
    icon: '🛠️',
    isActive: true,
    order: 4
  },
  {
    title: 'Office Solutions',
    description: 'Complete office furniture packages designed for productivity and professional aesthetics.',
    icon: '💼',
    isActive: true,
    order: 5
  },
  {
    title: 'Manufacturing',
    description: 'In-house manufacturing with quality control ensuring durable and long-lasting furniture.',
    icon: '🏭',
    isActive: true,
    order: 6
  }
];

// GET - Fetch all services (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    
    // Check if services exist, if not seed with defaults
    let services = await Service.find(activeOnly ? { isActive: true } : {}).sort({ order: 1 });
    
    if (services.length === 0) {
      // Seed default services
      await Service.insertMany(defaultServices);
      services = await Service.find(activeOnly ? { isActive: true } : {}).sort({ order: 1 });
    }
    
    return NextResponse.json({
      success: true,
      services
    });
  } catch (error) {
    logger.error('Error fetching services:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST - Create new service (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const body = await request.json();
    const { title, description, icon, isActive } = body;
    
    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Title and description are required' },
        { status: 400 }
      );
    }
    
    // Get the highest order number
    const lastService = await Service.findOne().sort({ order: -1 });
    const newOrder = lastService ? lastService.order + 1 : 1;
    
    const service = await Service.create({
      title,
      description,
      icon: icon || '🔧',
      isActive: isActive !== undefined ? isActive : true,
      order: newOrder
    });
    
    return NextResponse.json({
      success: true,
      message: 'Service created successfully',
      service
    }, { status: 201 });
  } catch (error) {
    logger.error('Error creating service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create service' },
      { status: 500 }
    );
  }
}

// PUT - Update multiple services at once (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const body = await request.json();
    const { services } = body;
    
    if (!services || !Array.isArray(services)) {
      return NextResponse.json(
        { success: false, message: 'Services array is required' },
        { status: 400 }
      );
    }
    
    // Update each service
    for (const serviceData of services) {
      if (serviceData._id) {
        await Service.findByIdAndUpdate(serviceData._id, {
          title: serviceData.title,
          description: serviceData.description,
          icon: serviceData.icon,
          isActive: serviceData.isActive,
          order: serviceData.order
        });
      }
    }
    
    const updatedServices = await Service.find().sort({ order: 1 });
    
    return NextResponse.json({
      success: true,
      message: 'Services updated successfully',
      services: updatedServices
    });
  } catch (error) {
    logger.error('Error updating services:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update services' },
      { status: 500 }
    );
  }
}

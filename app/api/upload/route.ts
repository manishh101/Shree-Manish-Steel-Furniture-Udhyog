import { NextRequest, NextResponse } from 'next/server';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary';
import { getUserFromRequest } from '@/lib/auth';

// POST /api/upload - Upload image(s) to Cloudinary
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const folder = formData.get('folder') as string || 'manish-steel';
    
    // Handle multiple images (field name: 'images')
    const multipleFiles = formData.getAll('images') as File[];
    // Handle single image (field name: 'image')
    const singleFile = formData.get('image') as File;
    
    // Combine all files
    const files: File[] = [];
    if (multipleFiles && multipleFiles.length > 0) {
      files.push(...multipleFiles.filter(f => f && f.size > 0));
    }
    if (singleFile && singleFile.size > 0) {
      files.push(singleFile);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Upload all files
    const uploadPromises = files.map(async (file) => {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Convert to base64 for Cloudinary upload
      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;
      
      return uploadToCloudinary(base64, folder);
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map(r => r.secure_url);

    // Return response compatible with both single and multiple uploads
    if (files.length === 1) {
      return NextResponse.json({
        success: true,
        url: results[0].secure_url,
        urls: urls,
        public_id: results[0].public_id,
        width: results[0].width,
        height: results[0].height
      }, { status: 201 });
    }

    return NextResponse.json({
      success: true,
      urls: urls,
      results: results.map(r => ({
        url: r.secure_url,
        public_id: r.public_id,
        width: r.width,
        height: r.height
      }))
    }, { status: 201 });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}

// DELETE /api/upload - Delete image from Cloudinary
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json(
        { error: 'public_id is required' },
        { status: 400 }
      );
    }

    await deleteFromCloudinary(publicId);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}

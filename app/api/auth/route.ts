import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { signToken, getUserFromRequest } from '@/lib/auth';

// POST /api/auth - Login
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email or phone
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.findOne({ phone: email });
    }

    // If no user found, check if this is first-time setup (no users exist)
    // Create default admin user only if database is empty
    if (!user) {
      const userCount = await User.countDocuments();
      
      if (userCount === 0 && email === '9814379071' && password === 'M@nishsteel') {
        // First time setup - create default admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('M@nishsteel', salt);

        user = new User({
          name: 'Manish Steel Admin',
          email: '9814379071',
          phone: '9814379071',
          password: hashedPassword,
          role: 'admin'
        });

        await user.save();
        logger.info('Default admin user created');
      } else {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
          { status: 401 }
        );
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      );
    }

    const token = signToken({
      user: { id: user._id.toString(), role: user.role }
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        }
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during authentication', code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

// GET /api/auth - Get current user
export async function GET(request: NextRequest) {
  try {
    const userData = getUserFromRequest(request);

    if (!userData) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    await connectDB();
    const user = await User.findById(userData.id).select('-password');

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    logger.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}

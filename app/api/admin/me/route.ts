import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      admin
    });

  } catch (error) {
    console.error('Error fetching admin data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin data' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, avatarUrl } = body;

    await connectDB();

    // Validate input
    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length < 1) {
        return NextResponse.json(
          { error: 'Name must be a non-empty string' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (avatarUrl !== undefined) {
      if (avatarUrl && typeof avatarUrl !== 'string') {
        return NextResponse.json(
          { error: 'Avatar URL must be a string' },
          { status: 400 }
        );
      }
      updateData.avatarUrl = avatarUrl || null;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      admin.id,
      updateData,
      { new: true, runValidators: true }
    ).select('name email role avatarUrl createdAt');

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      admin: {
        id: updatedUser._id.toString(),
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role || 'admin',
        avatarUrl: updatedUser.avatarUrl || undefined,
        createdAt: updatedUser.createdAt
      }
    });

  } catch (error) {
    console.error('Error updating admin data:', error);
    return NextResponse.json(
      { error: 'Failed to update admin data' },
      { status: 500 }
    );
  }
}

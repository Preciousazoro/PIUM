import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User, { IUser } from '@/models/User';
import { deleteFromCloudinary } from '@/lib/cloudinary';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username || '',
      avatarUrl: user.avatarUrl || null,
      avatarPublicId: user.avatarPublicId || null,
      taskPoints: user.taskPoints || 0,
      socialLinks: user.socialLinks || {
        twitter: null,
        instagram: null,
        linkedin: null,
      },
    };

    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, avatarUrl, avatarPublicId, socialLinks } = body;

    await connectDB();
    
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if username is already taken by another user (only if username is provided)
    if (username && username.trim() && username !== user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: user._id } 
      });
      
      if (existingUser) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (username !== undefined) {
      // Only validate username if it's provided (not empty)
      if (username && username.trim()) {
        // Backend validation for username
        if (username.length < 3) {
          return NextResponse.json({ error: 'Username should be at least 3 characters long' }, { status: 400 });
        }
        
        if (username.length > 20) {
          return NextResponse.json({ error: 'Username cannot be more than 20 characters' }, { status: 400 });
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 });
        }
        
        user.username = username;
      } else {
        // Allow empty username
        user.username = undefined;
      }
    }
    
    // Handle avatar update with Cloudinary cleanup
    if (avatarUrl !== undefined) {
      // Delete old avatar from Cloudinary if it exists and is different
      if (user.avatarPublicId && user.avatarPublicId !== avatarPublicId) {
        try {
          await deleteFromCloudinary(user.avatarPublicId);
        } catch (error) {
          console.error('Error deleting old avatar:', error);
          // Continue with update even if deletion fails
        }
      }
      
      user.avatarUrl = avatarUrl;
      user.avatarPublicId = avatarPublicId || null;
    }
    
    if (socialLinks) user.socialLinks = socialLinks;

    await user.save();

    const updatedProfile = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username || '',
      avatarUrl: user.avatarUrl || null,
      avatarPublicId: user.avatarPublicId || null,
      taskPoints: user.taskPoints || 0,
      socialLinks: user.socialLinks || {
        twitter: null,
        instagram: null,
        linkedin: null,
      },
    };

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    
    if (error instanceof Error && error.name === 'ValidationError') {
      const validationError = error as any;
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: Object.values(validationError.errors).map((err: any) => err.message)
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

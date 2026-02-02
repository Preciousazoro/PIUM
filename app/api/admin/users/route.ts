import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;
    
    // Get total count of users
    const totalUsers = await User.countDocuments();
    
    // Get paginated users
    const users = await User.find({})
      .select('-password') // Exclude password field
      .sort({ createdAt: -1 }) // Sort by newest first
      .skip(skip)
      .limit(limit)
      .lean(); // Convert to plain JavaScript objects
    
    // Transform users to match expected format
    const transformedUsers = users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username || null,
      avatarUrl: user.avatarUrl || null,
      role: 'user', // Default role since User model doesn't have role field
      status: 'active', // Default status since User model doesn't have status field
      points: user.taskPoints || 0,
      tasksCompleted: user.tasksCompleted || 0,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      socialLinks: user.socialLinks || {}
    }));
    
    const totalPages = Math.ceil(totalUsers / limit);
    
    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

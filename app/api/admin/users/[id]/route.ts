import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const user = await User.findById(params.id).select('-password').lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const transformedUser = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      username: user.username || null,
      avatarUrl: user.avatarUrl || null,
      role: user.role || 'user',
      status: user.status || 'active',
      points: user.taskPoints || 0,
      tasksCompleted: user.tasksCompleted || 0,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      socialLinks: user.socialLinks || {}
    };

    return NextResponse.json(transformedUser);
    
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

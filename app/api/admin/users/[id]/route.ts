import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    const user = await User.findById(id).select('-password').lean();
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const transformedUser = {
      _id: (user as any)._id?.toString() || '',
      name: (user as any).name,
      email: (user as any).email,
      username: (user as any).username || null,
      avatarUrl: (user as any).avatarUrl || null,
      role: (user as any).role || 'user',
      status: (user as any).status || 'active',
      points: (user as any).taskPoints || 0,
      tasksCompleted: (user as any).tasksCompleted || 0,
      createdAt: (user as any).createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: (user as any).updatedAt?.toISOString() || new Date().toISOString(),
      socialLinks: (user as any).socialLinks || {}
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

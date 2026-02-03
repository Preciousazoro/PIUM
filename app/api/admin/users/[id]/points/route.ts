import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { points } = body;

    if (typeof points !== 'number' || points < 0) {
      return NextResponse.json(
        { error: 'Invalid points value. Must be a non-negative number.' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      params.id,
      { taskPoints: points },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'User points updated successfully',
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        points: user.taskPoints || 0
      }
    });
    
  } catch (error) {
    console.error('Error updating user points:', error);
    return NextResponse.json(
      { error: 'Failed to update user points' },
      { status: 500 }
    );
  }
}

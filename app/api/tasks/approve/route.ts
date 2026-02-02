import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const { taskId, reward, userId } = await request.json();

    // Validate input
    if (!taskId || !reward || typeof reward !== 'number' || reward <= 0) {
      return NextResponse.json(
        { error: 'Invalid task data' },
        { status: 400 }
      );
    }

    await connectDB();

    // For admin approval, we use userId from request body
    // For user self-approval, we use session user ID
    const targetUserId = userId || (session?.user?.id);

    if (!targetUserId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(targetUserId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Increment taskPoints and tasksCompleted
    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      {
        $inc: { 
          taskPoints: reward,
          tasksCompleted: 1
        }
      },
      { new: true } // Return the updated document
    );

    return NextResponse.json({
      message: 'Task approved successfully',
      taskPoints: updatedUser.taskPoints,
      tasksCompleted: updatedUser.tasksCompleted,
      reward: reward,
      userId: targetUserId
    });

  } catch (error) {
    console.error('Task approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find user
    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      taskPoints: user.taskPoints,
      tasksCompleted: user.tasksCompleted
    });

  } catch (error) {
    console.error('Get user points error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

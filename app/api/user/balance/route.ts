import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

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

    // Ensure user has at least 50 TP (welcome bonus)
    let updatedUser = user;
    if (!user.taskPoints || user.taskPoints < 50) {
      updatedUser = await User.findByIdAndUpdate(
        session.user.id,
        { $set: { taskPoints: 50 } },
        { new: true }
      );
    }

    return NextResponse.json({
      taskPoints: updatedUser.taskPoints,
      tasksCompleted: updatedUser.tasksCompleted || 0,
      welcomeBonusApplied: !user.taskPoints || user.taskPoints < 50
    });

  } catch (error) {
    console.error('Get user points error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

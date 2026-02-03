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

    // Only apply welcome bonus if not already granted and user has 0 points
    let welcomeBonusApplied = false;
    if (!user.welcomeBonusGranted && (!user.taskPoints || user.taskPoints === 0)) {
      try {
        const { createWelcomeBonus } = await import('@/lib/transactions');
        await createWelcomeBonus(session.user.id);
        welcomeBonusApplied = true;
        
        // Refresh user data after bonus
        const updatedUser = await User.findById(session.user.id);
        return NextResponse.json({
          taskPoints: updatedUser?.taskPoints || 50,
          tasksCompleted: updatedUser?.tasksCompleted || 0,
          welcomeBonusApplied
        });
      } catch (error) {
        console.error('Error applying welcome bonus:', error);
      }
    }

    return NextResponse.json({
      taskPoints: user.taskPoints || 0,
      tasksCompleted: user.tasksCompleted || 0,
      welcomeBonusApplied
    });

  } catch (error) {
    console.error('Get user points error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

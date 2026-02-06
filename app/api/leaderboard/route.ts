import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';

// Helper function to determine user level based on task points
function getUserLevel(taskPoints: number): string {
  if (taskPoints >= 15000) return 'Expert';
  if (taskPoints >= 8000) return 'Advanced';
  if (taskPoints >= 3000) return 'Intermediate';
  return 'Beginner';
}

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get top 3 users for podium
    const topThreeUsers = await User.find({})
      .select('username name avatarUrl taskPoints tasksCompleted createdAt')
      .sort({ taskPoints: -1, tasksCompleted: -1, createdAt: 1 })
      .limit(3)
      .lean();

    // Get top 10 users for table
    const topTenUsers = await User.find({})
      .select('username name avatarUrl taskPoints tasksCompleted createdAt')
      .sort({ taskPoints: -1, tasksCompleted: -1, createdAt: 1 })
      .limit(10)
      .lean();

    // Transform data for frontend
    const transformUser = (user: any, rank: number) => ({
      rank,
      username: user.username || user.name || `User${user._id.toString().slice(-6)}`,
      avatar: user.avatarUrl || null,
      taskPoints: user.taskPoints || 0,
      tasksCompleted: user.tasksCompleted || 0,
      level: getUserLevel(user.taskPoints || 0)
    });

    const podium = topThreeUsers.map((user, index) => transformUser(user, index + 1));
    const topPerformers = topTenUsers.map((user, index) => transformUser(user, index + 1));

    return NextResponse.json({
      success: true,
      data: {
        topThree: podium,
        topTen: topPerformers
      }
    });

  } catch (error) {
    console.error('Leaderboard API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard data' },
      { status: 500 }
    );
  }
}

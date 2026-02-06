import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-auth';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';

// GET recent activities for admin dashboard
export async function GET(request: NextRequest) {
  try {
    // Check authentication - should be admin
    const session = await auth();
    const adminCheck = await isAdmin();
    
    if (!session?.user?.email || !adminCheck) {
      console.log('Admin auth failed:', { session: !!session, adminCheck });
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Connect to database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get total count for pagination
    const total = await Activity.countDocuments();

    // Fetch recent activities with populated user data
    const activities = await Activity.find()
      .populate('userId', 'name username email avatarUrl')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Format activities for frontend
    const formattedActivities = activities.map(activity => ({
      _id: activity._id,
      type: activity.type,
      title: activity.title,
      description: activity.description,
      status: activity.status,
      rewardPoints: activity.rewardPoints,
      createdAt: activity.createdAt,
      user: activity.userId ? {
        _id: (activity.userId as any)._id,
        name: (activity.userId as any).name || 'Unknown User',
        username: (activity.userId as any).username,
        email: (activity.userId as any).email,
        avatarUrl: (activity.userId as any).avatarUrl
      } : null,
      metadata: activity.metadata
    }));

    return NextResponse.json({
      activities: formattedActivities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching admin activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

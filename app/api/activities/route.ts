import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Activity from '@/models/Activity';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '5');
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Connect to database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build query
    const query: any = {};
    
    // Filter by activity type if specified
    if (type) {
      query.type = type;
    }
    
    // Filter by status if specified
    if (status) {
      query.status = status;
    }

    // Get user's email from session and find their activities
    // Note: You'll need to adapt this based on your auth setup
    // For now, we'll assume the user ID is available in the session
    const userId = session.user.id || session.user.email;
    
    // If we have email but not ID, we need to find the user first
    let userObjectId;
    if (typeof userId === 'string' && userId.includes('@')) {
      // This is an email, we need to find the user
      const User = mongoose.models.User;
      const user = await User.findOne({ email: userId }).select('_id');
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      userObjectId = user._id;
    } else {
      userObjectId = new mongoose.Types.ObjectId(userId as string);
    }

    query.userId = userObjectId;

    // Get total count for pagination
    const total = await Activity.countDocuments(query);

    // Fetch activities with pagination
    const activities = await Activity.find(query)
      .populate('taskId', 'title category rewardPoints')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Format activities for frontend
    const formattedActivities = activities.map(activity => ({
      _id: activity._id,
      type: activity.type,
      status: activity.status,
      title: activity.title,
      description: activity.description,
      rewardPoints: activity.rewardPoints,
      taskDetails: activity.taskId ? {
        title: (activity.taskId as any).title || activity.metadata?.taskTitle,
        category: (activity.taskId as any).category || activity.metadata?.taskCategory,
        rewardPoints: (activity.taskId as any).rewardPoints || activity.rewardPoints
      } : {
        title: activity.metadata?.taskTitle,
        category: activity.metadata?.taskCategory,
        rewardPoints: activity.rewardPoints
      },
      metadata: activity.metadata,
      createdAt: activity.createdAt,
      updatedAt: activity.updatedAt
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
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

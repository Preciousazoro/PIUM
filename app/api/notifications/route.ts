import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';

// GET /api/notifications - Fetch user notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const query: any = { userId: session.user.id };
    
    // Debug: Log the query to see what userId we're using
    console.log('Fetching notifications for userId:', session.user.id);
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: session.user.id,
      isRead: false
    });

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Mark notifications as read
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    let updateQuery: any = { userId: session.user.id };

    if (markAllAsRead) {
      updateQuery.isRead = false;
    } else if (notificationIds && Array.isArray(notificationIds)) {
      updateQuery._id = { $in: notificationIds };
    } else {
      return NextResponse.json(
        { error: 'Invalid request. Provide notificationIds or markAllAsRead' },
        { status: 400 }
      );
    }

    const result = await Notification.updateMany(
      updateQuery,
      { isRead: true }
    );

    return NextResponse.json({
      message: 'Notifications marked as read',
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

// PATCH /api/notifications - Mark single notification as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const markAllAsRead = searchParams.get('readAll') === 'true';

    if (markAllAsRead) {
      // Mark all notifications as read
      await Notification.updateMany(
        { userId: session.user.id, isRead: false },
        { isRead: true }
      );

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationId) {
      // Mark specific notification as read
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, userId: session.user.id },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return NextResponse.json(
          { error: 'Notification not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read'
      });
    } else {
      return NextResponse.json(
        { error: 'Missing notification ID or readAll parameter' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    );
  }
}

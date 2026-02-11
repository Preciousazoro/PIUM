import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth';
import AdminNotification from '@/models/AdminNotification';
import connectDB from '@/lib/mongodb';

// Helper function to generate notification links
function getNotificationLink(notification: any): string {
  if (!notification.referenceId || !notification.referenceType) {
    return '/admin-dashboard';
  }

  const base = '/admin-dashboard';
  switch (notification.referenceType) {
    case 'task':
      return `${base}/tasks`;
    case 'submission':
      return `${base}/submissions`;
    case 'booking':
      return `${base}/bookings`;
    case 'user':
      return `${base}/users`;
    case 'contact':
      return `${base}/contact`;
    default:
      return base;
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    // Fetch admin notifications
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const unreadCount = await AdminNotification.countDocuments({
      isRead: false
    });

    // Format notifications for frontend
    const formattedNotifications = notifications.map((notification: any) => ({
      id: notification._id?.toString() || '',
      type: notification.type,
      title: notification.title,
      message: notification.message,
      referenceId: notification.referenceId?.toString(),
      referenceType: notification.referenceType,
      link: getNotificationLink(notification),
      createdAt: notification.createdAt,
      read: notification.isRead
    }));

    return NextResponse.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount
    });

  } catch (error) {
    console.error('Error fetching admin notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const readAll = searchParams.get('readAll') === 'true';

    if (readAll) {
      // Mark all notifications as read
      await AdminNotification.updateMany(
        { isRead: false },
        { isRead: true }
      );

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (notificationId) {
      // Mark specific notification as read
      const notification = await AdminNotification.findByIdAndUpdate(
        notificationId,
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
    console.error('Error updating admin notifications:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

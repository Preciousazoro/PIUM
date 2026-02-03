import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth';
import Notification from '@/models/Notification';
import connectDB from '@/lib/mongodb';

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

    // Fetch notifications for admin users
    // We can either filter by userId for admin-specific notifications
    // or return system-wide notifications for admins
    const notifications = await Notification.find({
      $or: [
        { userId: admin.id }, // Admin-specific notifications
        { type: 'system' }, // System notifications for all admins
      ]
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

    const unreadCount = await Notification.countDocuments({
      $or: [
        { userId: admin.id },
        { type: 'system' },
      ],
      isRead: false
    });

    // Format notifications for frontend
    const formattedNotifications = notifications.map(notification => ({
      id: notification._id.toString(),
      title: notification.title,
      message: notification.message,
      type: notification.type,
      link: notification.actionUrl,
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

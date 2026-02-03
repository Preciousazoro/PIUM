import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/admin-auth';
import Notification from '@/models/Notification';
import connectDB from '@/lib/mongodb';

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

    const body = await request.json();
    const { id, all } = body;

    if (all) {
      // Mark all notifications as read for this admin
      await Notification.updateMany(
        {
          $or: [
            { userId: admin.id },
            { type: 'system' },
          ],
          isRead: false
        },
        { isRead: true }
      );

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } else if (id) {
      // Mark specific notification as read
      const notification = await Notification.findOneAndUpdate(
        {
          _id: id,
          $or: [
            { userId: admin.id },
            { type: 'system' },
          ]
        },
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
        { error: 'Either id or all parameter is required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error marking notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
}

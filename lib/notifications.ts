import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import User from '@/models/User';

/**
 * Create a notification for a specific user or all admins
 */
export async function createNotification(data: {
  userId?: string;
  title: string;
  message: string;
  type: 'task' | 'system' | 'reward' | 'profile' | 'alert';
  actionUrl?: string;
  forAllAdmins?: boolean;
}) {
  try {
    await connectDB();

    let userIds: string[] = [];

    if (data.forAllAdmins) {
      // Get all admin users
      const admins = await User.find({ role: 'admin' });
      userIds = admins.map(admin => admin._id.toString());
    } else if (data.userId) {
      userIds = [data.userId];
    } else {
      throw new Error('Either userId or forAllAdmins must be provided');
    }

    // Create notifications for all specified users
    const notifications = userIds.map(userId => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type,
      actionUrl: data.actionUrl || null,
      isRead: false
    }));

    const result = await Notification.insertMany(notifications);
    return result;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

/**
 * Create sample admin notifications for testing
 */
export async function createSampleAdminNotifications() {
  const sampleNotifications = [
    {
      title: 'New User Registration',
      message: 'John Doe has just registered on the platform',
      type: 'system' as const,
      actionUrl: '/admin-dashboard/users',
      forAllAdmins: true as const
    },
    {
      title: 'Task Submission',
      message: '5 new task submissions require review',
      type: 'task' as const,
      actionUrl: '/admin-dashboard/submissions',
      forAllAdmins: true as const
    },
    {
      title: 'Reward Request',
      message: 'Sarah Smith requested a $50 reward',
      type: 'reward' as const,
      actionUrl: '/admin-dashboard/rewards',
      forAllAdmins: true as const
    },
    {
      title: 'System Update',
      message: 'Database backup completed successfully',
      type: 'system' as const,
      forAllAdmins: true as const
    },
    {
      title: 'Security Alert',
      message: 'Multiple failed login attempts detected',
      type: 'alert' as const,
      actionUrl: '/admin-dashboard/reports',
      forAllAdmins: true as const
    }
  ];

  try {
    const results = [];
    for (const notification of sampleNotifications) {
      const result = await createNotification(notification);
      results.push(...result);
    }
    return results;
  } catch (error) {
    console.error('Error creating sample notifications:', error);
    throw error;
  }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    await connectDB();
    const result = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    return result;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    await connectDB();
    const result = await Notification.updateMany(
      { 
        $or: [
          { userId },
          { type: 'system' } // Also mark system notifications as read
        ],
        isRead: false 
      },
      { isRead: true }
    );
    return result;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
}

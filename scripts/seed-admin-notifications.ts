import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';

async function seedAdminNotifications() {
  try {
    await connectDB();
    
    // Find admin user
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('No admin user found. Please create an admin user first.');
      return;
    }

    console.log(`Found admin user: ${admin.name} (${admin.email})`);

    // Sample notifications for admin
    const sampleNotifications = [
      {
        userId: admin._id,
        title: 'New User Registration',
        message: 'John Doe has just registered on the platform',
        type: 'system' as const,
        actionUrl: '/admin-dashboard/users',
        isRead: false
      },
      {
        userId: admin._id,
        title: 'Task Submission',
        message: '5 new task submissions require review',
        type: 'task' as const,
        actionUrl: '/admin-dashboard/submissions',
        isRead: false
      },
      {
        userId: admin._id,
        title: 'Reward Request',
        message: 'Sarah Smith requested a $50 reward',
        type: 'reward' as const,
        actionUrl: '/admin-dashboard/rewards',
        isRead: false
      },
      {
        userId: admin._id,
        title: 'System Update',
        message: 'Database backup completed successfully',
        type: 'system' as const,
        isRead: true
      },
      {
        userId: admin._id,
        title: 'Security Alert',
        message: 'Multiple failed login attempts detected',
        type: 'alert' as const,
        actionUrl: '/admin-dashboard/reports',
        isRead: false
      },
      {
        userId: admin._id,
        title: 'Profile Update',
        message: 'Admin profile settings have been updated',
        type: 'profile' as const,
        actionUrl: '/admin-dashboard/profile',
        isRead: true
      }
    ];

    // Clear existing admin notifications
    await Notification.deleteMany({ userId: admin._id });
    console.log('Cleared existing admin notifications');

    // Add new notifications with different timestamps
    const notifications = [];
    const now = new Date();
    
    for (let i = 0; i < sampleNotifications.length; i++) {
      const notification = sampleNotifications[i];
      // Stagger the timestamps over the last few days
      const createdAt = new Date(now.getTime() - (i * 2 * 60 * 60 * 1000)); // Every 2 hours
      
      notifications.push({
        ...notification,
        createdAt,
        updatedAt: createdAt
      });
    }

    // Insert notifications
    const insertedNotifications = await Notification.insertMany(notifications);
    
    console.log(`✅ Successfully created ${insertedNotifications.length} admin notifications`);
    
    // Display created notifications
    insertedNotifications.forEach((notif, index) => {
      const status = notif.isRead ? 'READ' : 'UNREAD';
      const timeAgo = Math.floor((now.getTime() - notif.createdAt.getTime()) / (1000 * 60));
      console.log(`  ${index + 1}. [${status}] ${notif.title} - ${timeAgo} minutes ago`);
    });

  } catch (error) {
    console.error('Error seeding admin notifications:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed function
seedAdminNotifications();

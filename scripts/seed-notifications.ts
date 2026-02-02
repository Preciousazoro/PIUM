import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Notification from '@/models/Notification';

const sampleNotifications = [
  {
    title: 'Welcome to TaskKash!',
    message: 'Get started by completing your profile and exploring available tasks.',
    type: 'system' as const,
    actionUrl: '/user-dashboard/profile'
  },
  {
    title: 'New Task Available',
    message: 'Follow TaskKash on X to earn 50 TP. Limited time offer!',
    type: 'task' as const,
    actionUrl: '/user-dashboard/dashboard'
  },
  {
    title: 'Daily Login Bonus',
    message: 'You received 10 TP for logging in today. Keep your streak going!',
    type: 'reward' as const,
    actionUrl: '/user-dashboard/transactions'
  },
  {
    title: 'Profile Completion',
    message: 'Complete your profile to unlock more personalized tasks and rewards.',
    type: 'profile' as const,
    actionUrl: '/user-dashboard/profile'
  },
  {
    title: 'Task Approved',
    message: 'Your task submission has been approved. 50 TP has been added to your balance.',
    type: 'reward' as const,
    actionUrl: '/user-dashboard/transactions'
  }
];

async function seedNotifications() {
  try {
    await connectDB();
    
    // Get all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log('No users found. Please create users first.');
      return;
    }

    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Cleared existing notifications');

    // Create notifications for each user
    for (const user of users) {
      for (let i = 0; i < sampleNotifications.length; i++) {
        const notifData = {
          ...sampleNotifications[i],
          userId: user._id,
          isRead: i >= 2, // Mark first 2 as unread
          createdAt: new Date(Date.now() - (i * 60 * 60 * 1000)) // Stagger by hours
        };

        await Notification.create(notifData);
      }
    }

    console.log(`Successfully created ${sampleNotifications.length} notifications for each user`);
    
  } catch (error) {
    console.error('Error seeding notifications:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run the seed function
seedNotifications();

import mongoose from 'mongoose';
import Notification from '@/models/Notification';
import connectDB from '@/lib/mongodb';

export interface CreateUserNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  type: 'task' | 'system' | 'reward' | 'profile' | 'alert' | 'task_approved' | 'task_rejected' | 'new_task' | 'submission_received' | 'points_earned' | 'welcome_bonus';
  title: string;
  message: string;
  actionUrl?: string;
}

/**
 * Creates a new user notification
 * This is the centralized utility for creating all user notifications
 */
export async function createUserNotification(params: CreateUserNotificationParams): Promise<void> {
  try {
    await connectDB();
    
    // Debug: Log the notification creation
    console.log('Creating user notification:', {
      userId: params.userId,
      type: params.type,
      title: params.title
    });
    
    await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      actionUrl: params.actionUrl
    });

    console.log(`✅ User notification created for user ${params.userId}: ${params.type} - ${params.title}`);
  } catch (error) {
    console.error('❌ Failed to create user notification:', error);
    // Don't throw error to avoid breaking main functionality
  }
}

/**
 * Predefined notification creators for common user events
 */
export const UserNotifications = {
  taskApproved: (userId: string, taskTitle: string, rewardPoints: number) =>
    createUserNotification({
      userId,
      type: 'task_approved',
      title: 'Task Approved! 🎉',
      message: `Your submission for "${taskTitle}" has been approved! You earned ${rewardPoints} TP.`,
      actionUrl: '/user-dashboard/my-tasks'
    }),

  taskRejected: (userId: string, taskTitle: string, rejectionReason?: string) =>
    createUserNotification({
      userId,
      type: 'task_rejected',
      title: 'Task Submission Review',
      message: `Your submission for "${taskTitle}" needs revision. ${rejectionReason ? `Reason: ${rejectionReason}` : 'Please review the requirements and try again.'}`,
      actionUrl: '/user-dashboard/my-tasks'
    }),

  submissionReceived: (userId: string, taskTitle: string) =>
    createUserNotification({
      userId,
      type: 'submission_received',
      title: 'Task Submitted Successfully',
      message: `Your proof for "${taskTitle}" has been submitted and is now under review.`,
      actionUrl: '/user-dashboard/my-tasks'
    }),

  newTaskAvailable: (userId: string, taskTitle: string, category: string, rewardPoints: number) =>
    createUserNotification({
      userId,
      type: 'new_task',
      title: 'New Task Available! 🆕',
      message: `Check out "${taskTitle}" in ${category} category. Earn ${rewardPoints} TP!`,
      actionUrl: '/user-dashboard/tasks'
    }),

  pointsEarned: (userId: string, points: number, source: string) =>
    createUserNotification({
      userId,
      type: 'points_earned',
      title: 'Points Earned! 💰',
      message: `You earned ${points} TP from ${source}.`,
      actionUrl: '/user-dashboard/profile'
    }),

  welcomeBonus: (userId: string, bonusPoints: number) =>
    createUserNotification({
      userId,
      type: 'welcome_bonus',
      title: 'Welcome Bonus! 🎁',
      message: `Welcome to TaskKash! You've received ${bonusPoints} TP as a welcome bonus.`,
      actionUrl: '/user-dashboard/tasks'
    }),

  systemAlert: (userId: string, title: string, message: string) =>
    createUserNotification({
      userId,
      type: 'alert',
      title,
      message,
      actionUrl: '/user-dashboard/dashboard'
    }),

  profileUpdate: (userId: string) =>
    createUserNotification({
      userId,
      type: 'profile',
      title: 'Profile Updated',
      message: 'Your profile has been successfully updated.',
      actionUrl: '/user-dashboard/profile'
    }),

  rewardClaimed: (userId: string, rewardName: string) =>
    createUserNotification({
      userId,
      type: 'reward',
      title: 'Reward Claimed! 🏆',
      message: `You have successfully claimed "${rewardName}".`,
      actionUrl: '/user-dashboard/rewards'
    })
};

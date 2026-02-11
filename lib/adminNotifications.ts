import mongoose from 'mongoose';
import AdminNotification from '@/models/AdminNotification';
import connectDB from '@/lib/mongodb';

export interface CreateNotificationParams {
  type: 'task_submission' | 'booking' | 'contact_message' | 'new_user' | 'task_approved' | 'task_rejected' | 'system';
  title: string;
  message: string;
  referenceId?: mongoose.Types.ObjectId | string;
  referenceType?: 'task' | 'booking' | 'user' | 'contact' | 'submission' | 'activity';
}

/**
 * Creates a new admin notification
 * This is the centralized utility for creating all admin notifications
 */
export async function createAdminNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await connectDB();
    
    // Convert string ID to ObjectId if provided
    let referenceId = params.referenceId;
    if (typeof referenceId === 'string') {
      referenceId = new mongoose.Types.ObjectId(referenceId);
    }

    await AdminNotification.create({
      type: params.type,
      title: params.title,
      message: params.message,
      referenceId,
      referenceType: params.referenceType
    });

    console.log(`Admin notification created: ${params.type} - ${params.title}`);
  } catch (error) {
    console.error('Failed to create admin notification:', error);
    // Don't throw error to avoid breaking main functionality
  }
}

/**
 * Predefined notification creators for common events
 */
export const AdminNotifications = {
  taskSubmitted: (taskId: string, taskTitle: string, userName: string) =>
    createAdminNotification({
      type: 'task_submission',
      title: 'New Task Submission',
      message: `${userName} submitted a task: "${taskTitle}"`,
      referenceId: taskId,
      referenceType: 'task'
    }),

  bookingCreated: (bookingId: string, brandName: string) =>
    createAdminNotification({
      type: 'booking',
      title: 'New Booking Session',
      message: `${brandName} has booked a session`,
      referenceId: bookingId,
      referenceType: 'booking'
    }),

  contactMessageReceived: (messageId: string, senderName: string, subject: string) =>
    createAdminNotification({
      type: 'contact_message',
      title: 'New Contact Message',
      message: `${senderName}: ${subject}`,
      referenceId: messageId,
      referenceType: 'contact'
    }),

  userSignedUp: (userId: string, userName: string, userEmail: string) =>
    createAdminNotification({
      type: 'new_user',
      title: 'New User Registration',
      message: `${userName} (${userEmail}) joined the platform`,
      referenceId: userId,
      referenceType: 'user'
    }),

  taskApproved: (submissionId: string, taskTitle: string, userName: string) =>
    createAdminNotification({
      type: 'task_approved',
      title: 'Task Approved',
      message: `Approved submission for "${taskTitle}" by ${userName}`,
      referenceId: submissionId,
      referenceType: 'submission'
    }),

  taskRejected: (submissionId: string, taskTitle: string, userName: string) =>
    createAdminNotification({
      type: 'task_rejected',
      title: 'Task Rejected',
      message: `Rejected submission for "${taskTitle}" by ${userName}`,
      referenceId: submissionId,
      referenceType: 'submission'
    }),

  systemAlert: (title: string, message: string) =>
    createAdminNotification({
      type: 'system',
      title,
      message
    })
};

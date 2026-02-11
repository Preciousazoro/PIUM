import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'task' | 'system' | 'reward' | 'profile' | 'alert' | 'task_approved' | 'task_rejected' | 'new_task' | 'submission_received' | 'points_earned' | 'welcome_bonus';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema<INotification> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a notification title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Please provide a notification message'],
    trim: true,
    maxlength: [500, 'Message cannot be more than 500 characters']
  },
  type: {
    type: String,
    enum: ['task', 'system', 'reward', 'profile', 'alert', 'task_approved', 'task_rejected', 'new_task', 'submission_received', 'points_earned', 'welcome_bonus'],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  actionUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

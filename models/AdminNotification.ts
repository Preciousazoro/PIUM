import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminNotification extends Document {
  type: 'task_submission' | 'booking' | 'contact_message' | 'new_user' | 'task_approved' | 'task_rejected' | 'system';
  title: string;
  message: string;
  referenceId?: mongoose.Types.ObjectId;
  referenceType?: 'task' | 'booking' | 'user' | 'contact' | 'submission' | 'activity';
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminNotificationSchema: Schema<IAdminNotification> = new Schema({
  type: {
    type: String,
    enum: ['task_submission', 'booking', 'contact_message', 'new_user', 'task_approved', 'task_rejected', 'system'],
    required: [true, 'Please provide a notification type'],
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
  referenceId: {
    type: Schema.Types.ObjectId,
    default: null,
    index: true
  },
  referenceType: {
    type: String,
    enum: ['task', 'booking', 'user', 'contact', 'submission', 'activity'],
    default: null
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
AdminNotificationSchema.index({ isRead: 1, createdAt: -1 });
AdminNotificationSchema.index({ type: 1, createdAt: -1 });

export default mongoose.models.AdminNotification || mongoose.model<IAdminNotification>('AdminNotification', AdminNotificationSchema);

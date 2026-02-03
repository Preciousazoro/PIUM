import mongoose, { Document, Schema } from 'mongoose';

export enum ActivityType {
  TASK_STARTED = 'task_started',
  TASK_SUBMITTED = 'task_submitted',
  TASK_APPROVED = 'task_approved',
  TASK_REJECTED = 'task_rejected',
  DAILY_BONUS = 'daily_bonus',
  WELCOME_BONUS = 'welcome_bonus',
  PROFILE_UPDATED = 'profile_updated'
}

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  type: ActivityType;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  title: string;
  description?: string;
  rewardPoints?: number;
  metadata?: {
    taskTitle?: string;
    taskCategory?: string;
    rejectionReason?: string;
    proofUrl?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema: Schema<IActivity> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID'],
    index: true
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: false,
    index: true
  },
  type: {
    type: String,
    enum: Object.values(ActivityType),
    required: [true, 'Please provide an activity type']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'completed',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  rewardPoints: {
    type: Number,
    min: 0,
    default: 0
  },
  metadata: {
    taskTitle: String,
    taskCategory: String,
    rejectionReason: String,
    proofUrl: String
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, type: 1, createdAt: -1 });
ActivitySchema.index({ userId: 1, status: 1, createdAt: -1 });

export default mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

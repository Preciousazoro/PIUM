import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  description: string;
  category: 'social' | 'content' | 'commerce';
  rewardPoints: number;
  validationType: string;
  instructions: string;
  taskLink?: string;
  alternateUrl?: string;
  deadline: Date | undefined;
  status: 'active' | 'expired' | 'disabled';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema<ITask> = new Schema({
  title: {
    type: String,
    required: [true, 'Please provide a task title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a task description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    enum: {
      values: ['social', 'content', 'commerce'],
      message: 'Category must be one of: social, content, commerce'
    },
    default: 'social'
  },
  rewardPoints: {
    type: Number,
    required: [true, 'Please provide reward points'],
    default: 0,
    min: [0, 'Reward points cannot be negative']
  },
  validationType: {
    type: String,
    required: [true, 'Please provide validation type'],
    trim: true,
    maxlength: [100, 'Validation type cannot be more than 100 characters']
  },
  instructions: {
    type: String,
    required: [true, 'Please provide task instructions'],
    trim: true,
    maxlength: [1000, 'Instructions cannot be more than 1000 characters']
  },
  taskLink: {
    type: String,
    required: false, // Made optional since we allow alternateUrl
    trim: true,
    maxlength: [500, 'Task link cannot be more than 500 characters'],
    default: ''
  },
  alternateUrl: {
    type: String,
    required: false,
    trim: true,
    maxlength: [500, 'Alternate URL cannot be more than 500 characters'],
    default: ''
  },
  deadline: {
    type: Date,
    required: false,
    default: null
  },
  status: {
    type: String,
    required: true,
    enum: {
      values: ['active', 'expired', 'disabled'],
      message: 'Status must be one of: active, expired, disabled'
    },
    default: 'active'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  // Ensure schema is always updated
  collection: 'tasks'
});

// Index for better query performance
TaskSchema.index({ status: 1, deadline: 1, createdAt: -1 });
TaskSchema.index({ category: 1 });
TaskSchema.index({ createdBy: 1 });
TaskSchema.index({ title: 'text', description: 'text' }); // For search functionality

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

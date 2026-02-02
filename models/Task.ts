import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  title: string;
  category: string;
  reward: number;
  status: 'Active' | 'Draft' | 'Paused';
  participants: number;
  description?: string;
  instructions?: string;
  proofType?: 'Screenshot' | 'Username' | 'Text' | 'Link';
  deadline?: Date;
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
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true,
    enum: ['Social', 'Community', 'Referral', 'Content', 'Commerce', 'Other']
  },
  reward: {
    type: Number,
    required: [true, 'Please provide reward points'],
    default: 0,
    min: [0, 'Reward cannot be negative']
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Draft', 'Paused'],
    default: 'Draft'
  },
  participants: {
    type: Number,
    default: 0,
    min: [0, 'Participants cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instructions cannot be more than 1000 characters']
  },
  proofType: {
    type: String,
    enum: ['Screenshot', 'Username', 'Text', 'Link'],
    default: 'Screenshot'
  },
  deadline: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for better query performance
TaskSchema.index({ status: 1, createdAt: -1 });
TaskSchema.index({ category: 1 });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

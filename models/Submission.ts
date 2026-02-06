import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  userId: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  progressId?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  proofUrls: string[];
  proofLink?: string;
  notes?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  awardedPoints?: number;
}

const SubmissionSchema: Schema<ISubmission> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID'],
    index: true
  },
  taskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: [true, 'Please provide a task ID'],
    index: true
  },
  progressId: {
    type: Schema.Types.ObjectId,
    ref: 'UserTask',
    required: false,
    index: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    required: true,
    index: true
  },
  proofUrls: [{
    type: String,
    required: false
  }],
  proofLink: {
    type: String,
    trim: true,
    required: false
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  reviewedAt: {
    type: Date,
    required: false
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot be more than 500 characters']
  },
  awardedPoints: {
    type: Number,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
SubmissionSchema.index({ userId: 1, status: 1, createdAt: -1 });
SubmissionSchema.index({ taskId: 1, status: 1 });
SubmissionSchema.index({ status: 1, createdAt: -1 });
// Removed unique index on progressId since it's now optional

export default mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);

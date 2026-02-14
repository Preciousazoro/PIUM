import mongoose, { Document, Schema } from 'mongoose';

export enum TransactionType {
  WELCOME_BONUS = 'welcome_bonus',
  DAILY_LOGIN = 'daily_login',
  TASK_COMPLETED = 'task_completed',
  TASK_APPROVED = 'task_approved',
  REWARD_REDEEMED = 'reward_redeemed',
  ADMIN_ADJUSTMENT = 'admin_adjustment'
}

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: TransactionType;
  description: string;
  createdAt: Date;
}

const TransactionSchema: Schema<ITransaction> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: -1000000
  },
  type: {
    type: String,
    enum: Object.values(TransactionType),
    required: [true, 'Please provide a transaction type']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [200, 'Description cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Compound index for user and date to prevent duplicate daily bonuses
TransactionSchema.index({ userId: 1, type: 1, createdAt: 1 }, { unique: true });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

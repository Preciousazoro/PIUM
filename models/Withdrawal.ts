import mongoose, { Document, Schema } from 'mongoose';

export enum WithdrawalType {
  BANK_TRANSFER = 'bank',
  USDT_CRYPTO = 'crypto'
}

export enum CryptoNetwork {
  TRC20 = 'TRC20',
  ERC20 = 'ERC20'
}

export enum WithdrawalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

export interface CryptoDetails {
  network: CryptoNetwork;
  walletAddress: string;
}

export interface IWithdrawal extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number; // TP amount
  convertedAmount: number; // USD equivalent
  withdrawalType: WithdrawalType;
  status: WithdrawalStatus;
  bankDetails?: BankDetails;
  cryptoDetails?: CryptoDetails;
  processingTime?: string; // Estimated processing time
  adminNote?: string; // Admin notes for approval/rejection
  createdAt: Date;
  updatedAt: Date;
}

const BankDetailsSchema: Schema<BankDetails> = new Schema({
  bankName: {
    type: String,
    required: function(this: BankDetails & { withdrawalType?: WithdrawalType }) {
      return this.withdrawalType === WithdrawalType.BANK_TRANSFER;
    },
    trim: true
  },
  accountName: {
    type: String,
    required: function(this: BankDetails & { withdrawalType?: WithdrawalType }) {
      return this.withdrawalType === WithdrawalType.BANK_TRANSFER;
    },
    trim: true
  },
  accountNumber: {
    type: String,
    required: function(this: BankDetails & { withdrawalType?: WithdrawalType }) {
      return this.withdrawalType === WithdrawalType.BANK_TRANSFER;
    },
    trim: true
  }
});

const CryptoDetailsSchema: Schema<CryptoDetails> = new Schema({
  network: {
    type: String,
    enum: Object.values(CryptoNetwork),
    required: function(this: CryptoDetails & { withdrawalType?: WithdrawalType }) {
      return this.withdrawalType === WithdrawalType.USDT_CRYPTO;
    }
  },
  walletAddress: {
    type: String,
    required: function(this: CryptoDetails & { withdrawalType?: WithdrawalType }) {
      return this.withdrawalType === WithdrawalType.USDT_CRYPTO;
    },
    trim: true,
    validate: {
      validator: function(this: CryptoDetails & { withdrawalType?: WithdrawalType }, address: string) {
        if (this.withdrawalType === WithdrawalType.USDT_CRYPTO) {
          // Basic validation for crypto addresses
          return !!(address && address.length >= 10);
        }
        return true;
      },
      message: 'Please enter a valid wallet address'
    }
  }
});

const WithdrawalSchema: Schema<IWithdrawal> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a user ID'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Please provide an amount'],
    min: [500, 'Minimum withdrawal amount is 500 TP']
  },
  convertedAmount: {
    type: Number,
    required: [true, 'Please provide converted amount'],
    min: 0
  },
  withdrawalType: {
    type: String,
    enum: Object.values(WithdrawalType),
    required: [true, 'Please provide a withdrawal type']
  },
  status: {
    type: String,
    enum: Object.values(WithdrawalStatus),
    default: WithdrawalStatus.PENDING
  },
  bankDetails: BankDetailsSchema,
  cryptoDetails: CryptoDetailsSchema,
  processingTime: {
    type: String,
    default: function(this: IWithdrawal) {
      return this.withdrawalType === WithdrawalType.BANK_TRANSFER ? '24-48 hours' : '5-30 minutes';
    }
  },
  adminNote: {
    type: String,
    trim: true,
    maxlength: [500, 'Admin note cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// Index for user queries
WithdrawalSchema.index({ userId: 1, createdAt: -1 });

export default (mongoose.models && mongoose.models.Withdrawal) || mongoose.model<IWithdrawal>('Withdrawal', WithdrawalSchema);

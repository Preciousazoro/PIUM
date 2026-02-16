import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface SocialMedia {
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  username?: string;
  avatarUrl?: string | null;
  avatarPublicId?: string | null;
  taskPoints: number;
  welcomeBonusGranted: boolean;
  lastLoginBonusAt?: Date;
  tasksCompleted: number;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  socialLinks?: SocialMedia;
  dailyStreak: number;
  lastStreakDate?: Date;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password should be at least 6 characters long'],
    select: false
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    minlength: [3, 'Username should be at least 3 characters long'],
    maxlength: [20, 'Username cannot be more than 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  avatarUrl: {
    type: String,
    default: null
  },
  avatarPublicId: {
    type: String,
    default: null
  },
  taskPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  welcomeBonusGranted: {
    type: Boolean,
    default: false
  },
  lastLoginBonusAt: {
    type: Date,
    default: null
  },
  tasksCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  socialLinks: {
    twitter: {
      type: String,
      default: null,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/i.test(v);
        },
        message: 'Please provide a valid Twitter/X URL'
      }
    },
    instagram: {
      type: String,
      default: null,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?instagram\.com\/.+/i.test(v);
        },
        message: 'Please provide a valid Instagram URL'
      }
    },
    linkedin: {
      type: String,
      default: null,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/i.test(v);
        },
        message: 'Please provide a valid LinkedIn URL'
      }
    }
  },
  dailyStreak: {
    type: Number,
    default: 0,
    min: 0,
    max: 7
  },
  lastStreakDate: {
    type: Date,
    default: null
  },
  passwordResetToken: {
    type: String,
    default: null,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    default: null,
    select: false
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
UserSchema.index({ email: 1 }); // Unique email index
UserSchema.index({ username: 1 }); // Unique username index  
UserSchema.index({ role: 1 }); // Role-based queries
UserSchema.index({ status: 1 }); // Status-based queries
UserSchema.index({ createdAt: -1 }); // Sort by creation date
UserSchema.index({ role: 1, status: 1 }); // Compound index for admin queries

// Hash password before saving
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

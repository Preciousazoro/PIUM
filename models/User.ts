import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface SocialMedia {
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  username?: string;
  avatarUrl?: string;
  avatarPublicId?: string; // Cloudinary public ID for deletion
  taskPoints?: number;
  tasksCompleted?: number;
  socialLinks?: SocialMedia;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema({
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
  tasksCompleted: {
    type: Number,
    default: 0,
    min: 0
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
  }
}, {
  timestamps: true
});

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

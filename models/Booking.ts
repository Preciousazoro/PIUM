import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  companyName: string;
  email: string;
  phone?: string;
  message?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  metadata?: {
    userAgent?: string;
    ip?: string;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema: Schema<IBooking> = new Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true,
    maxlength: [20, 'Phone number cannot be more than 20 characters']
  },
  message: {
    type: String,
    trim: true,
    maxlength: [1000, 'Message cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'completed'],
    default: 'pending',
    required: true
  },
  metadata: {
    userAgent: String,
    ip: String
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
BookingSchema.index({ email: 1, createdAt: -1 });
BookingSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

import mongoose, { Document, Schema } from 'mongoose';

export enum ContactStatus {
  NEW = 'new',
  READ = 'read',
  RESPONDED = 'responded'
}

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  subscribedToUpdates: boolean;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema: Schema<IContactMessage> = new Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  subject: {
    type: String,
    required: [true, 'Please provide a subject'],
    trim: true,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Please provide a message'],
    trim: true,
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  subscribedToUpdates: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: Object.values(ContactStatus),
    default: ContactStatus.NEW,
    required: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
ContactMessageSchema.index({ status: 1, createdAt: -1 });
ContactMessageSchema.index({ email: 1, createdAt: -1 });
ContactMessageSchema.index({ createdAt: -1 });

export default mongoose.models.ContactMessage || mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

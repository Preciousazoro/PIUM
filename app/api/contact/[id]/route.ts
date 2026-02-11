import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-auth';
import ContactMessage, { ContactStatus } from '@/models/ContactMessage';
import mongoose from 'mongoose';

// PATCH - Update contact message status (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication - should be admin
    const session = await auth();
    const adminCheck = await isAdmin();
    
    if (!session?.user?.email || !adminCheck) {
      console.log('Admin auth failed:', { session: !!session, adminCheck });
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate message ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid message ID' },
        { status: 400 }
      );
    }

    // Validate status
    if (!status || !Object.values(ContactStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: new, read, responded' },
        { status: 400 }
      );
    }

    // Connect to database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find and update the contact message
    const message = await ContactMessage.findByIdAndUpdate(
      id,
      { 
        status,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!message) {
      return NextResponse.json(
        { error: 'Contact message not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contact message status updated successfully',
      data: {
        id: message._id,
        status: message.status,
        updatedAt: message.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating contact message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

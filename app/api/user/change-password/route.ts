import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

// Rate limiting store (in production, use Redis or similar)
const passwordChangeAttempts = new Map<string, { count: number; lastAttempt: number }>();

// Rate limiting: 5 attempts per hour per user
function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userAttempts = passwordChangeAttempts.get(userId);
  
  if (!userAttempts) {
    passwordChangeAttempts.set(userId, { count: 1, lastAttempt: now });
    return true;
  }
  
  // Reset if more than an hour has passed
  if (now - userAttempts.lastAttempt > 60 * 60 * 1000) {
    passwordChangeAttempts.set(userId, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (userAttempts.count >= 5) {
    return false;
  }
  
  userAttempts.count++;
  userAttempts.lastAttempt = now;
  return true;
}

// Password validation (only length and number required)
function validatePassword(password: string): { isValid: boolean; message?: string } {
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check rate limiting
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: 'Too many password change attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const { currentPassword, newPassword, confirmNewPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmNewPassword) {
      return NextResponse.json(
        { error: 'New password and confirmation do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.message },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user with password
    const user = await User.findById(session.user.id).select('+password');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    const isSamePassword = await user.comparePassword(newPassword);
    if (isSamePassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(session.user.id, {
      password: hashedPassword,
      updatedAt: new Date()
    });

    // Clear rate limit on successful password change
    passwordChangeAttempts.delete(session.user.id);

    return NextResponse.json(
      { success: true, message: 'Password updated successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

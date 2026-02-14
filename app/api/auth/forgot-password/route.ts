import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

// Generate a secure random token
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json(
        { 
          message: 'If an account with that email exists, password reset instructions have been sent.' 
        },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save reset token to user
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // Create reset URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://taskkash.xyz'
      : process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
    
    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetUrl, user.name);
    
    if (!emailSent) {
      console.error('Failed to send password reset email to:', email);
      // Still return success to prevent email enumeration
      // but log the error for debugging
    } else {
      console.log('Password reset email sent successfully to:', email);
    }

    return NextResponse.json(
      { 
        message: 'If an account with that email exists, password reset instructions have been sent.' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

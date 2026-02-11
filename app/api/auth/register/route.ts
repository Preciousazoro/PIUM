import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { createWelcomeBonus } from '@/lib/transactions';
import { AdminNotifications } from '@/lib/adminNotifications';
import { UserNotifications } from '@/lib/userNotifications';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password should be at least 6 characters long' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Create welcome bonus transaction
    try {
      await createWelcomeBonus(user._id.toString());
      
      // Create user notification for welcome bonus
      await UserNotifications.welcomeBonus(user._id.toString(), 100); // Assuming 100 TP welcome bonus
    } catch (error) {
      console.error('Error creating welcome bonus:', error);
      // Don't fail registration if bonus creation fails
    }

    // Create admin notification for new user registration
    try {
      await AdminNotifications.userSignedUp(user._id.toString(), name, email);
    } catch (error) {
      console.error('Failed to create user registration notification:', error);
      // Don't fail registration if notification fails
    }

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          taskPoints: user.taskPoints,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

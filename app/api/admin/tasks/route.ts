import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { validateTaskData } from '@/lib/validation';

// GET /api/admin/tasks - Fetch all tasks for admin panel
export const runtime = "nodejs";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      console.log('No session or email found:', session);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Check if user is admin - for development, allow any authenticated user
    // In production, uncomment the admin email check
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.log('User not found for email:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }

    // Temporary: Allow any authenticated user for development
    // In production, uncomment: if (user.email !== process.env.ADMIN_EMAIL) {
    console.log('Admin access granted to:', session.user.email);
    
    // Fetch all tasks sorted by creation date
    const tasks = await Task.find().sort({ createdAt: -1 });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching tasks:', error);
    
    // Handle generic Error objects
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks', details: error.message },
        { status: 500 }
      );
    }
    
    // Handle unknown error types
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// POST /api/admin/tasks - Create new task
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Check if user is admin - for development, allow any authenticated user
    // In production, uncomment the admin email check
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      console.log('User not found for email:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }

    // Temporary: Allow any authenticated user for development
    // In production, uncomment: if (user.email !== process.env.ADMIN_EMAIL) {
    console.log('Admin access granted to:', session.user.email);

    const body = await request.json();
    console.log('Received task creation request:', body);
    
    const { 
      title, 
      description, 
      category, 
      rewardPoints, 
      validationType, 
      instructions, 
      taskLink, 
      alternateUrl, 
      deadline, 
      status 
    } = body;

    // Validate all task data
    console.log('About to validate task data...');
    
    // Temporarily simplify validation to isolate the issue
    const validation = validateTaskData({
      title,
      description,
      category,
      rewardPoints,
      validationType,
      instructions,
      taskLink,
      alternateUrl: alternateUrl || '',
      deadline: deadline || '',
      status: status || 'active'
    });

    console.log('Validation result:', validation);

    if (!validation.isValid) {
      console.log('Validation errors:', validation.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Additional manual checks for debugging
    console.log('Manual validation checks:');
    console.log('Title:', title, 'Trimmed:', title?.trim());
    console.log('Description:', description, 'Trimmed:', description?.trim());
    console.log('Category:', category, 'Type:', typeof category);
    console.log('Status:', status, 'Type:', typeof status);
    console.log('TaskLink:', taskLink, 'Trimmed:', taskLink?.trim());
    console.log('AlternateUrl:', alternateUrl, 'Trimmed:', alternateUrl?.trim());
    
    if (!title || title.trim() === '') {
      console.log('Title validation failed');
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    if (!description || description.trim() === '') {
      console.log('Description validation failed');
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    if (!taskLink && !alternateUrl) {
      console.log('Link validation failed - no links provided');
      return NextResponse.json({ error: 'At least one link is required' }, { status: 400 });
    }

    // Validate enum values
    const validCategories = ['social', 'content', 'commerce'];
    const validStatuses = ['active', 'expired', 'disabled'];
    
    if (!validCategories.includes(category)) {
      console.log('Invalid category:', category);
      return NextResponse.json({ error: `Invalid category: ${category}. Must be one of: ${validCategories.join(', ')}` }, { status: 400 });
    }

    if (!validStatuses.includes(status)) {
      console.log('Invalid status:', status);
      return NextResponse.json({ error: `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    // Create new task
    console.log('Creating new task with data:', {
      title: title.trim(),
      description: description.trim(),
      category,
      rewardPoints,
      validationType: validationType.trim(),
      instructions: instructions.trim(),
      taskLink: taskLink.trim(),
      alternateUrl: alternateUrl?.trim() || '',
      deadline: deadline ? new Date(deadline) : null,
      status: status || 'active',
      createdBy: user._id
    });

    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      category,
      rewardPoints,
      validationType: validationType.trim(),
      instructions: instructions.trim(),
      taskLink: taskLink.trim(),
      alternateUrl: alternateUrl?.trim() || '',
      deadline: deadline ? new Date(deadline) : null,
      status: status || 'active',
      createdBy: user._id
    });

    console.log('Task object created:', task);

    await task.save();
    console.log('Task saved successfully:', task);

    return NextResponse.json(
      { 
        message: 'Task created successfully',
        task 
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error creating task:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack available');
    
    // Check for specific error types
    if (error && typeof error === 'object' && 'name' in error) {
      const errorObj = error as any;
      
      if (errorObj.name === 'ValidationError') {
        console.error('Mongoose validation error:', errorObj.errors);
        return NextResponse.json(
          { error: 'Validation error', details: Object.values(errorObj.errors || {}).map((e: any) => e.message) },
          { status: 400 }
        );
      }
      
      if (errorObj.name === 'MongoError' || errorObj.name === 'MongoServerError') {
        console.error('MongoDB error:', errorObj);
        return NextResponse.json(
          { error: 'Database error', details: errorObj.message || 'Unknown database error' },
          { status: 500 }
        );
      }
    }
    
    // Handle generic Error objects
    if (error instanceof Error) {
      console.error('Generic error:', error.message);
      return NextResponse.json(
        { error: 'Failed to create task', details: error.message },
        { status: 500 }
      );
    }
    
    // Handle unknown error types
    console.error('Unknown error type:', typeof error);
    return NextResponse.json(
      { error: 'Failed to create task', details: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

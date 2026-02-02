import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';
import { validateTaskData } from '@/lib/validation';

// PUT /api/admin/tasks/[id] - Update a task
export const runtime = "nodejs";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    const body = await request.json();
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

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    // Find and update the task
    const task = await Task.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        description: description.trim(),
        category,
        rewardPoints,
        validationType: validationType.trim(),
        instructions: instructions.trim(),
        taskLink: taskLink.trim(),
        alternateUrl: alternateUrl?.trim() || '',
        deadline: deadline ? new Date(deadline) : null,
        status: status || 'active'
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(
      { 
        message: 'Task updated successfully',
        task 
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error updating task:', error);
    
    // Handle specific error types
    if (error && typeof error === 'object' && 'name' in error) {
      const errorObj = error as any;
      
      if (errorObj.name === 'ValidationError') {
        console.error('Mongoose validation error:', errorObj.errors);
        return NextResponse.json(
          { error: 'Validation error', details: Object.values(errorObj.errors || {}).map((e: any) => e.message) },
          { status: 400 }
        );
      }
    }
    
    // Handle generic Error objects
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to update task', details: error.message },
        { status: 500 }
      );
    }
    
    // Handle unknown error types
    return NextResponse.json(
      { error: 'Failed to update task', details: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    // Find and delete the task
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error deleting task:', error);
    
    // Handle generic Error objects
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to delete task', details: error.message },
        { status: 500 }
      );
    }
    
    // Handle unknown error types
    return NextResponse.json(
      { error: 'Failed to delete task', details: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

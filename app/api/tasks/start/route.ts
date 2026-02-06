import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Activity from '@/models/Activity';
import Task from '@/models/Task';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId } = body;

    if (!taskId) {
      return NextResponse.json(
        { error: 'Missing required field: taskId' },
        { status: 400 }
      );
    }

    // Connect to database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find user by email to get ObjectId
    const User = mongoose.models.User;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find task to get details
    const task = await Task.findById(taskId);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Check if user already started this task
    const existingStart = await Activity.findOne({
      userId: user._id,
      taskId: task._id,
      type: 'task_started'
    });

    if (existingStart) {
      return NextResponse.json(
        { error: 'You have already started this task' },
        { status: 400 }
      );
    }

    // Create task started activity record
    const activity = await Activity.create({
      userId: user._id,
      taskId: task._id,
      type: 'task_started',
      status: 'completed',
      title: `Task Started: ${task.title}`,
      description: `Started working on: ${task.title}`,
      rewardPoints: 0,
      metadata: {
        taskTitle: task.title,
        taskCategory: task.category,
        startedAt: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Task started successfully',
      activityId: activity._id,
      taskTitle: task.title
    });

  } catch (error) {
    console.error('Error starting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

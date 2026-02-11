import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Activity from '@/models/Activity';
import Task from '@/models/Task';
import Submission from '@/models/Submission';
import mongoose from 'mongoose';
import { AdminNotifications } from '@/lib/adminNotifications';
import { UserNotifications } from '@/lib/userNotifications';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, proofUrls, proofLink, notes } = await request.json();

    // Log received data for debugging
    console.log('Received submission data:', { taskId, proofUrls, proofLink, notes });

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // proofUrls is optional, but if provided should be an array
    if (proofUrls && !Array.isArray(proofUrls)) {
      return NextResponse.json(
        { error: 'Proof URLs must be an array' },
        { status: 400 }
      );
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

    // Check for existing pending submission
    const existingPendingSubmission = await Submission.findOne({
      userId: user._id,
      taskId: task._id,
      status: 'pending'
    });

    if (existingPendingSubmission) {
      return NextResponse.json(
        { error: 'You already have a pending submission for this task' },
        { status: 409 }
      );
    }

    // Create submission record
    const submission = await Submission.create({
      userId: user._id,
      taskId: task._id,
      status: 'pending',
      proofUrls: proofUrls || [],
      proofLink: proofLink || '',
      notes: notes || '',
      submittedAt: new Date()
    }).catch(error => {
      console.error('Submission creation error:', error.message);
      console.error('Validation errors:', error.errors);
      throw error;
    });

    // Create task submission activity record
    await Activity.create({
      userId: user._id,
      taskId: task._id,
      type: 'task_submitted',
      status: 'pending',
      title: `Task Submitted: ${task.title}`,
      description: notes || `Submitted proof for task: ${task.title}`,
      rewardPoints: task.rewardPoints,
      metadata: {
        taskTitle: task.title,
        taskCategory: task.category,
        startedAt: new Date().toISOString()
      }
    });

    // Create admin notification for task submission
    try {
      await AdminNotifications.taskSubmitted(task._id.toString(), task.title, user.name);
    } catch (error) {
      console.error('Failed to create task submission notification:', error);
      // Don't fail the request if notification fails
    }

    // Create user notification for task submission
    try {
      console.log('🔔 Creating submission notification for user:', user._id.toString());
      await UserNotifications.submissionReceived(user._id.toString(), task.title);
      console.log('✅ Submission notification created successfully');
    } catch (error) {
      console.error('❌ Failed to create user task submission notification:', error);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({
      success: true,
      message: 'Task proof submitted successfully',
      submissionId: submission._id,
      taskTitle: task.title,
      rewardPoints: task.rewardPoints
    });
  } catch (error) {
    console.error('Error submitting task proof:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import Task from '@/models/Task';
import Submission from '@/models/Submission';
import mongoose from 'mongoose';

// GET /api/tasks/user-dashboard - Return tasks with user's latest submission and status
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Connect to database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Fetch all active tasks
    const tasks = await Task.find({ 
      status: 'active',
      $or: [
        { deadline: null },
        { deadline: { $gt: new Date() } }
      ]
    })
    .select('title description category rewardPoints validationType instructions taskLink alternateUrl deadline status createdAt updatedAt')
    .lean();

    // Fetch user's latest submissions for each task
    const submissions = await Submission.aggregate([
      {
        $match: {
          userId: userId
        }
      },
      {
        $sort: {
          submittedAt: -1
        }
      },
      {
        $group: {
          _id: '$taskId',
          latestSubmission: {
            $first: {
              id: '$_id',
              status: '$status',
              submittedAt: '$submittedAt',
              createdAt: '$createdAt'
            }
          }
        }
      }
    ]);

    // Create a map of taskId to latest submission
    const submissionMap = new Map();
    submissions.forEach(sub => {
      submissionMap.set(sub._id.toString(), sub.latestSubmission);
    });

    // Combine tasks with submission data and derive userTaskStatus
    const tasksWithStatus = tasks.map(task => {
      const taskId = task._id.toString();
      const latestSubmission = submissionMap.get(taskId);
      
      let userTaskStatus: 'pending' | 'approved' | 'rejected' | 'available';
      
      if (latestSubmission) {
        userTaskStatus = latestSubmission.status;
      } else {
        userTaskStatus = 'available';
      }

      return {
        ...task,
        latestSubmission: latestSubmission || null,
        userTaskStatus
      };
    });

    return NextResponse.json({ 
      tasks: tasksWithStatus 
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error fetching user dashboard tasks:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to fetch tasks', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

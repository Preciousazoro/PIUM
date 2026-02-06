import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/admin-auth';
import Activity from '@/models/Activity';
import User from '@/models/User';
import Task from '@/models/Task';
import Submission from '@/models/Submission';
import mongoose from 'mongoose';

// GET all submissions for admin
export async function GET(request: NextRequest) {
  try {
    // Check authentication - should be admin
    const session = await auth();
    const adminCheck = await isAdmin();
    
    if (!session?.user?.email || !adminCheck) {
      console.log('Admin auth failed:', { session: !!session, adminCheck });
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Connect to database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Build query for submissions
    const query: any = {};
    
    // Filter by status if specified
    if (status && status !== 'All') {
      query.status = status.toLowerCase();
    }

    // Get total count for pagination
    const total = await Submission.countDocuments(query);

    // Fetch submissions with populated user and task data
    const submissions = await Submission.find(query)
      .populate('userId', 'name email username avatarUrl')
      .populate('taskId', 'title description instructions rewardPoints category')
      .populate('progressId', 'status startedAt submittedAt reviewedAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // Format submissions for frontend
    const formattedSubmissions = submissions.map(submission => ({
      _id: submission._id,
      userSnapshot: {
        _id: (submission.userId as any)._id,
        name: (submission.userId as any).name || 'Unknown User',
        email: (submission.userId as any).email || 'unknown@example.com',
        username: (submission.userId as any).username,
        avatarUrl: (submission.userId as any).avatarUrl
      },
      taskSnapshot: {
        _id: submission.taskId,
        title: (submission.taskId as any)?.title || 'Unknown Task',
        description: (submission.taskId as any)?.description || '',
        instructions: (submission.taskId as any)?.instructions || '',
        rewardPoints: (submission.taskId as any)?.rewardPoints || 0,
        category: (submission.taskId as any)?.category || 'social'
      },
      status: submission.status,
      proofUrls: submission.proofUrls || [],
      proofLink: submission.proofLink || '',
      notes: submission.notes || '',
      submittedAt: submission.submittedAt,
      reviewedAt: submission.reviewedAt,
      rejectionReason: submission.rejectionReason,
      awardedPoints: submission.awardedPoints,
      progressId: submission.progressId
    }));

    return NextResponse.json({
      submissions: formattedSubmissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching admin submissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update submission status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    const adminCheck = await isAdmin();
    
    if (!session?.user?.email || !adminCheck) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 });
    }

    const body = await request.json();
    const { submissionId, status, rejectionReason } = body;

    if (!submissionId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: submissionId, status' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid status. Must be approved or rejected' },
        { status: 400 }
      );
    }

    // Connect to database
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find the submission
    const submission = await Submission.findById(submissionId)
      .populate('userId', 'name email taskPoints')
      .populate('taskId', 'rewardPoints title')
      .populate('progressId');

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'Submission has already been reviewed' },
        { status: 400 }
      );
    }

    // Update submission status
    submission.status = status.toLowerCase();
    submission.reviewedAt = new Date();
    submission.reviewedBy = new mongoose.Types.ObjectId(session.user.id);
    
    if (status.toLowerCase() === 'rejected' && rejectionReason) {
      submission.rejectionReason = rejectionReason;
    }

    await submission.save();

    // Update submission status
    await Submission.findByIdAndUpdate(submission._id, {
      status: status.toLowerCase() === 'approved' ? 'approved' : 'rejected',
      reviewedAt: new Date()
    });

    // If approved, award points to user
    let awardedPoints = 0;
    if (status.toLowerCase() === 'approved') {
      const rewardPoints = (submission.taskId as any)?.rewardPoints || 0;
      const user = submission.userId as any;
      
      if (rewardPoints > 0 && user) {
        // Update user's task points and tasks completed
        await User.findByIdAndUpdate(user._id, {
          $inc: { 
            taskPoints: rewardPoints,
            tasksCompleted: 1
          }
        });

        // Update submission with awarded points
        submission.awardedPoints = rewardPoints;
        await submission.save();

        // Create approved activity record
        await Activity.create({
          userId: user._id,
          taskId: submission.taskId,
          type: 'task_approved',
          status: 'completed',
          title: `Task Approved: ${(submission.taskId as any)?.title}`,
          description: `You earned ${rewardPoints} TP!`,
          rewardPoints,
          metadata: {
            taskTitle: (submission.taskId as any)?.title,
            taskCategory: (submission.taskId as any)?.category,
            submissionId: submission._id
          }
        });

        awardedPoints = rewardPoints;
      }
    } else if (status.toLowerCase() === 'rejected') {
      // Create rejected activity record
      await Activity.create({
        userId: submission.userId,
        taskId: submission.taskId,
        type: 'task_rejected',
        status: 'completed',
        title: `Task Rejected: ${(submission.taskId as any)?.title}`,
        description: rejectionReason || 'Your submission was not approved',
        rewardPoints: 0,
        metadata: {
          taskTitle: (submission.taskId as any)?.title,
          taskCategory: (submission.taskId as any)?.category,
          rejectionReason,
          submissionId: submission._id
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Submission ${status.toLowerCase()} successfully`,
      awardedPoints,
      newStatus: submission.status
    });

  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

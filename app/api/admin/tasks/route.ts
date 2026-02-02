import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';

// GET /api/admin/tasks - Fetch all tasks for admin panel
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to database
    await connectDB();

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all tasks sorted by creation date
    const tasks = await Task.find().sort({ createdAt: -1 });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
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

    // Check if user is admin
    const user = await User.findOne({ email: session.user.email });
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { title, category, reward, status, description, instructions, proofType, deadline } = body;

    // Validate required fields
    if (!title || !category || reward === undefined || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, reward, status' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['Active', 'Draft', 'Paused'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: Active, Draft, Paused' },
        { status: 400 }
      );
    }

    // Validate category
    if (!['Social', 'Community', 'Referral', 'Content', 'Commerce', 'Other'].includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Must be one of: Social, Community, Referral, Content, Commerce, Other' },
        { status: 400 }
      );
    }

    // Validate reward
    if (typeof reward !== 'number' || reward < 0) {
      return NextResponse.json(
        { error: 'Reward must be a non-negative number' },
        { status: 400 }
      );
    }

    // Create new task
    const task = new Task({
      title: title.trim(),
      category,
      reward,
      status,
      description: description?.trim() || '',
      instructions: instructions?.trim() || '',
      proofType: proofType || 'Screenshot',
      deadline: deadline ? new Date(deadline) : undefined,
      participants: 0
    });

    await task.save();

    return NextResponse.json(
      { 
        message: 'Task created successfully',
        task 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

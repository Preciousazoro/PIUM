import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';

// GET /api/tasks - Return only active tasks for users
export async function GET() {
  try {
    // Connect to database
    await connectDB();

    // Fetch only active tasks sorted by creation date
    const tasks = await Task.find({ 
      status: 'Active',
      // Optionally filter out tasks with expired deadlines
      $or: [
        { deadline: { $exists: false } },
        { deadline: { $gt: new Date() } }
      ]
    })
    .select('title category reward status participants description instructions proofType deadline createdAt')
    .sort({ createdAt: -1 });

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching active tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

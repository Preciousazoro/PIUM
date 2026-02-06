import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import User from '@/models/User';

export const runtime = "nodejs";

// PUT /api/admin/tasks/bulk - Bulk update tasks
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 403 });
    }

    const body = await request.json();
    const { taskIds, action } = body;

    if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
      return NextResponse.json({ error: 'Task IDs are required' }, { status: 400 });
    }

    if (!action || !['delete', 'approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let result;
    let count = 0;

    switch (action) {
      case 'delete':
        const deleteResult = await Task.deleteMany({ _id: { $in: taskIds } });
        count = deleteResult.deletedCount || 0;
        break;
      
      case 'approve':
        const approveResult = await Task.updateMany(
          { _id: { $in: taskIds } },
          { status: 'active' }
        );
        count = approveResult.modifiedCount || 0;
        break;
      
      case 'reject':
        const rejectResult = await Task.updateMany(
          { _id: { $in: taskIds } },
          { status: 'disabled' }
        );
        count = rejectResult.modifiedCount || 0;
        break;
    }

    return NextResponse.json({ 
      message: `Successfully ${action}ed ${count} tasks`,
      count
    }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error performing bulk action:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: 'Failed to perform bulk action', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to perform bulk action', details: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

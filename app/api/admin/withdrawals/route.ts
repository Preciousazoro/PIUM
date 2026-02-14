import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Withdrawal, { WithdrawalStatus } from '@/models/Withdrawal';
import User from '@/models/User';
import Transaction, { TransactionType } from '@/models/Transaction';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await User.findById(session.user.id);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    await connectDB();

    // Build query
    const query: any = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .lean();

    // Convert dates to strings for JSON serialization
    const formattedWithdrawals = withdrawals.map(w => ({
      ...w,
      _id: (w._id as any).toString(),
      createdAt: (w.createdAt as Date).toISOString(),
      updatedAt: (w.updatedAt as Date).toISOString(),
      userId: {
        _id: (w.userId as any)._id.toString(),
        name: (w.userId as any).name,
        email: (w.userId as any).email
      }
    }));

    const total = await Withdrawal.countDocuments(query);

    return NextResponse.json({
      withdrawals: formattedWithdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

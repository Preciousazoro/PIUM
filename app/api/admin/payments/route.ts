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
    const adminUser = await User.findById(session.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
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

    // Fetch withdrawals with user details
    const withdrawals = await Withdrawal.find(query)
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Withdrawal.countDocuments(query);

    return NextResponse.json({
      withdrawals,
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

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await User.findById(session.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    const body = await request.json();
    const { withdrawalId, status, adminNote } = body;

    if (!withdrawalId || !status) {
      return NextResponse.json(
        { error: 'Withdrawal ID and status are required' },
        { status: 400 }
      );
    }

    if (!Object.values(WithdrawalStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the withdrawal
    const withdrawal = await Withdrawal.findById(withdrawalId).populate('userId');
    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    // Check if withdrawal is already processed
    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      return NextResponse.json(
        { error: 'Withdrawal has already been processed' },
        { status: 400 }
      );
    }

    // Update withdrawal status
    withdrawal.status = status;
    if (adminNote) {
      withdrawal.adminNote = adminNote;
    }
    await withdrawal.save();

    // If rejected, refund points to user
    if (status === WithdrawalStatus.REJECTED) {
      await User.findByIdAndUpdate(withdrawal.userId._id, {
        $inc: { taskPoints: withdrawal.amount }
      });

      // Create transaction record for refund
      await Transaction.create({
        userId: withdrawal.userId._id,
        amount: withdrawal.amount,
        type: TransactionType.ADMIN_ADJUSTMENT,
        description: `Withdrawal refund: ${withdrawal.amount} TP (${withdrawal.withdrawalType})`
      });
    }

    // Create activity record
    const Activity = (await import('@/models/Activity')).default;
    await Activity.create({
      userId: withdrawal.userId._id,
      type: status === WithdrawalStatus.APPROVED ? 'withdrawal_approved' : 'withdrawal_rejected',
      description: `Withdrawal of ${withdrawal.amount} TP via ${withdrawal.withdrawalType} was ${status}`,
      metadata: {
        withdrawalId: withdrawal._id,
        amount: withdrawal.amount,
        withdrawalType: withdrawal.withdrawalType,
        status,
        adminNote
      }
    });

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawal._id,
        status: withdrawal.status,
        adminNote: withdrawal.adminNote,
        updatedAt: withdrawal.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to update withdrawal' },
      { status: 500 }
    );
  }
}

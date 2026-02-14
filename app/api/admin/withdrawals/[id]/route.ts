import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Withdrawal, { WithdrawalStatus } from '@/models/Withdrawal';
import User from '@/models/User';
import Transaction, { TransactionType } from '@/models/Transaction';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await User.findById(session.user.id);
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body;

    if (!Object.values(WithdrawalStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectDB();

    // Find the withdrawal
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found' }, { status: 404 });
    }

    // Check if withdrawal is already processed
    if (withdrawal.status !== WithdrawalStatus.PENDING) {
      return NextResponse.json({ error: 'Withdrawal already processed' }, { status: 400 });
    }

    // Update withdrawal status
    withdrawal.status = status;
    await withdrawal.save();

    // If rejected, refund the points
    if (status === WithdrawalStatus.REJECTED) {
      await User.findByIdAndUpdate(
        withdrawal.userId,
        { $inc: { taskPoints: withdrawal.amount } }
      );

      // Create refund transaction
      await Transaction.create({
        userId: withdrawal.userId,
        amount: withdrawal.amount,
        type: TransactionType.ADMIN_ADJUSTMENT,
        description: `Withdrawal Refund: ${withdrawal.amount} TP (Rejected withdrawal)`
      });
    }

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawal._id,
        status: withdrawal.status,
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

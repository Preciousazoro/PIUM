import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Transaction, { TransactionType } from '@/models/Transaction';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortOrder = searchParams.get('sort') || 'desc';

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ userId: session.user.id })
      .sort({ createdAt: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Transaction.countDocuments({ userId: session.user.id });

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, type, description } = await request.json();

    if (!amount || !type || !description) {
      return NextResponse.json(
        { error: 'Amount, type, and description are required' },
        { status: 400 }
      );
    }

    if (!Object.values(TransactionType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid transaction type' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for duplicate daily login bonus
    if (type === TransactionType.DAILY_LOGIN) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingDailyBonus = await Transaction.findOne({
        userId: session.user.id,
        type: TransactionType.DAILY_LOGIN,
        createdAt: {
          $gte: today,
          $lt: tomorrow
        }
      });

      if (existingDailyBonus) {
        return NextResponse.json(
          { error: 'Daily login bonus already claimed today' },
          { status: 400 }
        );
      }
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId: session.user.id,
      amount,
      type,
      description
    });

    // Update user's task points
    await User.findByIdAndUpdate(
      session.user.id,
      { $inc: { taskPoints: amount } }
    );

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

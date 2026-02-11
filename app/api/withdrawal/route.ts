import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Withdrawal, { WithdrawalType, CryptoNetwork } from '@/models/Withdrawal';
import User from '@/models/User';
import Transaction, { TransactionType } from '@/models/Transaction';

// TP to USD conversion rate
const TP_TO_USD_RATE = 0.0006;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      amount,
      withdrawalType,
      bankDetails,
      cryptoDetails
    } = body;

    // Validate required fields
    if (!amount || !withdrawalType) {
      return NextResponse.json(
        { error: 'Amount and withdrawal type are required' },
        { status: 400 }
      );
    }

    // Validate withdrawal type
    if (!Object.values(WithdrawalType).includes(withdrawalType)) {
      return NextResponse.json(
        { error: 'Invalid withdrawal type' },
        { status: 400 }
      );
    }

    // Validate minimum withdrawal amount
    if (amount < 500) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is 500 TP' },
        { status: 400 }
      );
    }

    // Validate method-specific fields
    if (withdrawalType === WithdrawalType.BANK_TRANSFER) {
      if (!bankDetails?.bankName || !bankDetails?.accountName || !bankDetails?.accountNumber) {
        return NextResponse.json(
          { error: 'Bank name, account name, and account number are required for bank transfer' },
          { status: 400 }
        );
      }
    } else if (withdrawalType === WithdrawalType.USDT_CRYPTO) {
      if (!cryptoDetails?.network || !cryptoDetails?.walletAddress) {
        return NextResponse.json(
          { error: 'Network and wallet address are required for USDT withdrawal' },
          { status: 400 }
        );
      }

      if (!Object.values(CryptoNetwork).includes(cryptoDetails.network)) {
        return NextResponse.json(
          { error: 'Invalid crypto network' },
          { status: 400 }
        );
      }

      // Basic wallet address validation
      if (cryptoDetails.walletAddress.length < 10) {
        return NextResponse.json(
          { error: 'Invalid wallet address' },
          { status: 400 }
        );
      }
    }

    await connectDB();

    // Check user's current balance
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.taskPoints < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Calculate converted amount
    const convertedAmount = amount * TP_TO_USD_RATE;

    // Create withdrawal record
    const withdrawal = await Withdrawal.create({
      userId: session.user.id,
      amount,
      convertedAmount,
      withdrawalType,
      bankDetails: withdrawalType === WithdrawalType.BANK_TRANSFER ? bankDetails : undefined,
      cryptoDetails: withdrawalType === WithdrawalType.USDT_CRYPTO ? cryptoDetails : undefined,
    });

    // Deduct points from user's balance
    await User.findByIdAndUpdate(
      session.user.id,
      { $inc: { taskPoints: -amount } }
    );

    // Create transaction record
    await Transaction.create({
      userId: session.user.id,
      amount: -amount,
      type: TransactionType.ADMIN_ADJUSTMENT,
      description: `Withdrawal: ${amount} TP via ${withdrawalType === WithdrawalType.BANK_TRANSFER ? 'Bank Transfer' : 'USDT'}`
    });

    return NextResponse.json({
      success: true,
      withdrawal: {
        id: withdrawal._id,
        amount: withdrawal.amount,
        convertedAmount: withdrawal.convertedAmount,
        withdrawalType: withdrawal.withdrawalType,
        status: withdrawal.status,
        processingTime: withdrawal.processingTime,
        createdAt: withdrawal.createdAt
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating withdrawal:', error);
    return NextResponse.json(
      { error: 'Failed to create withdrawal' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');

    const skip = (page - 1) * limit;

    await connectDB();

    // Build query
    const query: any = { userId: session.user.id };
    if (status) {
      query.status = status;
    }

    const withdrawals = await Withdrawal.find(query)
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

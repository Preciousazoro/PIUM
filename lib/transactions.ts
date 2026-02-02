import connectDB from '@/lib/mongodb';
import Transaction, { TransactionType } from '@/models/Transaction';
import User from '@/models/User';

export interface CreateTransactionParams {
  userId: string;
  amount: number;
  type: TransactionType;
  description: string;
}

export async function createTransaction({
  userId,
  amount,
  type,
  description
}: CreateTransactionParams) {
  await connectDB();

  try {
    // Create the transaction
    const transaction = await Transaction.create({
      userId,
      amount,
      type,
      description
    });

    // Update user's task points
    await User.findByIdAndUpdate(
      userId,
      { $inc: { taskPoints: amount } }
    );

    return transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

export async function createWelcomeBonus(userId: string) {
  return createTransaction({
    userId,
    amount: 50,
    type: TransactionType.WELCOME_BONUS,
    description: 'Welcome Bonus - Thanks for joining TaskKash!'
  });
}

export async function createDailyLoginBonus(userId: string) {
  await connectDB();

  // Check if daily bonus already claimed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingDailyBonus = await Transaction.findOne({
    userId,
    type: TransactionType.DAILY_LOGIN,
    createdAt: {
      $gte: today,
      $lt: tomorrow
    }
  });

  if (existingDailyBonus) {
    throw new Error('Daily login bonus already claimed today');
  }

  return createTransaction({
    userId,
    amount: 5,
    type: TransactionType.DAILY_LOGIN,
    description: 'Daily Login Bonus - Come back tomorrow for more!'
  });
}

export async function hasClaimedDailyBonusToday(userId: string): Promise<boolean> {
  await connectDB();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const existingDailyBonus = await Transaction.findOne({
    userId,
    type: TransactionType.DAILY_LOGIN,
    createdAt: {
      $gte: today,
      $lt: tomorrow
    }
  });

  return !!existingDailyBonus;
}

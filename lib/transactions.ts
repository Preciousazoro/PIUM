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
  await connectDB();
  
  // Check if welcome bonus already granted
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  if (user.welcomeBonusGranted) {
    console.log('Welcome bonus already granted to user:', userId);
    return null; // Already granted
  }
  
  // Create transaction and mark bonus as granted
  const transaction = await createTransaction({
    userId,
    amount: 50,
    type: TransactionType.WELCOME_BONUS,
    description: 'Welcome Bonus - Thanks for joining TaskKash!'
  });
  
  // Mark welcome bonus as granted
  await User.findByIdAndUpdate(userId, { 
    welcomeBonusGranted: true 
  });
  
  return transaction;
}

export async function createDailyLoginBonus(userId: string) {
  await connectDB();

  // Check if daily bonus already claimed today using user timestamp
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if user already claimed bonus today
  if (user.lastLoginBonusAt) {
    const lastBonusDate = new Date(user.lastLoginBonusAt);
    lastBonusDate.setHours(0, 0, 0, 0);
    
    if (lastBonusDate.getTime() === today.getTime()) {
      throw new Error('Daily login bonus already claimed today');
    }
  }

  // Create transaction and update timestamp
  const transaction = await createTransaction({
    userId,
    amount: 5,
    type: TransactionType.DAILY_LOGIN,
    description: 'Daily Login Bonus - Come back tomorrow for more!'
  });

  // Update the user's last login bonus timestamp
  await User.findByIdAndUpdate(userId, { 
    lastLoginBonusAt: new Date() 
  });

  return transaction;
}

export async function hasClaimedDailyBonusToday(userId: string): Promise<boolean> {
  await connectDB();

  const user = await User.findById(userId);
  if (!user) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if user already claimed bonus today
  if (user.lastLoginBonusAt) {
    const lastBonusDate = new Date(user.lastLoginBonusAt);
    lastBonusDate.setHours(0, 0, 0, 0);
    
    return lastBonusDate.getTime() === today.getTime();
  }

  return false;
}

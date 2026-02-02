import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createDailyLoginBonus, hasClaimedDailyBonusToday } from '@/lib/transactions';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already claimed today
    const hasClaimed = await hasClaimedDailyBonusToday(session.user.id);
    if (hasClaimed) {
      return NextResponse.json(
        { error: 'Daily login bonus already claimed today' },
        { status: 400 }
      );
    }

    // Create daily login bonus
    const transaction = await createDailyLoginBonus(session.user.id);

    return NextResponse.json({
      message: 'Daily login bonus claimed successfully!',
      transaction
    });
  } catch (error) {
    console.error('Error claiming daily bonus:', error);
    
    if (error instanceof Error && error.message === 'Daily login bonus already claimed today') {
      return NextResponse.json(
        { error: 'Daily login bonus already claimed today' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to claim daily bonus' },
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

    const hasClaimed = await hasClaimedDailyBonusToday(session.user.id);

    return NextResponse.json({ hasClaimedDailyBonus: hasClaimed });
  } catch (error) {
    console.error('Error checking daily bonus status:', error);
    return NextResponse.json(
      { error: 'Failed to check daily bonus status' },
      { status: 500 }
    );
  }
}

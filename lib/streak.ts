import { Types } from 'mongoose';
import User from '@/models/User';

/**
 * Normalize date to UTC midnight (start of day)
 * This prevents timezone issues and ensures consistent date comparison
 */
export function normalizeToUTCMidnight(date: Date): Date {
  const utcDate = new Date(date);
  utcDate.setUTCHours(0, 0, 0, 0);
  return utcDate;
}

/**
 * Get today's date normalized to UTC midnight
 */
export function getTodayUTC(): Date {
  return normalizeToUTCMidnight(new Date());
}

/**
 * Get yesterday's date normalized to UTC midnight
 */
export function getYesterdayUTC(): Date {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return normalizeToUTCMidnight(yesterday);
}

/**
 * Check if two dates are the same day (UTC comparison)
 */
export function isSameDayUTC(date1: Date, date2: Date): boolean {
  return normalizeToUTCMidnight(date1).getTime() === normalizeToUTCMidnight(date2).getTime();
}

/**
 * Check if a date is yesterday (UTC comparison)
 */
export function isYesterdayUTC(date: Date): boolean {
  return isSameDayUTC(date, getYesterdayUTC());
}

/**
 * Check if a date is today (UTC comparison)
 */
export function isTodayUTC(date: Date): boolean {
  return isSameDayUTC(date, getTodayUTC());
}

/**
 * Update user's daily streak based on login time
 * Implements the streak rules:
 * - Same day: no increment
 * - Yesterday: increment streak
 * - Older than yesterday: reset to 1
 * - Streak reaches 7: reset to 0
 */
export async function updateDailyStreak(userId: string | Types.ObjectId): Promise<number> {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const today = getTodayUTC();
    const lastStreakDate = user.lastStreakDate ? normalizeToUTCMidnight(user.lastStreakDate) : null;

    // Case 1: Already logged in today - do nothing
    if (lastStreakDate && isTodayUTC(lastStreakDate)) {
      return user.dailyStreak;
    }

    let newStreak: number;

    // Case 2: Logged in yesterday - increment streak
    if (lastStreakDate && isYesterdayUTC(lastStreakDate)) {
      newStreak = user.dailyStreak + 1;
    } 
    // Case 3: First time or missed days - start new streak
    else {
      newStreak = 1;
    }

    // Case 4: Streak reached maximum (7) - reset to 0
    if (newStreak >= 7) {
      newStreak = 0;
    }

    // Update user record
    await User.findByIdAndUpdate(userId, {
      dailyStreak: newStreak,
      lastStreakDate: today
    });

    return newStreak;
  } catch (error) {
    console.error('Error updating daily streak:', error);
    throw error;
  }
}

/**
 * Get user's current streak information
 */
export async function getUserStreakInfo(userId: string | Types.ObjectId) {
  try {
    const user = await User.findById(userId, 'dailyStreak lastStreakDate');
    if (!user) {
      throw new Error('User not found');
    }

    return {
      currentStreak: user.dailyStreak || 0,
      lastStreakDate: user.lastStreakDate,
      canLoginToday: !user.lastStreakDate || !isTodayUTC(user.lastStreakDate)
    };
  } catch (error) {
    console.error('Error getting user streak info:', error);
    throw error;
  }
}

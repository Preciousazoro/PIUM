import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Task from '@/models/Task';
import Transaction from '@/models/Transaction';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB();

    // Get all metrics in parallel for better performance
    const [
      totalUsers,
      tasksCompleted,
      pendingReviews,
      rewardsIssued
    ] = await Promise.all([
      // Total Users - Count all registered users
      User.countDocuments(),
      
      // Tasks Completed - Sum of tasksCompleted field across all users
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: '$tasksCompleted' }
          }
        }
      ]),
      
      // Pending Reviews - Count active tasks that need review
      Task.countDocuments({ status: 'active' }),
      
      // Rewards Issued - Sum of all positive transactions (task completions, bonuses)
      Transaction.aggregate([
        {
          $match: {
            type: { $in: ['task_completed', 'task_approved', 'welcome_bonus', 'daily_login'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ])
    ]);

    // Extract values from aggregation results
    const totalTasksCompleted = tasksCompleted[0]?.total || 0;
    const totalRewardsIssued = rewardsIssued[0]?.total || 0;

    const metrics = {
      totalUsers,
      tasksCompleted: totalTasksCompleted,
      pendingReviews,
      rewardsIssued: totalRewardsIssued,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: metrics
    });

  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch dashboard metrics' 
      },
      { status: 500 }
    );
  }
}

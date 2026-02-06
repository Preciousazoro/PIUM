'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Info,
  Loader2,
} from 'lucide-react';
import { Pagination } from '../ui/Pagination';

interface ActivityItem {
  _id: string;
  type: string;
  status: string;
  title: string;
  description?: string;
  rewardPoints?: number;
  taskDetails?: {
    title?: string;
    rewardPoints?: number;
    category?: string;
  };
  metadata?: {
    taskTitle?: string;
    taskCategory?: string;
    rejectionReason?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

interface ActivitiesResponse {
  activities: ActivityItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function RecentActivity() {
  const [page, setPage] = useState(1);
  const limit = 5;
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch activities from API
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/activities?page=${page}&limit=${limit}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Please login to view your activities');
          } else if (response.status === 404) {
            setError('No activities found');
          } else {
            setError('Failed to load activities');
          }
          return;
        }
        
        const data: ActivitiesResponse = await response.json();
        setActivities(data.activities);
        setPagination({
          total: data.pagination.total,
          totalPages: data.pagination.totalPages,
          hasNext: data.pagination.hasNext,
          hasPrev: data.pagination.hasPrev
        });
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [page, limit]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4 rounded-lg border bg-background p-6 text-foreground">
        <h2 className="text-lg font-medium">Your Recent Activity</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading activities...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4 rounded-lg border bg-background p-6 text-foreground">
        <h2 className="text-lg font-medium">Your Recent Activity</h2>
        <div className="text-center py-8 text-muted-foreground">
          {error}
        </div>
      </div>
    );
  }

  // Empty state
  if (activities.length === 0) {
    return (
      <div className="space-y-4 rounded-lg border bg-background p-6 text-foreground">
        <h2 className="text-lg font-medium">Your Recent Activity</h2>
        <div className="text-center py-8 text-muted-foreground">
          No recent activity found. Start completing tasks to see your activity here!
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-background p-6 text-foreground">
      <h2 className="text-lg font-medium">
        Your Recent Activity
      </h2>

      <div className="space-y-4">
        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Reward
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {activities.map((activity) => (
                <tr
                  key={activity._id}
                  className="transition-colors hover:bg-muted/60"
                >
                  <td className="px-6 py-4 text-sm font-medium">
                    {activity.taskDetails?.title || activity.title || activity.metadata?.taskTitle || 'Activity'}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(activity.status)}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          activity.status === 'approved' ||
                          activity.status === 'completed'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : activity.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}
                      >
                        {activity.status}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm">
                    {activity.taskDetails?.rewardPoints || activity.rewardPoints ? (
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {activity.taskDetails?.rewardPoints || activity.rewardPoints} pts
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {formatDistanceToNow(
                      new Date(activity.updatedAt || activity.createdAt),
                      { addSuffix: true }
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="sm:hidden space-y-3">
          {activities.map((activity) => (
            <div
              key={activity._id}
              className="bg-muted/30 rounded-lg p-4 border border-border/50 space-y-3"
            >
              {/* Task Title */}
              <div className="font-medium text-sm pr-2">
                {activity.taskDetails?.title || activity.title || activity.metadata?.taskTitle || 'Activity'}
              </div>

              {/* Status and Reward Row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusIcon(activity.status)}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      activity.status === 'approved' ||
                      activity.status === 'completed'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : activity.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    {activity.status}
                  </span>
                </div>
                
                {activity.taskDetails?.rewardPoints || activity.rewardPoints ? (
                  <span className="font-medium text-green-600 dark:text-green-400 text-sm flex-shrink-0">
                    {activity.taskDetails?.rewardPoints || activity.rewardPoints} pts
                  </span>
                ) : null}
              </div>

              {/* Date */}
              <div className="text-xs text-muted-foreground">
                {formatDistanceToNow(
                  new Date(activity.updatedAt || activity.createdAt),
                  { addSuffix: true }
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1}–
            {Math.min(page * limit, pagination.total)} of {pagination.total}
          </p>

          <Pagination
            currentPage={page}
            totalItems={pagination.total}
            itemsPerPage={limit}
            onPageChange={setPage}
            showItemsPerPage={false}
          />
        </div>
      )}
    </div>
  );
}

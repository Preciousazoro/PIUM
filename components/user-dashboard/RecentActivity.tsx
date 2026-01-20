'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Info,
} from 'lucide-react';
import { Pagination } from '../ui/Pagination';

interface ActivityItem {
  _id: string;
  status: string;
  updatedAt: string;
  taskDetails?: {
    title?: string;
    rewardPoints?: number;
  };
}

/* 🔹 Mock frontend data */
const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    _id: '1',
    status: 'approved',
    updatedAt: new Date().toISOString(),
    taskDetails: { title: 'Daily Login', rewardPoints: 10 },
  },
  {
    _id: '2',
    status: 'pending',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    taskDetails: { title: 'Profile Completion', rewardPoints: 20 },
  },
  {
    _id: '3',
    status: 'rejected',
    updatedAt: new Date(Date.now() - 172800000).toISOString(),
    taskDetails: { title: 'Referral Task' },
  },
];

export function RecentActivity() {
  const [page, setPage] = useState(1);
  const limit = 5;

  const total = MOCK_ACTIVITIES.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const activities = MOCK_ACTIVITIES.slice(
    (page - 1) * limit,
    page * limit
  );

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

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent activity found.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-background p-6 text-foreground">
      <h2 className="text-lg font-medium">
        Your Recent Activity
      </h2>

      <div className="overflow-x-auto">
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
                  {activity.taskDetails?.title || 'Task'}
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
                  {activity.taskDetails?.rewardPoints ? (
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {activity.taskDetails.rewardPoints} pts
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </td>

                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {formatDistanceToNow(
                    new Date(activity.updatedAt),
                    { addSuffix: true }
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1}–
            {Math.min(page * limit, total)} of {total}
          </p>

          <Pagination
            currentPage={page}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            showItemsPerPage={false}
          />
        </div>
      )}
    </div>
  );
}

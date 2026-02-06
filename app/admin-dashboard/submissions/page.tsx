"use client";

import { useEffect, useState } from "react";
import React from "react";
import feather from "feather-icons";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";
import { Pagination } from "@/components/ui/Pagination";
import { toast } from "sonner";

/* ---------------- TYPES ---------------- */

interface UserSnapshot {
  _id: string;
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string;
}

interface TaskSnapshot {
  _id: string;
  title: string;
  description: string;
  instructions: string;
  rewardPoints: number;
  category: string;
}

interface Submission {
  _id: string;
  userSnapshot: UserSnapshot;
  taskSnapshot: TaskSnapshot;
  status: 'pending' | 'approved' | 'rejected';
  proofUrls: string[];
  proofLink: string;
  notes: string;
  submittedAt: string;
  reviewedAt?: string;
  metadata?: any;
}

/* ---------------- COMPONENT ---------------- */

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "pending" | "approved" | "rejected"
  >("All");

  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    feather.replace();
    fetchSubmissions();
  }, [statusFilter, pagination.page, pagination.limit]);

  /* ---------------- DATA FETCHING ---------------- */

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });
      
      if (statusFilter !== "All") {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/submissions?${params}`);
      if (!response.ok) throw new Error('Failed to fetch submissions');
      
      const data = await response.json();
      setSubmissions(data.submissions);
      setPagination(prev => ({
        ...prev,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching submissions:', error);
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STATUS UPDATE ---------------- */

  const updateSubmissionStatus = async (submissionId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    try {
      setUpdating(submissionId);
      
      const response = await fetch('/api/admin/submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          submissionId,
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to update submission');
      
      const result = await response.json();
      
      // Update local state
      setSubmissions(prev => prev.map(s => 
        s._id === submissionId 
          ? { ...s, status, reviewedAt: new Date().toISOString() }
          : s
      ));

      // Show success message
      if (status === 'approved') {
        toast.success(`Submission approved! User earned ${result.awardedPoints} TP`);
      } else {
        toast.success('Submission rejected');
      }

      // Close expanded view
      setExpandedSubmission(null);
      
    } catch (error) {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    } finally {
      setUpdating(null);
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <h2 className="text-2xl font-bold mb-4">Submissions</h2>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {["All", "pending", "approved", "rejected"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st as any);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  disabled={loading}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    statusFilter === st
                      ? "bg-purple-600 text-white"
                      : "bg-muted hover:bg-muted/80"
                  } disabled:opacity-50`}
                >
                  {st.charAt(0).toUpperCase() + st.slice(1)}
                </button>
              )
            )}
          </div>

          {/* Table */}
          <div className="bg-card border rounded-xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <p className="mt-2 text-muted-foreground">Loading submissions...</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="block md:hidden">
                  {submissions.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground">
                      No submissions found
                    </div>
                  ) : (
                    <div className="divide-y">
                      {submissions.map((submission) => (
                        <div key={submission._id} className="p-4 space-y-3">
                          {/* User Info */}
                          <div className="flex items-center gap-3">
                            {submission.userSnapshot.avatarUrl && (
                              <img
                                src={submission.userSnapshot.avatarUrl}
                                alt={submission.userSnapshot.name}
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                              />
                            )}
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">{submission.userSnapshot.name}</div>
                              <div className="text-xs text-muted-foreground truncate">
                                {submission.userSnapshot.email}
                              </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                              submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                              submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                            </span>
                          </div>

                          {/* Task Info */}
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{submission.taskSnapshot.title}</div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{submission.taskSnapshot.category}</span>
                              <span>•</span>
                              <span className="text-purple-600 font-medium">+{submission.taskSnapshot.rewardPoints} TP</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(submission.submittedAt).toLocaleDateString()}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => setExpandedSubmission(
                                expandedSubmission === submission._id ? null : submission._id
                              )}
                              className="flex-1 text-blue-500 text-sm hover:text-blue-700 transition-colors py-2 px-3 border border-blue-200 rounded-lg hover:bg-blue-50"
                            >
                              {expandedSubmission === submission._id ? 'Hide' : 'View'}
                            </button>
                            {submission.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateSubmissionStatus(submission._id, 'approved')}
                                  disabled={updating === submission._id}
                                  className="flex-1 text-green-500 text-sm hover:text-green-700 transition-colors py-2 px-3 border border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50"
                                >
                                  {updating === submission._id ? '...' : 'Accept'}
                                </button>
                                <button
                                  onClick={() => updateSubmissionStatus(submission._id, 'rejected')}
                                  disabled={updating === submission._id}
                                  className="flex-1 text-red-500 text-sm hover:text-red-700 transition-colors py-2 px-3 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                                >
                                  {updating === submission._id ? '...' : 'Reject'}
                                </button>
                              </>
                            )}
                          </div>

                          {/* Expanded Preview Panel */}
                          {expandedSubmission === submission._id && (
                            <div className="mt-4 pt-4 border-t space-y-4">
                              {/* Task Details */}
                              <div>
                                <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">Task Details</h4>
                                <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
                                  <div><strong>Title:</strong> {submission.taskSnapshot.title}</div>
                                  <div><strong>Category:</strong> {submission.taskSnapshot.category}</div>
                                  <div><strong>Reward:</strong> +{submission.taskSnapshot.rewardPoints} TP</div>
                                  <div><strong>Instructions:</strong></div>
                                  <div className="text-muted-foreground bg-muted/50 rounded p-2 text-xs">
                                    {submission.taskSnapshot.instructions || 'No instructions provided'}
                                  </div>
                                </div>
                              </div>

                              {/* Proof Section */}
                              <div>
                                <h4 className="font-semibold text-sm uppercase tracking-wide mb-2">Submitted Proof</h4>
                                <div className="bg-muted/30 rounded-lg p-3 space-y-3">
                                  {submission.proofUrls?.length > 0 && (
                                    <div>
                                      <div className="text-sm font-medium mb-2">Screenshot/Image:</div>
                                      <div className="space-y-2">
                                        {submission.proofUrls.map((url, index) => (
                                          <div key={index} className="relative group">
                                            <img
                                              src={url}
                                              alt={`Proof ${index + 1}`}
                                              className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                              onClick={() => window.open(url, '_blank')}
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer"
                                                 onClick={() => window.open(url, '_blank')}>
                                              <span className="text-white text-xs">Open in new tab</span>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {submission.proofLink && (
                                    <div>
                                      <div className="text-sm font-medium mb-2">Proof Link:</div>
                                      <a
                                        href={submission.proofLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700 text-sm underline break-all"
                                      >
                                        {submission.proofLink}
                                      </a>
                                    </div>
                                  )}
                                  
                                  {submission.notes && (
                                    <div>
                                      <div className="text-sm font-medium mb-2">Additional Notes:</div>
                                      <div className="text-sm text-muted-foreground bg-muted/50 rounded p-2">
                                        {submission.notes}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {!submission.proofUrls?.length && !submission.proofLink && !submission.notes && (
                                    <div className="text-muted-foreground text-sm">
                                      No proof provided
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Action Buttons */}
                              {submission.status === 'pending' && (
                                <div className="flex gap-2 pt-2">
                                  <button
                                    onClick={() => updateSubmissionStatus(submission._id, 'approved')}
                                    disabled={updating === submission._id}
                                    className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                  >
                                    {updating === submission._id ? (
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                      </div>
                                    ) : (
                                      '✓ Accept'
                                    )}
                                  </button>
                                  <button
                                    onClick={() => updateSubmissionStatus(submission._id, 'rejected')}
                                    disabled={updating === submission._id}
                                    className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                  >
                                    {updating === submission._id ? (
                                      <div className="flex items-center justify-center gap-2">
                                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing...
                                      </div>
                                    ) : (
                                      '✗ Reject'
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-muted">
                      <tr>
                        {["User", "Task", "Reward", "Status", "Date", "Actions"].map(
                          (h) => (
                            <th key={h} className="px-6 py-3 text-left text-xs uppercase">
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-muted-foreground">
                            No submissions found
                          </td>
                        </tr>
                      ) : (
                        submissions.map((submission) => (
                          <React.Fragment key={submission._id}>
                            <tr className="border-t hover:bg-muted/30 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {submission.userSnapshot.avatarUrl && (
                                    <img
                                      src={submission.userSnapshot.avatarUrl}
                                      alt={submission.userSnapshot.name}
                                      className="w-8 h-8 rounded-full object-cover"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium">{submission.userSnapshot.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {submission.userSnapshot.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="font-medium">{submission.taskSnapshot.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {submission.taskSnapshot.category}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-medium text-purple-600">
                                  +{submission.taskSnapshot.rewardPoints} TP
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                                  submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-xs">
                                  {new Date(submission.submittedAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setExpandedSubmission(
                                      expandedSubmission === submission._id ? null : submission._id
                                    )}
                                    className="text-blue-500 text-sm hover:text-blue-700 transition-colors"
                                  >
                                    {expandedSubmission === submission._id ? 'Hide' : 'View'}
                                  </button>
                                  {submission.status === 'pending' && (
                                    <>
                                      <button
                                        onClick={() => updateSubmissionStatus(submission._id, 'approved')}
                                        disabled={updating === submission._id}
                                        className="text-green-500 text-sm hover:text-green-700 transition-colors disabled:opacity-50"
                                      >
                                        {updating === submission._id ? '...' : 'Accept'}
                                      </button>
                                      <button
                                        onClick={() => updateSubmissionStatus(submission._id, 'rejected')}
                                        disabled={updating === submission._id}
                                        className="text-red-500 text-sm hover:text-red-700 transition-colors disabled:opacity-50"
                                      >
                                        {updating === submission._id ? '...' : 'Reject'}
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            
                            {/* Expanded Preview Panel */}
                            {expandedSubmission === submission._id && (
                              <tr>
                                <td colSpan={6} className="bg-muted/20 border-t">
                                  <div className="p-6 space-y-6">
                                    {/* Task Details */}
                                    <div>
                                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-3">Task Details</h4>
                                      <div className="bg-card rounded-lg p-4 space-y-2">
                                        <div><strong>Title:</strong> {submission.taskSnapshot.title}</div>
                                        <div><strong>Category:</strong> {submission.taskSnapshot.category}</div>
                                        <div><strong>Reward:</strong> +{submission.taskSnapshot.rewardPoints} TP</div>
                                        <div><strong>Instructions:</strong></div>
                                        <div className="text-sm text-muted-foreground bg-muted/30 rounded p-3">
                                          {submission.taskSnapshot.instructions || 'No instructions provided'}
                                        </div>
                                      </div>
                                    </div>

                                    {/* Proof Section */}
                                    <div>
                                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-3">Submitted Proof</h4>
                                      <div className="bg-card rounded-lg p-4 space-y-3">
                                        {submission.proofUrls?.length > 0 && (
                                          <div>
                                            <div className="text-sm font-medium mb-2">Screenshot/Image:</div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                              {submission.proofUrls.map((url, index) => (
                                                <div key={index} className="relative group">
                                                  <img
                                                    src={url}
                                                    alt={`Proof ${index + 1}`}
                                                    className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                                    onClick={() => window.open(url, '_blank')}
                                                  />
                                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center cursor-pointer"
                                                       onClick={() => window.open(url, '_blank')}>
                                                    <span className="text-white text-sm">Open in new tab</span>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {submission.proofLink && (
                                          <div>
                                            <div className="text-sm font-medium mb-2">Proof Link:</div>
                                            <a
                                              href={submission.proofLink}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-500 hover:text-blue-700 text-sm underline break-all"
                                            >
                                              {submission.proofLink}
                                            </a>
                                          </div>
                                        )}
                                        
                                        {submission.notes && (
                                          <div>
                                            <div className="text-sm font-medium mb-2">Additional Notes:</div>
                                            <div className="text-sm text-muted-foreground bg-muted/30 rounded p-3">
                                              {submission.notes}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {!submission.proofUrls?.length && !submission.proofLink && !submission.notes && (
                                          <div className="text-muted-foreground text-sm">
                                            No proof provided
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Submission Metadata */}
                                    <div>
                                      <h4 className="font-semibold text-sm uppercase tracking-wide mb-3">Submission Info</h4>
                                      <div className="bg-card rounded-lg p-4 space-y-2 text-sm">
                                        <div><strong>Submitted by:</strong> {submission.userSnapshot.name} ({submission.userSnapshot.email})</div>
                                        <div><strong>Submitted on:</strong> {new Date(submission.submittedAt).toLocaleString()}</div>
                                        {submission.reviewedAt && (
                                          <div><strong>Reviewed on:</strong> {new Date(submission.reviewedAt).toLocaleString()}</div>
                                        )}
                                        <div><strong>Status:</strong> 
                                          <span className={`ml-2 inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                                            submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                                            submission.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                          }`}>
                                            {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    {submission.status === 'pending' && (
                                      <div className="flex gap-3 pt-4 border-t">
                                        <button
                                          onClick={() => updateSubmissionStatus(submission._id, 'approved')}
                                          disabled={updating === submission._id}
                                          className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {updating === submission._id ? (
                                            <div className="flex items-center justify-center gap-2">
                                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                              Processing...
                                            </div>
                                          ) : (
                                            '✓ Accept Submission'
                                          )}
                                        </button>
                                        <button
                                          onClick={() => updateSubmissionStatus(submission._id, 'rejected')}
                                          disabled={updating === submission._id}
                                          className="flex-1 bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                          {updating === submission._id ? (
                                            <div className="flex items-center justify-center gap-2">
                                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                              Processing...
                                            </div>
                                          ) : (
                                            '✗ Reject Submission'
                                          )}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 border-t">
                  <Pagination
                    currentPage={pagination.page}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={(page) =>
                      setPagination((p) => ({ ...p, page }))
                    }
                    onItemsPerPageChange={(limit) =>
                      setPagination(prev => ({ ...prev, page: 1, limit }))
                    }
                  />
                </div>
              </>
            )}
          </div>
        </main>
      </div>

    </div>
  );
}

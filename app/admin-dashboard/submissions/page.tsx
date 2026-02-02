"use client";

import { useEffect, useState } from "react";
import feather from "feather-icons";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";
import { Pagination } from "@/components/ui/Pagination";

/* ---------------- MOCK DATA ---------------- */

const MOCK_SUBMISSIONS = [
  {
    id: "1",
    userSnapshot: { name: "John Doe", email: "john@example.com" },
    taskSnapshot: { title: "Twitter Follow", rewardPoints: 50 },
    status: "Pending",
    createdAt: new Date().toISOString(),
    proofUrls: ["/placeholder.png"],
    notes: "Completed successfully",
  },
  {
    id: "2",
    userSnapshot: { name: "Jane Smith", email: "jane@example.com" },
    taskSnapshot: { title: "Discord Join", rewardPoints: 30 },
    status: "Approved",
    createdAt: new Date().toISOString(),
    proofUrls: [],
  },
];

/* ---------------- COMPONENT ---------------- */

export default function AdminSubmissionsPage() {
  const [subs, setSubs] = useState(MOCK_SUBMISSIONS);
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Pending" | "Reviewed" | "Approved" | "Rejected" | "Rewarded"
  >("All");

  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [previewImageIndex, setPreviewImageIndex] = useState(0);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    feather.replace();
  }, []);

  /* ---------------- CLIENT-SIDE FILTERING ---------------- */

  const filtered = subs.filter(
    (s) => statusFilter === "All" || s.status === statusFilter
  );

  const paginated = filtered.slice(
    (pagination.page - 1) * pagination.limit,
    pagination.page * pagination.limit
  );

  /* ---------------- STATUS UPDATE (WITH API CALL) ---------------- */

  const updateStatus = async (id: string, status: string) => {
    // Update local state first for immediate UI feedback
    setSubs((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status } : s
      )
    );

    // If approving, call the API to increment user's taskPoints
    if (status === "Approved") {
      const submission = subs.find(s => s.id === id);
      if (submission?.taskSnapshot?.rewardPoints && submission?.userSnapshot?.email) {
        try {
          // Find user by email and get their ID
          const userResponse = await fetch(`/api/user/by-email?email=${submission.userSnapshot.email}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            
            // Call the approval API to increment taskPoints
            const approveResponse = await fetch('/api/tasks/approve', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                taskId: submission.id,
                reward: submission.taskSnapshot.rewardPoints,
                userId: userData.id
              }),
            });

            if (approveResponse.ok) {
              const result = await approveResponse.json();
              console.log(`Task approved! User earned ${result.reward} TP. New balance: ${result.taskPoints} TP`);
            } else {
              console.error('Failed to approve task and award points');
              // Revert status on failure
              setSubs((prev) =>
                prev.map((s) =>
                  s.id === id ? { ...s, status: "Pending" } : s
                )
              );
            }
          }
        } catch (error) {
          console.error('Error approving task:', error);
          // Revert status on failure
          setSubs((prev) =>
            prev.map((s) =>
              s.id === id ? { ...s, status: "Pending" } : s
            )
          );
        }
      }
    }

    setSelectedSubmission(null);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="flex-1 p-6">
          <h2 className="text-2xl font-bold mb-4">Submissions</h2>

          {/* Filters */}
          <div className="flex gap-2 mb-4">
            {["All", "Pending", "Reviewed", "Approved", "Rejected", "Rewarded"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => {
                    setStatusFilter(st as any);
                    setPagination((p) => ({ ...p, page: 1 }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    statusFilter === st
                      ? "bg-purple-600 text-white"
                      : "bg-muted"
                  }`}
                >
                  {st}
                </button>
              )
            )}
          </div>

          {/* Table */}
          <div className="bg-card border rounded-xl overflow-hidden">
            <table className="w-full">
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
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No submissions
                    </td>
                  </tr>
                ) : (
                  paginated.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-6 py-4">
                        <div className="font-medium">{s.userSnapshot.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {s.userSnapshot.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">{s.taskSnapshot.title}</td>
                      <td className="px-6 py-4">
                        {s.taskSnapshot.rewardPoints} TP
                      </td>
                      <td className="px-6 py-4">{s.status}</td>
                      <td className="px-6 py-4">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedSubmission(s)}
                            className="text-blue-500 text-sm"
                          >
                            View
                          </button>
                          {s.status === "Pending" && (
                            <>
                              <button
                                onClick={() => updateStatus(s.id, "Approved")}
                                className="text-green-500 text-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(s.id, "Rejected")}
                                className="text-red-500 text-sm"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className="p-4 border-t">
              <Pagination
                currentPage={pagination.page}
                totalItems={filtered.length}
                itemsPerPage={pagination.limit}
                onPageChange={(page) =>
                  setPagination((p) => ({ ...p, page }))
                }
                onItemsPerPageChange={(limit) =>
                  setPagination({ page: 1, limit })
                }
              />
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-xl max-w-3xl w-full p-6">
            <h3 className="text-xl font-semibold mb-2">
              Submission Preview
            </h3>

            {selectedSubmission.proofUrls?.length ? (
              <img
                src={selectedSubmission.proofUrls[previewImageIndex]}
                className="max-h-[50vh] mx-auto rounded"
                alt="proof"
              />
            ) : (
              <div className="text-muted-foreground">
                No proof uploaded
              </div>
            )}

            <div className="mt-4 space-y-2">
              <div><strong>User:</strong> {selectedSubmission.userSnapshot.name}</div>
              <div><strong>Task:</strong> {selectedSubmission.taskSnapshot.title}</div>
              <div><strong>Status:</strong> {selectedSubmission.status}</div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => updateStatus(selectedSubmission.id, "Approved")}
                className="flex-1 bg-green-600 text-white py-2 rounded"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus(selectedSubmission.id, "Rejected")}
                className="flex-1 bg-red-600 text-white py-2 rounded"
              >
                Reject
              </button>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

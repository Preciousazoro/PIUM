"use client";

import { useEffect, useMemo, useState } from "react";
import feather from "feather-icons";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";

/* ---------------- COMPONENT ---------------- */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<any | null>(null);
  const [editingPoints, setEditingPoints] = useState<{ [k: string]: number }>({});

  /* -------- CLIENT-SIDE MOCK USERS -------- */
  useEffect(() => {
    const mockUsers = Array.from({ length: 42 }).map((_, i) => ({
      _id: `user-${i + 1}`,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: i % 10 === 0 ? "admin" : "user",
      status: i % 7 === 0 ? "suspended" : "active",
      points: Math.floor(Math.random() * 500),
      createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));
    setUsers(mockUsers);
  }, []);

  /* -------- PAGINATION (CLIENT SIDE) -------- */
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const totalPages = Math.ceil(users.length / pagination.limit);

  const paginatedUsers = useMemo(() => {
    const start = (pagination.page - 1) * pagination.limit;
    return users.slice(start, start + pagination.limit);
  }, [users, pagination]);

  /* -------- ICONS -------- */
  useEffect(() => {
    if (users.length > 0) {
      feather.replace({ width: 16, height: 16 });
    }
  }, [users, detailOpen]);

  /* -------- ACTIONS (UI ONLY) -------- */
  const showToast = (msg: string, type: "success" | "error" | "info" = "info") =>
    type === "success" ? toast.success(msg) : type === "error" ? toast.error(msg) : toast(msg);

  const onViewDetails = (u: any) => {
    setDetailUser(u);
    setDetailOpen(true);
  };

  const updatePoints = (id: string, value: number) => {
    setUsers(prev =>
      prev.map(u => (u._id === id ? { ...u, points: value } : u))
    );
    setEditingPoints(prev => {
      const p = { ...prev };
      delete p[id];
      return p;
    });
    showToast("Points updated", "success");
  };

  const toggleSuspend = (u: any) => {
    setUsers(prev =>
      prev.map(x =>
        x._id === u._id
          ? { ...x, status: x.status === "suspended" ? "active" : "suspended" }
          : x
      )
    );
    showToast("User status updated", "success");
  };

  const makeAdmin = (u: any) => {
    setUsers(prev =>
      prev.map(x => (x._id === u._id ? { ...x, role: "admin" } : x))
    );
    showToast("User is now an admin", "success");
  };

  const deleteUser = (u: any) => {
    setUsers(prev => prev.filter(x => x._id !== u._id));
    setDetailOpen(false);
    showToast("User deleted", "success");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6 overflow-y-auto">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-bold">Users</h2>
            <span className="text-muted-foreground text-sm">
              Total: {users.length}
            </span>
          </div>

          {/* TABLE */}
          <div className="bg-card border rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  {["User", "Role", "Status", "Points", "Created", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs uppercase text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paginatedUsers.map(u => (
                  <tr key={u._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="font-medium">{u.name}</div>
                      <div className="text-xs text-muted-foreground">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 capitalize">{u.role}</td>
                    <td className="px-6 py-4 capitalize">{u.status}</td>
                    <td className="px-6 py-4">
                      {editingPoints[u._id] !== undefined ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            value={editingPoints[u._id]}
                            onChange={e =>
                              setEditingPoints(p => ({
                                ...p,
                                [u._id]: Number(e.target.value),
                              }))
                            }
                            className="w-20 border rounded px-2 py-1"
                          />
                          <button
                            onClick={() => updatePoints(u._id, editingPoints[u._id])}
                            className="px-2 py-1 text-xs bg-primary text-white rounded"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {u.points}
                          <button
                            onClick={() =>
                              setEditingPoints(p => ({ ...p, [u._id]: u.points }))
                            }
                          >
                            <i data-feather="edit-2"></i>
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 flex gap-3 justify-end">
                      <button onClick={() => onViewDetails(u)}>
                        <i data-feather="eye"></i>
                      </button>
                      {u.role !== "admin" && (
                        <button onClick={() => makeAdmin(u)}>
                          <i data-feather="shield"></i>
                        </button>
                      )}
                      <button onClick={() => toggleSuspend(u)}>
                        <i data-feather="slash"></i>
                      </button>
                      <button onClick={() => deleteUser(u)}>
                        <i data-feather="trash-2"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="p-4 border-t">
              <Pagination
                currentPage={pagination.page}
                totalItems={users.length}
                itemsPerPage={pagination.limit}
                onPageChange={p => setPagination(s => ({ ...s, page: p }))}
                onItemsPerPageChange={l =>
                  setPagination({ page: 1, limit: l })
                }
              />
            </div>
          </div>

          {/* DETAILS MODAL */}
          {detailOpen && detailUser && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-card p-6 rounded-2xl max-w-lg w-full">
                <h3 className="text-xl font-bold mb-4">
                  {detailUser.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {detailUser.email}
                </p>
                <p>Role: {detailUser.role}</p>
                <p>Status: {detailUser.status}</p>
                <p>Points: {detailUser.points}</p>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setDetailOpen(false)}
                    className="px-4 py-2 border rounded"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => deleteUser(detailUser)}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

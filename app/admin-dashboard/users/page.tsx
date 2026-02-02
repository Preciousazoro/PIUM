"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import feather from "feather-icons";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";

interface User {
  _id: string;
  name: string;
  email: string;
  username?: string | null;
  avatarUrl?: string | null;
  role: string;
  status: string;
  points: number;
  tasksCompleted: number;
  createdAt: string;
  updatedAt: string;
  socialLinks?: any;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/* ---------------- COMPONENT ---------------- */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: 1,
    totalPages: 0,
    totalUsers: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<User | null>(null);
  const [editingPoints, setEditingPoints] = useState<{ [k: string]: number }>({});
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /* -------- FETCH USERS FROM DATABASE -------- */
  const fetchUsers = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  /* -------- INITIAL LOAD AND URL SYNC -------- */
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 10;
    
    fetchUsers(page, limit);
  }, [searchParams]);

  /* -------- PAGINATION HANDLERS -------- */
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleItemsPerPageChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1');
    params.set('limit', newLimit.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  /* -------- ICONS -------- */
  useEffect(() => {
    if (users.length > 0) {
      feather.replace({ width: 16, height: 16 });
    }
  }, [users, detailOpen]);

  /* -------- ACTIONS (UI ONLY) -------- */
  const showToast = (msg: string, type: "success" | "error" | "info" = "info") =>
    type === "success" ? toast.success(msg) : type === "error" ? toast.error(msg) : toast(msg);

  const onViewDetails = (u: User) => {
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

  const toggleSuspend = (u: User) => {
    setUsers(prev =>
      prev.map(x =>
        x._id === u._id
          ? { ...x, status: x.status === "suspended" ? "active" : "suspended" }
          : x
      )
    );
    showToast("User status updated", "success");
  };

  const makeAdmin = (u: User) => {
    setUsers(prev =>
      prev.map(x => (x._id === u._id ? { ...x, role: "admin" } : x))
    );
    showToast("User is now an admin", "success");
  };

  const deleteUser = (u: User) => {
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
              Total: {pagination.totalUsers}
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
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
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
                  ))
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="p-4 border-t">
              <Pagination
                currentPage={pagination.currentPage}
                totalItems={pagination.totalUsers}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
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

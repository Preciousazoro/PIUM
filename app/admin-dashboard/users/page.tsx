"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Eye, Edit, Ban, Trash2, Shield } from "lucide-react";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";
import { toast } from "sonner";
import { Pagination } from "@/components/ui/Pagination";
import { UserAvatar } from "../../../components/admin-dashboard/UserAvatar";
import { UserPreviewModal } from "../../../components/admin-dashboard/UserPreviewModal";
import { confirmToast } from "../../../components/admin-dashboard/confirmToast";

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
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'admins' | 'suspended'>('all');
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
  const [loadingActions, setLoadingActions] = useState<{ [k: string]: boolean }>({});
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /* -------- FILTER USERS -------- */
  const filteredUsers = useMemo(() => {
    switch (activeFilter) {
      case 'admins':
        return allUsers.filter(user => user.role === 'admin');
      case 'suspended':
        return allUsers.filter(user => user.status === 'suspended');
      default:
        return allUsers;
    }
  }, [allUsers, activeFilter]);

  /* -------- FILTER COUNTS -------- */
  const filterCounts = useMemo(() => {
    const admins = allUsers.filter(user => user.role === 'admin').length;
    const suspended = allUsers.filter(user => user.status === 'suspended').length;
    
    return {
      all: allUsers.length,
      admins,
      suspended
    };
  }, [allUsers]);

  /* -------- FETCH USERS FROM DATABASE -------- */
  const fetchUsers = async (page: number, limit: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setAllUsers(data.users);
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

  /* -------- FILTER HANDLERS -------- */
  const handleFilterChange = (filter: 'all' | 'admins' | 'suspended') => {
    setActiveFilter(filter);
  };


  /* -------- ACTIONS (UI ONLY) -------- */
  const showToast = (msg: string, type: "success" | "error" | "info" = "info") =>
    type === "success" ? toast.success(msg) : type === "error" ? toast.error(msg) : toast(msg);

  const onViewDetails = async (u: User) => {
    try {
      // Try to fetch full user details, fallback to existing data
      const response = await fetch(`/api/admin/users/${u._id}`);
      if (response.ok) {
        const fullUser = await response.json();
        setDetailUser(fullUser);
      } else {
        setDetailUser(u);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      setDetailUser(u);
    }
    setDetailOpen(true);
  };

  const updatePoints = (id: string, value: number) => {
    setAllUsers(prev =>
      prev.map(u => (u._id === id ? { ...u, points: value } : u))
    );
    setEditingPoints(prev => {
      const p = { ...prev };
      delete p[id];
      return p;
    });
    showToast("Points updated", "success");
  };

  const toggleSuspend = async (u: User) => {
    await confirmToast({
      title: `${u.status === 'suspended' ? 'Activate' : 'Suspend'} User`,
      message: `Are you sure you want to ${u.status === 'suspended' ? 'activate' : 'suspend'} ${u.name}?`,
      confirmText: u.status === 'suspended' ? 'Activate' : 'Suspend',
      confirmButtonVariant: u.status === 'suspended' ? 'default' : 'destructive',
      onConfirm: async () => {
        setLoadingActions(prev => ({ ...prev, [u._id]: true }));
        
        try {
          const response = await fetch(`/api/admin/users/${u._id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: u.status === 'suspended' ? 'active' : 'suspended' 
            })
          });

          if (!response.ok) {
            throw new Error('Failed to update user status');
          }

          // Refresh user list
          await fetchUsers(pagination.currentPage, pagination.limit);
        } finally {
          setLoadingActions(prev => {
            const p = { ...prev };
            delete p[u._id];
            return p;
          });
        }
      }
    });
  };

  const makeAdmin = async (u: User) => {
    await confirmToast({
      title: 'Make Admin',
      message: `Are you sure you want to make ${u.name} an admin?`,
      confirmText: 'Make Admin',
      confirmButtonVariant: 'default',
      onConfirm: async () => {
        setLoadingActions(prev => ({ ...prev, [u._id]: true }));
        
        try {
          const response = await fetch(`/api/admin/users/${u._id}/role`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: 'admin' })
          });

          if (!response.ok) {
            throw new Error('Failed to make admin');
          }

          // Refresh user list
          await fetchUsers(pagination.currentPage, pagination.limit);
        } finally {
          setLoadingActions(prev => {
            const p = { ...prev };
            delete p[u._id];
            return p;
          });
        }
      }
    });
  };

  const deleteUser = async (u: User) => {
    await confirmToast({
      title: 'Delete User',
      message: `Are you sure you want to delete ${u.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmButtonVariant: 'destructive',
      onConfirm: async () => {
        setLoadingActions(prev => ({ ...prev, [u._id]: true }));
        
        try {
          const response = await fetch(`/api/admin/users/${u._id}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error('Failed to delete user');
          }

          // Refresh user list
          setDetailOpen(false);
          await fetchUsers(pagination.currentPage, pagination.limit);
        } finally {
          setLoadingActions(prev => {
            const p = { ...prev };
            delete p[u._id];
            return p;
          });
        }
      }
    });
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Users</h2>
            <span className="text-muted-foreground text-sm">
              Total: {filterCounts.all} users
            </span>
          </div>

          {/* FILTER TABS */}
          <div className="mb-6">
            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeFilter === 'all'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                All Users ({filterCounts.all})
              </button>
              <button
                onClick={() => handleFilterChange('admins')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeFilter === 'admins'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                Admins ({filterCounts.admins})
              </button>
              <button
                onClick={() => handleFilterChange('suspended')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeFilter === 'suspended'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                Suspended ({filterCounts.suspended})
              </button>
            </div>
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
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      {activeFilter === 'admins' && 'No admin users found'}
                      {activeFilter === 'suspended' && 'No suspended users found'}
                      {activeFilter === 'all' && 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u._id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={u} size="sm" />
                          <div>
                            <div className="font-medium">{u.name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
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
                              className="w-20 border rounded px-2 py-1 bg-background"
                            />
                            <button
                              onClick={() => updatePoints(u._id, editingPoints[u._id])}
                              className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
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
                              className="p-1 hover:bg-muted rounded"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 justify-end">
                          {/* View */}
                          <button
                            onClick={() => onViewDetails(u)}
                            className="p-2 text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          
                          {/* Make Admin (only for non-admins) */}
                          {u.role !== "admin" && (
                            <button
                              onClick={() => makeAdmin(u)}
                              disabled={loadingActions[u._id]}
                              className="p-2 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950 rounded-lg transition-colors disabled:opacity-50"
                              title="Make Admin"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}

                          {/* Suspend/Unsuspend */}
                          <button
                            onClick={() => toggleSuspend(u)}
                            disabled={loadingActions[u._id]}
                            className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              u.status === 'suspended'
                                ? 'text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950'
                                : 'text-orange-500 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950'
                            }`}
                            title={u.status === 'suspended' ? 'Activate User' : 'Suspend User'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteUser(u)}
                            disabled={loadingActions[u._id]}
                            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

          {/* USER PREVIEW MODAL */}
          <UserPreviewModal
            user={detailUser}
            isOpen={detailOpen}
            onClose={() => setDetailOpen(false)}
            onUserUpdate={() => fetchUsers(pagination.currentPage, pagination.limit)}
          />
        </main>
      </div>
    </div>
  );
}

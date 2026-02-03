import React, { useState } from 'react';
import { X, Edit2, Shield, Ban, Trash2, Check, X as XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from './UserAvatar';
import { confirmToast } from './confirmToast';
import { toast } from 'sonner';

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
  socialLinks?: Record<string, string | null>;
}

interface UserPreviewModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void; // Callback to refresh user list
}

export function UserPreviewModal({ user, isOpen, onClose, onUserUpdate }: UserPreviewModalProps) {
  const [isEditingPoints, setIsEditingPoints] = useState(false);
  const [editedPoints, setEditedPoints] = useState<number>(0);
  const [isUpdatingPoints, setIsUpdatingPoints] = useState(false);

  if (!isOpen || !user) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEditPoints = () => {
    setEditedPoints(user.points);
    setIsEditingPoints(true);
  };

  const handleSavePoints = async () => {
    if (editedPoints < 0) {
      toast.error('Points cannot be negative');
      return;
    }

    setIsUpdatingPoints(true);
    try {
      const response = await fetch(`/api/admin/users/${user._id}/points`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: editedPoints })
      });

      if (!response.ok) {
        throw new Error('Failed to update points');
      }

      toast.success('Points updated successfully');
      setIsEditingPoints(false);
      
      // Update local user data
      user.points = editedPoints;
      
      // Refresh user list if callback provided
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error) {
      console.error('Error updating points:', error);
      toast.error('Failed to update points');
    } finally {
      setIsUpdatingPoints(false);
    }
  };

  const handleCancelEditPoints = () => {
    setIsEditingPoints(false);
    setEditedPoints(user.points);
  };

  const handleMakeAdmin = async () => {
    await confirmToast({
      title: 'Make Admin',
      message: `Are you sure you want to make ${user.name} an admin?`,
      confirmText: 'Make Admin',
      confirmButtonVariant: 'default',
      onConfirm: async () => {
        const response = await fetch(`/api/admin/users/${user._id}/role`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role: 'admin' })
        });

        if (!response.ok) {
          throw new Error('Failed to make admin');
        }

        user.role = 'admin';
        if (onUserUpdate) onUserUpdate();
      }
    });
  };

  const handleToggleSuspend = async () => {
    const isSuspending = user.status === 'active';
    await confirmToast({
      title: isSuspending ? 'Suspend User' : 'Activate User',
      message: `Are you sure you want to ${isSuspending ? 'suspend' : 'activate'} ${user.name}?`,
      confirmText: isSuspending ? 'Suspend' : 'Activate',
      confirmButtonVariant: isSuspending ? 'destructive' : 'default',
      onConfirm: async () => {
        const response = await fetch(`/api/admin/users/${user._id}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            status: isSuspending ? 'suspended' : 'active' 
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to ${isSuspending ? 'suspend' : 'activate'} user`);
        }

        user.status = isSuspending ? 'suspended' : 'active';
        if (onUserUpdate) onUserUpdate();
      }
    });
  };

  const handleDeleteUser = async () => {
    await confirmToast({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      confirmText: 'Delete',
      confirmButtonVariant: 'destructive',
      onConfirm: async () => {
        const response = await fetch(`/api/admin/users/${user._id}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error('Failed to delete user');
        }

        toast.success('User deleted successfully');
        onClose();
        if (onUserUpdate) onUserUpdate();
      }
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    return role === 'admin' ? 'default' : 'secondary';
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'default' : 'destructive';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-background border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">User Details</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* User Profile Section */}
            <div className="flex items-center gap-4">
              <UserAvatar user={user} size="lg" />
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                {user.username && (
                  <p className="text-sm text-muted-foreground">@{user.username}</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Account Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Account</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="mt-1">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(user.status)} className="capitalize">
                      {user.status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="mt-1">{new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="mt-1">{new Date(user.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Performance Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Performance</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Points</label>
                  <div className="mt-1 flex items-center gap-2">
                    {isEditingPoints ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="number"
                          value={editedPoints}
                          onChange={(e) => setEditedPoints(Number(e.target.value))}
                          className="w-24"
                          min="0"
                        />
                        <Button
                          size="sm"
                          onClick={handleSavePoints}
                          disabled={isUpdatingPoints}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEditPoints}
                          disabled={isUpdatingPoints}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold">{user.points.toLocaleString()}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleEditPoints}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tasks Completed</label>
                  <p className="mt-1 text-lg font-semibold">{user.tasksCompleted}</p>
                </div>
              </div>
            </div>

            {user.socialLinks && Object.keys(user.socialLinks).length > 0 && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Social Links</h4>
                  <div className="space-y-2">
                    {Object.entries(user.socialLinks || {}).map(([platform, url]) => (
                      url && (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:underline block"
                        >
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Admin Actions Footer */}
        <div className="border-t bg-muted/30 p-6">
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Admin Actions</h4>
            <div className="flex flex-wrap gap-2">
              {user.role !== 'admin' && (
                <Button
                  onClick={handleMakeAdmin}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Make Admin
                </Button>
              )}
              
              <Button
                onClick={handleToggleSuspend}
                variant={user.status === 'suspended' ? 'default' : 'secondary'}
                size="sm"
                className="flex items-center gap-2"
              >
                <Ban className="h-4 w-4" />
                {user.status === 'suspended' ? 'Activate' : 'Suspend'}
              </Button>
              
              <Button
                onClick={handleDeleteUser}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete User
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

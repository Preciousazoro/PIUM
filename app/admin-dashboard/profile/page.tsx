"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Save,
  User,
  X,
  Upload,
  Loader2,
  Mail,
  Calendar,
  Shield,
} from "lucide-react";
import { toast } from "sonner";
import AdminHeader from "../../../components/admin-dashboard/AdminHeader";
import AdminSidebar from "../../../components/admin-dashboard/AdminSidebar";

type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  createdAt: string;
};

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [admin, setAdmin] = useState<AdminProfile>({
    id: "",
    name: "",
    email: "",
    role: "",
    avatarUrl: null,
    createdAt: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    avatarUrl: "",
  });

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('/api/admin/me');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.admin) {
            setAdmin(data.admin);
            setEditForm({
              name: data.admin.name,
              avatarUrl: data.admin.avatarUrl || "",
            });
          }
        } else {
          toast.error("Failed to load admin profile");
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error("Error loading profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Handle image upload (simplified version - you can integrate with Cloudinary later)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, just create a preview URL
    // In production, you'd upload to Cloudinary here
    setIsUploading(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({
          ...prev,
          avatarUrl: reader.result as string
        }));
        setIsUploading(false);
        toast.success("Image uploaded successfully");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      toast.error("Failed to upload image");
    }
  };

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/admin/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editForm.name,
          avatarUrl: editForm.avatarUrl || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAdmin(data.admin);
          setIsEditing(false);
          toast.success("Profile updated successfully");
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error("Error updating profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setEditForm({
      name: admin.name,
      avatarUrl: admin.avatarUrl || "",
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-8"></div>
            <div className="bg-card rounded-xl border p-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-24 h-24 bg-muted rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-muted rounded w-32"></div>
                  <div className="h-4 bg-muted rounded w-48"></div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold">Admin Profile</h1>
              <p className="text-muted-foreground">Manage your administrator profile information</p>
            </div>

            {/* Profile Card */}
            <div className="bg-card rounded-xl border shadow-sm">
              <div className="p-8">
            {/* Profile Header with Avatar */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center space-x-6">
                {/* Avatar */}
                <div className="relative">
                  {(isEditing ? editForm.avatarUrl : admin.avatarUrl) ? (
                    <img
                      src={isEditing ? editForm.avatarUrl : admin.avatarUrl || undefined}
                      alt={isEditing ? editForm.name : admin.name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-border"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-medium">
                      {getInitials(isEditing ? editForm.name : admin.name)}
                    </div>
                  )}
                  
                  {/* Upload button for editing */}
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>

                {/* Basic Info */}
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="text-2xl font-bold bg-transparent border-b-2 border-border focus:border-primary outline-none px-1"
                      placeholder="Your name"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold">{admin.name}</h2>
                  )}
                  
                  <div className="flex items-center space-x-2 text-muted-foreground mt-1">
                    <Shield className="w-4 h-4" />
                    <span className="capitalize">{admin.role}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="flex items-center space-x-2 px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </div>
                <p className="font-medium">{admin.email}</p>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4" />
                  <span>Role</span>
                </div>
                <p className="font-medium capitalize">{admin.role}</p>
              </div>

              {/* Joined Date */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Member Since</span>
                </div>
                <p className="font-medium">{formatDate(admin.createdAt)}</p>
              </div>

              {/* Account Status */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Account Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <p className="font-medium">Active</p>
                </div>
              </div>
            </div>

            {/* Admin Permissions Info */}
            <div className="mt-8 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium mb-2">Administrator Permissions</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Manage all user accounts and profiles</li>
                <li>• Create and manage tasks and rewards</li>
                <li>• View system analytics and reports</li>
                <li>• Moderate submissions and content</li>
                <li>• Configure system settings</li>
              </ul>
            </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

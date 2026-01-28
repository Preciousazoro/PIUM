"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Pencil,
  Save,
  User,
  X,
  Upload,
  Twitter,
  Instagram,
  Linkedin,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

// Import your navigation components
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";
import { ProfileSkeleton } from "@/components/ui/LoadingSkeleton";

type SocialMedia = {
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
};

type UserProfile = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  image?: string | null;
  avatarPublicId?: string | null;
  points?: number;
  socialMedia?: SocialMedia;
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [user, setUser] = useState<UserProfile>({
    id: "",
    name: "",
    username: "",
    email: "",
    role: "user",
    image: null,
    avatarPublicId: null,
    points: 0,
    socialMedia: {
      twitter: null,
      instagram: null,
      linkedin: null,
    },
  });

  const [editableUser, setEditableUser] = useState<UserProfile>(user);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [usernameWarning, setUsernameWarning] = useState<string | null>(null);

  // Generate username helper function
  const generateUsername = (name: string): string => {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const randomNum = Math.floor(Math.random() * 9999);
    return `${cleanName}_${randomNum}`;
  };

  // Fetch user profile from API
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        
        const data = await response.json();
        
        const userProfile: UserProfile = {
          id: data.id,
          name: data.name,
          username: data.username,
          email: data.email,
          role: "user",
          image: data.avatarUrl,
          avatarPublicId: data.avatarPublicId,
          points: data.taskPoints,
          socialMedia: data.socialLinks || {
            twitter: null,
            instagram: null,
            linkedin: null,
          },
        };
        
        setUser(userProfile);
        setEditableUser(userProfile);
        setAvatarPreview(data.avatarUrl || null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const file = e.target.files[0];
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Upload to server
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      setAvatarPreview(data.url);
      setEditableUser({ ...editableUser, image: data.url, avatarPublicId: data.publicId });
      
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      // Revert to original image on error
      setAvatarPreview(user.image || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      // Client-side validation - username is optional
      if (editableUser.username && editableUser.username.trim().length > 0) {
        if (editableUser.username.length < 3) {
          throw new Error('Username should be at least 3 characters long');
        }
        
        if (editableUser.username.length > 20) {
          throw new Error('Username cannot be more than 20 characters');
        }
        
        if (!/^[a-zA-Z0-9_]+$/.test(editableUser.username)) {
          throw new Error('Username can only contain letters, numbers, and underscores');
        }
        setUsernameWarning(null);
      } else {
        // Username is empty - show warning but allow saving
        setUsernameWarning('Please set a username (required for public profile)');
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editableUser.name,
          username: editableUser.username,
          avatarUrl: avatarPreview,
          avatarPublicId: editableUser.avatarPublicId,
          socialLinks: editableUser.socialMedia,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.details ? errorData.details.join(', ') : (errorData.error || 'Failed to update profile');
        throw new Error(errorMessage);
      }
      
      const updatedData = await response.json();
      
      const updatedProfile: UserProfile = {
        id: updatedData.id,
        name: updatedData.name,
        username: updatedData.username,
        email: updatedData.email,
        role: "user",
        image: updatedData.avatarUrl,
        avatarPublicId: updatedData.avatarPublicId,
        points: updatedData.taskPoints,
        socialMedia: updatedData.socialLinks || {
            twitter: null,
            instagram: null,
            linkedin: null,
          },
      };
      
      setUser(updatedProfile);
      setEditableUser(updatedProfile);
      setIsEditing(false);
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditableUser(user);
    setAvatarPreview(user.image || null);
    setIsEditing(false);
  };

  const handleSocialLinkChange = (platform: keyof SocialMedia, value: string) => {
    setEditableUser({
      ...editableUser,
      socialMedia: {
        ...editableUser.socialMedia,
        [platform]: value || null,
      },
    });
  };

  const handleSocialLinkClick = (url: string | null) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. SIDEBAR */}
      <UserSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. HEADER */}
        <UserHeader />

        {/* 3. SCROLLABLE CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-[300px_1fr] gap-8">
              
              {/* PROFILE CARD (LEFT) */}
              <aside className="space-y-6">
                <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-sm">
                  <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-background shadow-lg">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="avatar"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-blue-600">
                        <User className="text-white w-14 h-14" />
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <label className="inline-flex -mt-4 relative z-10 cursor-pointer bg-primary p-2 rounded-full shadow-md hover:scale-110 transition-transform">
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 text-white" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  )}

                  <h3 className="mt-4 text-xl font-bold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize font-medium">
                    {user.role}
                  </p>

                  <div className="mt-8 p-4 bg-muted/50 rounded-2xl border border-border">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Task Points
                    </p>
                    <p className="font-black text-2xl text-primary">{user.points} TP</p>
                  </div>

                  <div className="flex justify-center gap-4 mt-8">
                    {[
                      { icon: Twitter, platform: 'twitter' as keyof SocialMedia },
                      { icon: Instagram, platform: 'instagram' as keyof SocialMedia },
                      { icon: Linkedin, platform: 'linkedin' as keyof SocialMedia },
                    ].map(({ icon: Icon, platform }) => {
                      const url = user.socialMedia?.[platform] || null;
                      return (
                        <button
                          key={platform}
                          onClick={() => handleSocialLinkClick(url)}
                          className={`p-2 rounded-lg transition-colors ${
                            url
                              ? 'bg-primary/20 hover:bg-primary/30 text-primary'
                              : 'bg-muted hover:text-primary'
                          }`}
                          title={url ? `Open ${platform}` : `No ${platform} link`}
                        >
                          <Icon className="w-5 h-5" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </aside>

              {/* PROFILE FORM (RIGHT) */}
              <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Profile Settings</h1>
                    <p className="text-sm text-muted-foreground">
                      Manage your public profile and account details
                    </p>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
                    >
                      <Pencil className="w-4 h-4" /> Edit Profile
                    </button>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancel}
                        className="px-5 py-2.5 border border-border rounded-xl font-bold flex items-center gap-2 hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4" /> Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        value={editableUser.name}
                        onChange={(e) =>
                          setEditableUser({ ...editableUser, name: e.target.value })
                        }
                        className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all"
                      />
                    ) : (
                      <p className="p-3 bg-muted/20 rounded-xl border border-transparent font-medium">{user.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                      Username
                    </label>
                    {isEditing ? (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            value={editableUser.username}
                            onChange={(e) =>
                              setEditableUser({ ...editableUser, username: e.target.value })
                            }
                            placeholder="Enter username (optional)"
                            className="flex-1 p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all"
                          />
                          {!editableUser.username && (
                            <button
                              type="button"
                              onClick={() => setEditableUser({ ...editableUser, username: generateUsername(editableUser.name) })}
                              className="px-3 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm"
                            >
                              Generate
                            </button>
                          )}
                        </div>
                        {usernameWarning && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <span>⚠️</span>
                            {usernameWarning}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="p-3 bg-muted/20 rounded-xl border border-transparent font-medium">
                          @{user.username || 'Not set'}
                        </p>
                        {!user.username && (
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            ⚠️ Username not set - required for public profile
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                      Email Address
                    </label>
                    <p className="p-3 bg-muted/10 rounded-xl border border-dashed border-border text-muted-foreground">{user.email}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                      User ID
                    </label>
                    <p className="p-3 bg-muted/10 rounded-xl border border-dashed border-border font-mono text-xs text-muted-foreground">
                      {user.id}
                    </p>
                  </div>

                  {/* Social Media Links Section */}
                  <div className="md:col-span-2 space-y-6 pt-6 border-t border-border">
                    <h3 className="text-lg font-semibold">Social Media Links</h3>
                    
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-2">
                          <Twitter className="w-4 h-4" /> Twitter
                        </label>
                        {isEditing ? (
                          <input
                            value={editableUser.socialMedia?.twitter || ''}
                            onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                            placeholder="https://twitter.com/username"
                            className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all"
                          />
                        ) : (
                          <p className="p-3 bg-muted/20 rounded-xl border border-transparent font-medium text-sm">
                            {user.socialMedia?.twitter || 'No link added'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-2">
                          <Instagram className="w-4 h-4" /> Instagram
                        </label>
                        {isEditing ? (
                          <input
                            value={editableUser.socialMedia?.instagram || ''}
                            onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                            placeholder="https://instagram.com/username"
                            className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all"
                          />
                        ) : (
                          <p className="p-3 bg-muted/20 rounded-xl border border-transparent font-medium text-sm">
                            {user.socialMedia?.instagram || 'No link added'}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1 flex items-center gap-2">
                          <Linkedin className="w-4 h-4" /> LinkedIn
                        </label>
                        {isEditing ? (
                          <input
                            value={editableUser.socialMedia?.linkedin || ''}
                            onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all"
                          />
                        ) : (
                          <p className="p-3 bg-muted/20 rounded-xl border border-transparent font-medium text-sm">
                            {user.socialMedia?.linkedin || 'No link added'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
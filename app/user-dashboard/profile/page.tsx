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
} from "lucide-react";

// Import your navigation components
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";

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
  points?: number;
  socialMedia?: SocialMedia;
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [user, setUser] = useState<UserProfile>({
    id: "USR-001",
    name: "John Doe",
    username: "johndoe",
    email: "johndoe@email.com",
    role: "user",
    image: null,
    points: 1250,
    socialMedia: {
      twitter: null,
      instagram: null,
      linkedin: null,
    },
  });

  const [editableUser, setEditableUser] = useState<UserProfile>(user);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    // Brief loading state to match dashboard behavior
    const timer = setTimeout(() => setIsLoading(false), 500);
    setEditableUser(user);
    setAvatarPreview(user.image || null);
    return () => clearTimeout(timer);
  }, [user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setUser({ ...editableUser, image: avatarPreview });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableUser(user);
    setAvatarPreview(user.image || null);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
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
                      <Upload className="w-4 h-4 text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleFileUpload}
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
                    {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                      <button key={i} className="p-2 rounded-lg bg-muted hover:text-primary transition-colors">
                        <Icon className="w-5 h-5" />
                      </button>
                    ))}
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
                        className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 active:scale-[0.98] transition-all flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save Changes
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
                      <input
                        value={editableUser.username}
                        onChange={(e) =>
                          setEditableUser({ ...editableUser, username: e.target.value })
                        }
                        className="w-full p-3 bg-muted/50 border border-border rounded-xl focus:ring-2 ring-primary/20 outline-none transition-all"
                      />
                    ) : (
                      <p className="p-3 bg-muted/20 rounded-xl border border-transparent font-medium">@{user.username}</p>
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
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
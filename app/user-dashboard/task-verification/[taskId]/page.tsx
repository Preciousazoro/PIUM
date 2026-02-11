"use client";

import { useState, useRef, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Upload, CheckCircle2, Loader2, Info, ArrowLeft } from "lucide-react";
import { TaskStateManager } from "@/lib/taskState";
import { toast } from "sonner";

// Navigation Import
import UserSidebar from "@/components/user-dashboard/UserSidebar";
import UserHeader from "@/components/user-dashboard/UserHeader";
import { UserDashboardSkeleton } from "@/components/ui/LoadingSkeleton";

export default function TaskVerificationPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const taskTitle = searchParams.get("title") || "Task";
  const reward = searchParams.get("reward") || "0";
  const category = searchParams.get("category") || "Other";
  const taskDescription = searchParams.get("description") || "";
  const taskUrl = searchParams.get("url") || "";

  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Check if task is started
  useEffect(() => {
    if (taskId) {
      const isStarted = TaskStateManager.isTaskStarted(taskId as string);
      
      if (!isStarted) {
        toast.error("You must start the task first before submitting proof.", {
          duration: 3000,
          action: {
            label: "Go to Dashboard",
            onClick: () => router.push("/user-dashboard/dashboard")
          }
        });
        
        // Redirect after a short delay to allow user to see the toast
        const redirectTimer = setTimeout(() => {
          router.push("/user-dashboard/dashboard");
        }, 1000);
        
        return () => clearTimeout(redirectTimer);
      }
    }
  }, [taskId, router]);

  const onChooseFile = () => fileInputRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!taskId) return;
    
    // Double-check that task is still started before submission
    if (!TaskStateManager.isTaskStarted(taskId as string)) {
      toast.error("Task must be started before submitting proof.");
      router.push("/user-dashboard/dashboard");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Upload file if provided
      let proofUrl = '';
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          proofUrl = uploadData.url;
        }
      }

      // Submit task proof to API
      const submissionData = {
        taskId,
        proofUrls: proofUrl ? [proofUrl] : [],
        proofLink: taskUrl,
        notes: description
      };
      
      console.log('Sending submission data:', submissionData);
      
      const response = await fetch('/api/tasks/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Submission error response:', errorData);
        throw new Error(errorData.error || 'Failed to submit proof');
      }

      const data = await response.json();
      console.log('Submission successful:', data);
      
      // Update task state to submitted
      TaskStateManager.updateTaskState(taskId as string, 'submitted');
      
      toast.success("Proof submitted successfully! You'll receive your reward after verification.");
      
      // Redirect back to dashboard after a short delay
      setTimeout(() => {
        router.push("/user-dashboard/dashboard");
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting proof:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit proof. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (isLoading) {
    return <UserDashboardSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* 1. SIDEBAR */}
      <UserSidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* 2. HEADER */}
        <UserHeader />

        {/* 3. MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Breadcrumb/Navigation Info */}
            <header className="space-y-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={goBack}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </button>
                <h1 className="text-3xl font-bold tracking-tight">
                  Submit Proof
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold border border-primary/20">
                   {taskTitle}
                </span>
                <span className="text-muted-foreground font-mono">ID: {String(taskId)}</span>
                <span className="text-green-500 font-bold">+{reward} TP Reward</span>
                <span className="px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs">
                  {category}
                </span>
              </div>
              {taskDescription && (
                <div className="p-4 bg-muted/30 rounded-2xl border border-border">
                  <p className="text-sm text-muted-foreground">{taskDescription}</p>
                </div>
              )}
            </header>

            {/* Submission Form */}
            <form 
              onSubmit={onSubmit} 
              className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8"
            >
              {/* Description Field */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Proof Details & Context
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Paste links, transaction IDs, or describe how you completed the task..."
                  className="w-full h-40 resize-none bg-muted/30 border border-border rounded-2xl p-4 text-foreground placeholder:text-muted-foreground focus:ring-2 ring-primary/20 outline-none transition-all"
                />
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/50">
                    <Info className="w-4 h-4 text-primary shrink-0" />
                    <p>Make sure to provide clear evidence. Incorrect or fake submissions may lead to account suspension.</p>
                </div>
              </div>

              {/* File Upload Field */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  Screenshot / Image Proof
                </label>
                <div
                  className={`relative group rounded-2xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-8 cursor-pointer ${
                    file 
                    ? "border-green-500/50 bg-green-500/5" 
                    : "border-border bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                  }`}
                  onClick={onChooseFile}
                >
                  {file ? (
                    <div className="text-center space-y-2">
                      <div className="bg-green-500 text-white p-2 rounded-full inline-block">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-sm text-foreground">{file.name}</p>
                      <p className="text-xs text-muted-foreground">Click to replace image</p>
                    </div>
                  ) : (
                    <div className="text-center space-y-3">
                      <div className="bg-primary/10 text-primary p-3 rounded-2xl inline-block group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Click to upload screenshot</p>
                        <p className="text-xs text-muted-foreground mt-1">Supports PNG, JPG (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-linear-to-r from-green-500 to-purple-600 text-white font-black text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all focus:outline-none focus:ring-2 ring-primary/40 ring-offset-2 ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Submitting...
                  </>
                ) : (
                  'Submit for Verification'
                )}
              </button>
            </form>

            <p className="text-center text-xs text-muted-foreground">
                Average review time: <span className="text-foreground font-medium">12-24 hours</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

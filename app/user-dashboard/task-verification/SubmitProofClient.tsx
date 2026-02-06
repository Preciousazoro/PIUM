"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, FilePlus, FileText, UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { TaskStateManager } from "@/lib/taskState";
import { toast } from "sonner";

export default function SubmitProofClient() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get("taskId") || "";
  const taskTitle = searchParams.get("title") || "Task";
  const reward = searchParams.get("reward") || "0";

  const [description, setDescription] = useState("");
  const [proofLink, setProofLink] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [extraFile, setExtraFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [task, setTask] = useState<any | null>(null);
  const [loadingTask, setLoadingTask] = useState<boolean>(false);
  const [started, setStarted] = useState<boolean>(false);

  const screenshotInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check if task is started using TaskStateManager
    setStarted(TaskStateManager.isTaskStarted(taskId));
  }, [taskId]);

  useEffect(() => {
    if (screenshot && screenshot.type.startsWith("image/")) {
      const url = URL.createObjectURL(screenshot);
      setScreenshotPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [screenshot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!started || !proofLink) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Upload screenshot if provided
      let proofUrl = '';
      if (screenshot) {
        const formData = new FormData();
        formData.append('file', screenshot);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          proofUrl = uploadData.url;
        }
      }

      // Submit task proof
      const submissionData = {
        taskId,
        proofUrls: proofUrl ? [proofUrl] : [],
        proofLink,
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
      TaskStateManager.updateTaskState(taskId, 'submitted');
      
      // Show success message
      setShowSuccess(true);
      
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit proof. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Task Info Card */}
      <section className="bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 block">Active Task</span>
            <h2 className="text-2xl font-black">{taskTitle}</h2>
          </div>
          <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20">
            <span className="text-xl font-bold text-primary">+{reward} TP</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Please ensure all links are public and screenshots clearly show your username/completion status.
        </p>
      </section>

      {/* Proof Form */}
      <section className="bg-card border border-border rounded-3xl p-8 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Submission Details</h3>
        
        {!started && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-3 items-center text-amber-500 text-sm">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium">You must click "Start Task" on the task page before submitting proof.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Proof Link (Required)</label>
            <input
              type="url"
              required
              value={proofLink}
              onChange={(e) => setProofLink(e.target.value)}
              placeholder="https://twitter.com/your-post..."
              className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Additional Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any extra info for the reviewer..."
              className="w-full h-24 bg-muted/30 border border-border rounded-xl px-4 py-3 outline-none focus:ring-2 ring-primary/20 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground ml-1">Screenshot Proof</label>
            <div
              onClick={() => screenshotInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer"
            >
              {screenshotPreview ? (
                <img src={screenshotPreview} alt="Preview" className="mx-auto max-h-48 rounded-xl shadow-lg" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="w-10 h-10 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload screenshot</p>
                </div>
              )}
              <input 
                ref={screenshotInputRef}
                type="file" 
                className="hidden" 
                onChange={(e) => setScreenshot(e.target.files?.[0] || null)} 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !started || !proofLink}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-purple-600 text-white font-black text-lg hover:opacity-90 disabled:opacity-50 transition-all flex justify-center items-center"
          >
            {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Proof"}
          </button>
        </form>
      </section>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black mb-2">Submitted!</h3>
            <p className="text-muted-foreground mb-8">Your proof is now being reviewed by our team.</p>
            <button
              onClick={() => window.location.href = "/user-dashboard"}
              className="w-full py-4 bg-foreground text-background font-bold rounded-2xl hover:opacity-90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
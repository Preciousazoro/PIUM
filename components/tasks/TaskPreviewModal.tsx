"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Clock, CheckCircle2, Loader2, Trophy, Info } from "lucide-react";
import { Task } from "@/lib/taskState";
import { TaskStateManager } from "@/lib/taskState";
import { StatusBadge } from "./StatusBadge";
import { toast } from "sonner";

interface TaskPreviewModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskPreviewModal({ task, isOpen, onClose }: TaskPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  if (!task) return null;

  const taskState = TaskStateManager.getTaskState(task.id);
  const isAvailable = TaskStateManager.isTaskAvailable(task.id);
  const isStarted = TaskStateManager.isTaskStarted(task.id);
  const isSubmitted = TaskStateManager.isTaskSubmitted(task.id);
  const isApproved = TaskStateManager.isTaskApproved(task.id);
  const isRejected = TaskStateManager.isTaskRejected(task.id);
  const isCompleted = TaskStateManager.isTaskCompleted(task.id);

  const getCategoryColor = (category: Task['category']) => {
    switch (category) {
      case 'social':
        return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
      case 'content':
        return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'commerce':
        return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const handleStartTask = async () => {
    if (!TaskStateManager.canStartTask(task.id)) return;
    
    setIsLoading(true);
    
    try {
      // Update task state
      TaskStateManager.updateTaskState(task.id, 'started');
      
      // Show success toast
      toast.success("Task started! Complete it and submit your proof.", {
        duration: 3000,
      });
      
      // Open task URL in new tab after a short delay
      setTimeout(() => {
        window.open(task.url, "_blank");
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error("Failed to start task. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmitProof = () => {
    if (!TaskStateManager.canSubmitTask(task.id) && !TaskStateManager.canResubmitTask(task.id)) return;
    
    // Redirect to task verification page with task details
    const params = new URLSearchParams({
      title: task.title,
      reward: task.reward.toString(),
      category: task.category,
      description: task.description,
      url: task.url,
    });
    
    toast.info("Redirecting to proof submission...", {
      duration: 2000,
    });
    
    setTimeout(() => {
      window.location.href = `/user-dashboard/task-verification/${task.id}?${params.toString()}`;
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ 
              duration: 0.3, 
              ease: [0.4, 0, 0.2, 1]
            }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl bg-gradient-to-br from-card/95 to-card/90 backdrop-blur-xl border-border rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="relative p-6 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                    <StatusBadge status={taskState.status} />
                  </div>
                  
                  <h2 className="text-2xl font-bold mb-2 text-foreground">{task.title}</h2>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-chart-1 font-bold">
                      <Trophy className="w-4 h-4" />
                      {task.reward} TP
                    </div>
                    <div className="text-muted-foreground">
                      Task ID: {task.id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Task Description
                </h3>
                <p className="text-foreground leading-relaxed">
                  {task.description}
                </p>
              </div>
              
              {/* Task URL */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Task Link
                </h3>
                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-2xl border border-border">
                  <ExternalLink className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm text-foreground truncate flex-1">
                    {task.url}
                  </span>
                  <button
                    onClick={() => window.open(task.url, "_blank")}
                    className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                  >
                    Visit
                  </button>
                </div>
              </div>
              
              {/* Instructions */}
              <div className="flex items-start gap-3 p-4 bg-chart-2/10 border border-chart-2/20 rounded-2xl">
                <Info className="w-5 h-5 text-chart-2 shrink-0 mt-0.5" />
                <div className="text-sm text-chart-2">
                  <p className="font-medium mb-1">How to complete this task:</p>
                  <ol className="list-decimal list-inside space-y-1 text-chart-2/80">
                    <li>Click "Start Task" to begin</li>
                    <li>Complete the task on the external website</li>
                    <li>Return here and submit your proof</li>
                  </ol>
                </div>
              </div>

              {/* Status Information */}
              {(isSubmitted || isRejected) && (
                <div className="p-4 bg-muted/50 rounded-2xl border border-border">
                  <div className="flex items-center gap-2 text-sm">
                    {isSubmitted && (
                      <>
                        <Clock className="w-4 h-4 text-chart-3" />
                        <span className="text-chart-3">Your proof is being reviewed</span>
                      </>
                    )}
                    {isRejected && (
                      <>
                        <X className="w-4 h-4 text-destructive" />
                        <span className="text-destructive">Your proof was rejected. You can resubmit.</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Actions */}
            <div className="p-6 border-t border-border bg-muted/30">
              <div className="flex gap-3">
                <button
                  onClick={handleStartTask}
                  disabled={!TaskStateManager.canStartTask(task.id) || isLoading}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                    !TaskStateManager.canStartTask(task.id) || isLoading
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Starting...
                    </>
                  ) : isStarted ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 inline mr-2" />
                      Task Started
                    </>
                  ) : (
                    'Start Task'
                  )}
                </button>
                
                <button
                  onClick={handleSubmitProof}
                  disabled={!TaskStateManager.canSubmitTask(task.id) && !TaskStateManager.canResubmitTask(task.id)}
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] ${
                    !TaskStateManager.canSubmitTask(task.id) && !TaskStateManager.canResubmitTask(task.id)
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-purple-600 text-white hover:from-green-600 hover:to-purple-700 hover:shadow-lg hover:shadow-green-500/25'
                  }`}
                >
                  {isRejected ? 'Resubmit Proof' : 'Submit Proof'}
                </button>
              </div>
              
              {!isStarted && !isSubmitted && !isRejected && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Start the task first to enable proof submission
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

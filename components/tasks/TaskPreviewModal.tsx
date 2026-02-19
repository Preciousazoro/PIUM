"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Clock, CheckCircle2, Loader2, Trophy, Info } from "lucide-react";
import { TaskDocument } from "@/types/shared-task";
import { StatusBadge } from "./StatusBadge";
import { toast } from "sonner";
import { TaskStateManager } from "@/lib/taskState";

interface TaskPreviewModalProps {
  task: TaskDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskPreviewModal({ task, isOpen, onClose }: TaskPreviewModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  if (!task) return null;

  const getCategoryColor = (category: 'social' | 'content' | 'commerce') => {
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
    setIsLoading(true);
    
    try {
      // Mark task as started using TaskStateManager
      TaskStateManager.updateTaskState(task._id, 'started');
      
      // Show success toast
      toast.success("Task started! Complete it and submit your proof.", {
        duration: 3000,
      });
      
      // Open task URL in new tab after a short delay
      setTimeout(() => {
        window.open(task.taskLink || task.alternateUrl || '', "_blank");
        setIsLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('Error starting task:', error);
      toast.error("Failed to start task. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmitProof = () => {
    // Check if task is started before allowing submission
    if (!TaskStateManager.isTaskStarted(task._id)) {
      toast.error("Please start the task first before submitting proof.");
      return;
    }
    
    // Redirect to task verification page with task details
    const params = new URLSearchParams({
      taskId: task._id,
      title: task.title,
      description: task.description,
      reward: task.rewardPoints.toString(),
      category: task.category,
      url: task.taskLink || task.alternateUrl || ''
    });
    
    toast.info("Redirecting to proof submission...", {
      duration: 2000,
    });
    
    setTimeout(() => {
      window.location.href = `/user-dashboard/task-verification/${task._id}?${params.toString()}`;
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
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
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
            className="fixed inset-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] bg-linear-to-br from-card/95 to-card/90 backdrop-blur-xl border-border rounded-t-3xl md:rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="relative p-4 md:p-6 border-b border-border bg-linear-to-r from-primary/10 to-primary/5 shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
              
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 pr-8">
                  <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                    <span className={`px-2 md:px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(task.category)}`}>
                      {task.category}
                    </span>
                    <StatusBadge status="available" />
                  </div>
                  
                  <h2 className="text-lg md:text-2xl font-bold mb-2 text-foreground">{task.title}</h2>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                    <div className="flex items-center gap-1 text-chart-1 font-bold">
                      <Trophy className="w-4 h-4" />
                      {task.rewardPoints} TP
                    </div>
                    <div className="text-muted-foreground text-xs sm:text-sm">
                      Task ID: {task._id}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto overflow-x-hidden min-h-0 max-h-[50vh] md:max-h-[60vh]">
              {/* Custom scrollbar styles */}
              <style jsx>{`
                div::-webkit-scrollbar {
                  width: 6px;
                }
                div::-webkit-scrollbar-track {
                  background: rgba(0, 0, 0, 0.1);
                  border-radius: 3px;
                }
                div::-webkit-scrollbar-thumb {
                  background: rgba(0, 0, 0, 0.3);
                  border-radius: 3px;
                }
                div::-webkit-scrollbar-thumb:hover {
                  background: rgba(0, 0, 0, 0.5);
                }
              `}</style>
              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Description
                </h3>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              {task.instructions && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Instructions
                  </h3>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {task.instructions}
                    </p>
                  </div>
                </div>
              )}

              {/* Validation Type */}
              {task.validationType && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Validation Type
                  </h3>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <p className="text-sm text-muted-foreground font-medium">
                      {task.validationType}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Task URL */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Task Link
                </h3>
                <div className="p-4 bg-card rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm text-muted-foreground truncate flex-1">
                      {task.taskLink || task.alternateUrl || 'No URL provided'}
                    </span>
                    <button
                      onClick={() => window.open(task.taskLink || task.alternateUrl || '', "_blank")}
                      className="text-primary hover:text-primary/80 text-sm font-medium transition-colors"
                    >
                      Visit
                    </button>
                  </div>
                </div>
              </div>

              {/* Deadline */}
              {task.deadline && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">
                    Deadline
                  </h3>
                  <div className="p-4 bg-card rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground font-medium">
                          {new Date(task.deadline).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(task.deadline).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* How to Complete */}
              <div className="p-4 bg-card rounded-xl border border-border">
                <div className="flex items-start gap-3">
                  <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      How to Complete
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Click "Start Task" to begin</li>
                      <li>Complete the task on the external website</li>
                      <li>Return here and submit your proof</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="p-4 md:p-6 border-t border-border bg-card shrink-0">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleStartTask}
                  disabled={isLoading}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                    isLoading
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Starting...
                    </>
                  ) : (
                    'Start Task'
                  )}
                </button>
                
                <button
                  onClick={handleSubmitProof}
                  className="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all bg-gradient-to-r from-green-500 to-purple-500 text-white hover:from-green-600 hover:to-purple-600"
                >
                  Submit Proof
                </button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center mt-3">
                Start task first to enable proof submission
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

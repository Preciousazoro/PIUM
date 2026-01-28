"use client";

import { motion } from "framer-motion";
import { ExternalLink, FileText, Trophy } from "lucide-react";
import { Task } from "@/lib/taskState";
import { TaskStateManager } from "@/lib/taskState";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: Task;
  onClick: (task: Task) => void;
  onStartTask: (task: Task) => void;
  onSubmitProof: (task: Task) => void;
}

export function TaskCard({ task, onClick, onStartTask, onSubmitProof }: TaskCardProps) {
  const taskState = TaskStateManager.getTaskState(task.id);
  const isAvailable = TaskStateManager.isTaskAvailable(task.id);
  const isStarted = TaskStateManager.isTaskStarted(task.id);
  const isSubmitted = TaskStateManager.isTaskSubmitted(task.id);
  const isApproved = TaskStateManager.isTaskApproved(task.id);
  const isRejected = TaskStateManager.isTaskRejected(task.id);
  const isCompleted = TaskStateManager.isTaskCompleted(task.id);
  const isActive = TaskStateManager.isTaskActive(task.id);

  const getCategoryColor = (category: Task['category']) => {
    switch (category) {
      case 'Social':
        return 'bg-chart-2/20 text-chart-2 border-chart-2/30';
      case 'Content':
        return 'bg-chart-3/20 text-chart-3 border-chart-3/30';
      case 'Referral':
        return 'bg-chart-1/20 text-chart-1 border-chart-1/30';
      case 'Commerce':
        return 'bg-chart-4/20 text-chart-4 border-chart-4/30';
      default:
        return 'bg-muted/20 text-muted-foreground border-muted/30';
    }
  };

  const handleCardClick = () => {
    if (isActive) {
      onClick(task);
    }
  };

  const handleStartTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (TaskStateManager.canStartTask(task.id)) {
      onStartTask(task);
    }
  };

  const handleSubmitProof = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (TaskStateManager.canSubmitTask(task.id) || TaskStateManager.canResubmitTask(task.id)) {
      onSubmitProof(task);
    }
  };

  return (
    <motion.div
      whileHover={isActive ? { y: -4, scale: 1.02 } : {}}
      whileTap={isActive ? { scale: 0.98 } : {}}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={handleCardClick}
      className={`
        relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300
        ${isActive ? 'cursor-pointer' : 'cursor-default'}
        ${isCompleted 
          ? 'opacity-40 grayscale' 
          : isSubmitted 
            ? 'opacity-80' 
            : 'opacity-100'
        }
        ${isActive 
          ? 'bg-gradient-to-br from-card/80 to-card/60 border-border shadow-lg hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20' 
          : 'bg-gradient-to-br from-card/60 to-card/40 border-border/50 shadow-md'
        }
      `}
    >
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      {/* Card content */}
      <div className="relative p-6 space-y-4">
        {/* Header with category and status */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(task.category)}`}>
            {task.category}
          </span>
          <StatusBadge status={taskState.status} />
        </div>

        {/* Task title and description */}
        <div className="space-y-2">
          <h3 className={`font-bold text-lg leading-tight ${
            isCompleted ? 'text-muted-foreground' : 'text-foreground'
          }`}>
            {task.title}
          </h3>
          <p className={`text-sm leading-relaxed line-clamp-2 ${
            isCompleted ? 'text-muted-foreground/60' : 'text-muted-foreground'
          }`}>
            {task.description}
          </p>
        </div>

        {/* Proof requirement and reward */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <FileText className={`w-4 h-4 ${isCompleted ? 'text-muted-foreground/40' : 'text-muted-foreground'}`} />
            <span className={`text-xs ${isCompleted ? 'text-muted-foreground/40' : 'text-muted-foreground'}`}>
              Proof required
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className={`w-4 h-4 ${isCompleted ? 'text-muted-foreground/40' : 'text-chart-1'}`} />
            <span className={`font-bold ${isCompleted ? 'text-muted-foreground/40' : 'text-foreground'}`}>
              {task.reward} TP
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 pt-2">
          {/* Row 1: Start Task and View Details */}
          <div className="grid grid-cols-2 gap-2">
            {/* Start Task Button */}
            <Button
              onClick={handleStartTask}
              disabled={!TaskStateManager.canStartTask(task.id)}
              variant="secondary"
              size="sm"
              className="h-9 text-xs font-bold"
            >
              {isStarted ? 'Started' : 'Start Task'}
            </Button>

            {/* View Details Button */}
            {isActive && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onClick(task);
                }}
                variant="outline"
                size="sm"
                className="h-9 text-xs font-bold"
              >
                View Details
              </Button>
            )}
          </div>

          {/* Row 2: Submit Proof Button */}
          {(isStarted || isRejected) && (
            <Button
              onClick={handleSubmitProof}
              disabled={!TaskStateManager.canSubmitTask(task.id) && !TaskStateManager.canResubmitTask(task.id)}
              variant="default"
              size="lg"
              className="w-full h-12 text-sm font-bold bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-600 hover:to-purple-700 hover:shadow-lg hover:shadow-green-500/25 transition-all duration-200 disabled:opacity-50 disabled:shadow-none disabled:from-muted disabled:to-muted"
            >
              {isRejected ? 'Resubmit Proof' : 'Submit Proof'}
            </Button>
          )}

          {/* Completed Badge */}
          {isCompleted && (
            <div className="w-full py-3 px-4 rounded-xl text-sm font-bold bg-chart-1/20 text-chart-1 border border-chart-1/30 text-center">
              Completed ✓
            </div>
          )}
        </div>
      </div>

      {/* Hover glow effect for active tasks */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
    </motion.div>
  );
}

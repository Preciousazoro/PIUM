"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { TaskDocument } from "@/types/shared-task";
import { TaskStateManager } from "@/lib/taskState";
import { toast } from "sonner";

interface TaskCardProps {
  task: TaskDocument;
  onClick: (task: TaskDocument) => void;
  onStartTask: (task: TaskDocument) => void;
  onSubmitProof: (task: TaskDocument) => void;
}

export function TaskCard({
  task,
  onClick,
  onStartTask,
  onSubmitProof,
}: TaskCardProps) {
  const isPending = task.userTaskStatus === 'pending';
  const isApproved = task.userTaskStatus === 'approved';
  const isRejected = task.userTaskStatus === 'rejected';
  const isAvailable = task.userTaskStatus === 'available';
  const categoryStyles = {
    social: "from-pink-500/40 to-purple-500/40",
    content: "from-blue-500/40 to-cyan-500/40",
    commerce: "from-emerald-500/40 to-green-500/40",
  };

  return (
    <motion.div
      whileHover={{ y: isPending || isApproved ? 0 : -4 }}
      whileTap={{ scale: isPending || isApproved ? 1 : 0.98 }}
      onClick={() => !isPending && !isApproved && onClick(task)}
      className={`relative rounded-2xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-sm hover:shadow-xl transition-all overflow-hidden ${
        isPending ? 'opacity-50 cursor-not-allowed' : ''
      } ${isApproved ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      {/* Accent gradient strip */}
      <div
        className={`absolute left-0 top-0 h-full w-1 bg-gradient-to-b ${
          categoryStyles[task.category]
        }`}
      />

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {task.category}
            </span>
            <h3 className="text-lg font-bold leading-snug line-clamp-2">
              {task.title}
            </h3>
          </div>

          <StatusBadge status={task.userTaskStatus || 'available'} />
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {task.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between gap-4 pt-2">
          {/* Reward */}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
            <Trophy className="h-4 w-4" />
            {task.rewardPoints} TP
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isAvailable && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onStartTask(task);
                }}
                className="font-semibold"
              >
                Start
              </Button>
            )}

            {(isAvailable || isRejected) && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Check if task is started before allowing submission
                  if (TaskStateManager.isTaskStarted(task._id)) {
                    onSubmitProof(task);
                  } else {
                    toast.error("Please start the task first before submitting proof.");
                  }
                }}
                className="font-semibold bg-gradient-to-r from-green-500 to-purple-600 hover:from-green-600 hover:to-purple-700"
              >
                {isRejected ? 'Resubmit' : 'Submit'}
              </Button>
            )}

            {isPending && (
              <div className="flex items-center text-xs text-muted-foreground font-medium">
                Pending review
              </div>
            )}

            {isApproved && (
              <div className="flex items-center text-xs text-green-600 font-medium">
                Completed
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

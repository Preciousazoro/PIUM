"use client";

import { Clock, CheckCircle2, XCircle, AlertCircle, Timer } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'available':
        return {
          icon: null,
          text: 'Available',
          className: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
        };
      
      case 'started':
        return {
          icon: <Clock className="w-3 h-3" />,
          text: 'In Progress',
          className: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
        };
      
      case 'submitted':
        return {
          icon: <Timer className="w-3 h-3" />,
          text: 'Submitted',
          className: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
        };
      
      case 'pending':
        return {
          icon: <Clock className="w-3 h-3" />,
          text: 'Pending review',
          className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        };
      
      case 'approved':
        return {
          icon: <CheckCircle2 className="w-3 h-3" />,
          text: 'Completed',
          className: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
        };
      
      case 'rejected':
        return {
          icon: <XCircle className="w-3 h-3" />,
          text: 'Rejected',
          className: 'bg-destructive/10 text-destructive border-destructive/20',
        };
      
      case 'completed':
        return {
          icon: <CheckCircle2 className="w-3 h-3" />,
          text: 'Completed',
          className: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
        };
      
      default:
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          text: 'Unknown',
          className: 'bg-muted/10 text-muted-foreground border-muted/20',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-medium ${config.className} ${className}`}>
      {config.icon}
      {config.text}
    </div>
  );
}
